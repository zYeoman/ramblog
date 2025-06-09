package store

import (
	"bufio"
	"bytes"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"gopkg.in/yaml.v3"
)

// MemoStore 处理备忘录的存储和检索
type MemoStore struct {
	dataDir        string
	mutex          sync.RWMutex
	maxNumberCache map[string]int // 日期到最大序号的映射
}

// NewMemoStore 创建一个新的备忘录存储
func NewMemoStore(dataDir string) (*MemoStore, error) {
	// 确保memos目录存在
	memosDir := filepath.Join(dataDir, "memos")
	if err := os.MkdirAll(memosDir, 0755); err != nil {
		return nil, fmt.Errorf("无法创建memos目录: %w", err)
	}

	store := &MemoStore{
		dataDir:        dataDir,
		maxNumberCache: make(map[string]int),
	}

	// 初始化时扫描一次目录，构建日期到最大序号的映射
	if err := store.initMaxNumberCache(); err != nil {
		return nil, fmt.Errorf("初始化序号缓存失败: %w", err)
	}

	return store, nil
}

// 初始化日期到最大序号的映射
func (s *MemoStore) initMaxNumberCache() error {
	// 读取目录中的所有文件
	entries, err := os.ReadDir(s.getMemosDir())
	if err != nil {
		return fmt.Errorf("读取memos目录失败: %w", err)
	}

	// 正则表达式，用于匹配ID格式
	re := regexp.MustCompile(`^(\d{4}-\d{2}-\d{2})-(\d+)\.md$`)

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		matches := re.FindStringSubmatch(entry.Name())
		if len(matches) > 2 {
			date := matches[1]
			num, err := strconv.Atoi(matches[2])
			if err != nil {
				continue
			}

			// 更新日期对应的最大序号
			if num > s.maxNumberCache[date] {
				s.maxNumberCache[date] = num
			}
		}
	}

	return nil
}

// 获取memos目录的路径
func (s *MemoStore) getMemosDir() string {
	return filepath.Join(s.dataDir, "memos")
}

// 获取特定memo文件的路径
func (s *MemoStore) getMemoPath(id string) string {
	return filepath.Join(s.getMemosDir(), id+".md")
}

// 生成新的备忘录ID，格式为 YYYY-MM-DD-Number
func (s *MemoStore) generateID() (string, error) {
	now := time.Now()
	dateStr := now.Format("2006-01-02")

	// 获取当前日期的最大序号，如果不存在则为0
	maxNumber := s.maxNumberCache[dateStr]

	// 新序号是当前最大序号+1
	newNumber := maxNumber + 1

	// 更新缓存
	s.maxNumberCache[dateStr] = newNumber

	// 生成新ID
	newID := fmt.Sprintf("%s-%d", dateStr, newNumber)

	// 检查文件是否已存在（以防万一）
	if _, err := os.Stat(s.getMemoPath(newID)); err == nil {
		// 文件已存在，递归调用生成新ID
		return s.generateID()
	}

	return newID, nil
}

// CreateMemo 创建一个新的备忘录
func (s *MemoStore) CreateMemo(memo *Memo) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// 生成新的ID
	id, err := s.generateID()
	if err != nil {
		return fmt.Errorf("生成备忘录ID失败: %w", err)
	}
	memo.ID = id

	// 设置时间戳
	now := time.Now()
	memo.CreatedAt = now
	memo.UpdatedAt = now

	// 保存到文件
	return s.saveMemoToFile(memo)
}

// GetMemo 通过ID获取备忘录
func (s *MemoStore) GetMemo(id string) (*Memo, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	return s.readMemoFromFile(id)
}

// UpdateMemo 更新现有备忘录
func (s *MemoStore) UpdateMemo(id string, updates *Memo) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// 先读取现有的memo
	memo, err := s.readMemoFromFile(id)
	if err != nil {
		return err
	}

	// 应用更新
	if updates.Title != "" {
		memo.Title = updates.Title
	}
	if updates.Tags != nil {
		memo.Tags = updates.Tags
	}
	if updates.Content != "" {
		memo.Content = updates.Content
	}

	// 更新时间戳
	memo.UpdatedAt = time.Now()

	// 保存更新后的memo
	return s.saveMemoToFile(memo)
}

// DeleteMemo 删除备忘录
func (s *MemoStore) DeleteMemo(id string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	memoPath := s.getMemoPath(id)
	if _, err := os.Stat(memoPath); os.IsNotExist(err) {
		return fmt.Errorf("备忘录不存在: %s", id)
	}

	// 从ID中提取日期
	parts := strings.Split(id, "-")
	if len(parts) >= 4 {
		dateStr := fmt.Sprintf("%s-%s-%s", parts[0], parts[1], parts[2])
		numStr := parts[3]
		num, err := strconv.Atoi(numStr)
		if err == nil && num == s.maxNumberCache[dateStr] {
			// 如果删除的是当天最大序号的memo，需要重新扫描该日期的所有memo
			s.updateMaxNumberForDate(dateStr)
		}
	}

	return os.Remove(memoPath)
}

// 更新指定日期的最大序号
func (s *MemoStore) updateMaxNumberForDate(dateStr string) {
	// 正则表达式，用于匹配特定日期的备忘录ID
	pattern := fmt.Sprintf("^%s-(\\d+)\\.md$", regexp.QuoteMeta(dateStr))
	re := regexp.MustCompile(pattern)

	// 读取目录中的所有文件
	entries, err := os.ReadDir(s.getMemosDir())
	if err != nil {
		// 出错时重置为0
		s.maxNumberCache[dateStr] = 0
		return
	}

	// 找出指定日期的最大序号
	maxNumber := 0
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		matches := re.FindStringSubmatch(entry.Name())
		if len(matches) > 1 {
			num, err := strconv.Atoi(matches[1])
			if err != nil {
				continue
			}

			if num > maxNumber {
				maxNumber = num
			}
		}
	}

	// 更新缓存
	s.maxNumberCache[dateStr] = maxNumber
}

// ListMemos 列出所有备忘录
func (s *MemoStore) ListMemos() ([]*Memo, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	var memos []*Memo

	// 读取memos目录中的所有文件
	err := filepath.WalkDir(s.getMemosDir(), func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		// 跳过目录和非.md文件
		if d.IsDir() || !strings.HasSuffix(d.Name(), ".md") {
			return nil
		}

		// 从文件名中提取ID
		id := strings.TrimSuffix(d.Name(), ".md")

		// 读取memo
		memo, err := s.readMemoFromFile(id)
		if err != nil {
			return fmt.Errorf("读取备忘录 %s 失败: %w", id, err)
		}

		memos = append(memos, memo)
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("列出备忘录失败: %w", err)
	}

	return memos, nil
}

// 从文件中读取memo
func (s *MemoStore) readMemoFromFile(id string) (*Memo, error) {
	memoPath := s.getMemoPath(id)

	// 检查文件是否存在
	if _, err := os.Stat(memoPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("备忘录不存在: %s", id)
	}

	// 读取文件内容
	data, err := os.ReadFile(memoPath)
	if err != nil {
		return nil, fmt.Errorf("读取备忘录文件失败: %w", err)
	}

	// 解析文件内容
	return parseMemoFile(data, id)
}

// 将memo保存到文件
func (s *MemoStore) saveMemoToFile(memo *Memo) error {
	// 创建文件内容
	content, err := formatMemoFile(memo)
	if err != nil {
		return fmt.Errorf("格式化备忘录失败: %w", err)
	}

	// 写入文件
	memoPath := s.getMemoPath(memo.ID)
	if err := os.WriteFile(memoPath, content, 0644); err != nil {
		return fmt.Errorf("写入备忘录文件失败: %w", err)
	}

	return nil
}

// 解析memo文件内容
func parseMemoFile(data []byte, id string) (*Memo, error) {
	// 检查YAML前置元数据分隔符
	const yamlSeparator = "---"
	
	scanner := bufio.NewScanner(bytes.NewReader(data))
	
	// 第一行必须是分隔符
	if !scanner.Scan() || scanner.Text() != yamlSeparator {
		return nil, errors.New("无效的memo文件格式: 缺少YAML前置元数据开始分隔符")
	}
	
	// 读取YAML内容直到下一个分隔符
	var yamlContent strings.Builder
	for scanner.Scan() {
		line := scanner.Text()
		if line == yamlSeparator {
			break
		}
		yamlContent.WriteString(line)
		yamlContent.WriteString("\n")
	}
	
	if scanner.Err() != nil {
		return nil, fmt.Errorf("读取YAML元数据失败: %w", scanner.Err())
	}
	
	// 解析YAML元数据
	var metadata MemoMetadata
	if err := yaml.Unmarshal([]byte(yamlContent.String()), &metadata); err != nil {
		return nil, fmt.Errorf("解析YAML元数据失败: %w", err)
	}
	
	// 读取剩余内容作为memo内容
	var content strings.Builder
	for scanner.Scan() {
		content.WriteString(scanner.Text())
		content.WriteString("\n")
	}
	
	if scanner.Err() != nil {
		return nil, fmt.Errorf("读取memo内容失败: %w", scanner.Err())
	}
	
	// 创建Memo对象
	return &Memo{
		ID:        metadata.ID,
		Title:     metadata.Title,
		Tags:      metadata.Tags,
		CreatedAt: metadata.CreatedAt,
		UpdatedAt: metadata.UpdatedAt,
		Content:   strings.TrimSpace(content.String()),
	}, nil
}

// 格式化memo为文件内容
func formatMemoFile(memo *Memo) ([]byte, error) {
	// 创建元数据
	metadata := MemoMetadata{
		ID:        memo.ID,
		Title:     memo.Title,
		Tags:      memo.Tags,
		CreatedAt: memo.CreatedAt,
		UpdatedAt: memo.UpdatedAt,
	}
	
	// 序列化元数据为YAML
	yamlData, err := yaml.Marshal(metadata)
	if err != nil {
		return nil, fmt.Errorf("序列化YAML元数据失败: %w", err)
	}
	
	// 组合文件内容
	var content strings.Builder
	content.WriteString("---\n")
	content.Write(yamlData)
	content.WriteString("---\n\n")
	content.WriteString(memo.Content)
	content.WriteString("\n")
	
	return []byte(content.String()), nil
} 
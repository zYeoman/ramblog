package store

import (
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"testing"
	"time"
)

func TestMemoStore(t *testing.T) {
	// 创建临时目录用于测试
	tempDir, err := os.MkdirTemp("", "memo-test")
	if err != nil {
		t.Fatalf("无法创建临时目录: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// 创建MemoStore实例
	store, err := NewMemoStore(tempDir)
	if err != nil {
		t.Fatalf("创建MemoStore失败: %v", err)
	}

	// 测试创建备忘录
	memo := &Memo{
		Title:   "测试备忘录",
		Tags:    []string{"测试", "示例"},
		Content: "这是一个测试备忘录的内容。\n\n包含**Markdown**格式。",
	}

	if err := store.CreateMemo(memo); err != nil {
		t.Fatalf("创建备忘录失败: %v", err)
	}

	// 验证ID已生成，且格式为YYYY-MM-DD-Number
	if memo.ID == "" {
		t.Fatal("创建备忘录后未生成ID")
	}
	
	// 验证ID格式
	pattern := `^\d{4}-\d{2}-\d{2}-\d+$`
	matched, err := regexp.MatchString(pattern, memo.ID)
	if err != nil {
		t.Fatalf("验证ID格式时出错: %v", err)
	}
	if !matched {
		t.Errorf("ID格式不匹配期望的YYYY-MM-DD-Number格式，实际为: %s", memo.ID)
	}

	// 验证时间戳已设置
	if memo.CreatedAt.IsZero() || memo.UpdatedAt.IsZero() {
		t.Fatal("创建备忘录后未设置时间戳")
	}

	// 测试获取备忘录
	retrievedMemo, err := store.GetMemo(memo.ID)
	if err != nil {
		t.Fatalf("获取备忘录失败: %v", err)
	}

	// 验证获取的备忘录内容正确
	if retrievedMemo.ID != memo.ID {
		t.Errorf("备忘录ID不匹配: 期望 %s, 实际 %s", memo.ID, retrievedMemo.ID)
	}
	if retrievedMemo.Title != memo.Title {
		t.Errorf("备忘录标题不匹配: 期望 %s, 实际 %s", memo.Title, retrievedMemo.Title)
	}
	if retrievedMemo.Content != memo.Content {
		t.Errorf("备忘录内容不匹配: 期望 %s, 实际 %s", memo.Content, retrievedMemo.Content)
	}
	if len(retrievedMemo.Tags) != len(memo.Tags) {
		t.Errorf("备忘录标签数量不匹配: 期望 %d, 实际 %d", len(memo.Tags), len(retrievedMemo.Tags))
	}

	// 测试创建第二个备忘录，验证序号递增
	memo2 := &Memo{
		Title:   "第二个测试备忘录",
		Tags:    []string{"测试"},
		Content: "这是第二个测试备忘录的内容。",
	}

	if err := store.CreateMemo(memo2); err != nil {
		t.Fatalf("创建第二个备忘录失败: %v", err)
	}

	// 检查第二个备忘录的ID是否正确递增
	datePrefix := time.Now().Format("2006-01-02")
	expectedPrefix := datePrefix + "-"
	
	if !strings.HasPrefix(memo.ID, expectedPrefix) || !strings.HasPrefix(memo2.ID, expectedPrefix) {
		t.Errorf("备忘录ID前缀不匹配当前日期，memo1: %s, memo2: %s, 期望前缀: %s", 
			memo.ID, memo2.ID, expectedPrefix)
	}
	
	// 检查序号是否递增
	num1 := strings.TrimPrefix(memo.ID, expectedPrefix)
	num2 := strings.TrimPrefix(memo2.ID, expectedPrefix)
	n1, _ := strconv.Atoi(num1)
	n2, _ := strconv.Atoi(num2)
	if n2 != n1+1 {
		t.Errorf("备忘录序号未正确递增，memo1: %d, memo2: %d", n1, n2)
	}

	// 测试更新备忘录
	updates := &Memo{
		Title:   "更新后的标题",
		Content: "这是更新后的内容。",
	}

	// 记录更新前的时间
	beforeUpdate := time.Now()
	time.Sleep(10 * time.Millisecond) // 确保时间戳有差异

	if err := store.UpdateMemo(memo.ID, updates); err != nil {
		t.Fatalf("更新备忘录失败: %v", err)
	}

	// 获取更新后的备忘录
	updatedMemo, err := store.GetMemo(memo.ID)
	if err != nil {
		t.Fatalf("获取更新后的备忘录失败: %v", err)
	}

	// 验证更新是否成功
	if updatedMemo.Title != updates.Title {
		t.Errorf("更新后的标题不匹配: 期望 %s, 实际 %s", updates.Title, updatedMemo.Title)
	}
	if updatedMemo.Content != updates.Content {
		t.Errorf("更新后的内容不匹配: 期望 %s, 实际 %s", updates.Content, updatedMemo.Content)
	}
	if !updatedMemo.UpdatedAt.After(beforeUpdate) {
		t.Error("更新时间戳未更新")
	}

	// 测试列出所有备忘录
	memos, err := store.ListMemos()
	if err != nil {
		t.Fatalf("列出备忘录失败: %v", err)
	}

	if len(memos) != 2 {
		t.Errorf("备忘录数量不匹配: 期望 2, 实际 %d", len(memos))
	}

	// 测试删除备忘录
	if err := store.DeleteMemo(memo.ID); err != nil {
		t.Fatalf("删除备忘录失败: %v", err)
	}

	// 验证备忘录已删除
	_, err = store.GetMemo(memo.ID)
	if err == nil {
		t.Fatal("备忘录应该已被删除，但仍然可以获取")
	}

	// 再次列出所有备忘录，应该只剩一个
	memos, err = store.ListMemos()
	if err != nil {
		t.Fatalf("列出备忘录失败: %v", err)
	}

	if len(memos) != 1 {
		t.Errorf("删除后备忘录数量应为1，实际为 %d", len(memos))
	}

	// 测试删除最大序号的备忘录后，缓存是否正确更新
	// 创建第三个备忘录
	memo3 := &Memo{
		Title:   "第三个测试备忘录",
		Content: "这是第三个测试备忘录的内容。",
	}

	if err := store.CreateMemo(memo3); err != nil {
		t.Fatalf("创建第三个备忘录失败: %v", err)
	}

	// 检查序号是否正确（应该是2+1=3，因为memo1已删除）
	num3 := strings.TrimPrefix(memo3.ID, expectedPrefix)
	n3, _ := strconv.Atoi(num3)
	if n3 != n2+1 {
		t.Errorf("删除后新备忘录序号不正确，memo2: %d, memo3: %d", n2, n3)
	}

	// 删除最大序号的备忘录
	if err := store.DeleteMemo(memo3.ID); err != nil {
		t.Fatalf("删除第三个备忘录失败: %v", err)
	}

	// 创建第四个备忘录，检查序号是否正确（应该是2+1=3，与之前的memo3相同）
	memo4 := &Memo{
		Title:   "第四个测试备忘录",
		Content: "这是第四个测试备忘录的内容。",
	}

	if err := store.CreateMemo(memo4); err != nil {
		t.Fatalf("创建第四个备忘录失败: %v", err)
	}

	num4 := strings.TrimPrefix(memo4.ID, expectedPrefix)
	n4, _ := strconv.Atoi(num4)
	if n4 != n3 {
		t.Errorf("删除最大序号备忘录后，新备忘录序号不正确，期望: %d, 实际: %d", n3, n4)
	}
} 
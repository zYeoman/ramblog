package store

import (
	"time"
)

// Memo 表示一个备忘录
type Memo struct {
	ID        string    `json:"id"`        // 唯一标识符
	Title     string    `json:"title"`     // 标题
	Tags      []string  `json:"tags"`      // 标签列表
	CreatedAt time.Time `json:"createdAt"` // 创建时间
	UpdatedAt time.Time `json:"updatedAt"` // 更新时间
	Content   string    `json:"content"`   // 内容（Markdown格式）
}

// MemoMetadata 表示备忘录的元数据（存储在YAML头部）
type MemoMetadata struct {
	ID        string    `yaml:"id"`
	Title     string    `yaml:"title"`
	Tags      []string  `yaml:"tags"`
	CreatedAt time.Time `yaml:"created_at"`
	UpdatedAt time.Time `yaml:"updated_at"`
} 
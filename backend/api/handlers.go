package api

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"ramblog-app/backend/store"
)

// MemoHandler 处理与备忘录相关的API请求
type MemoHandler struct {
	store *store.MemoStore
}

// NewMemoHandler 创建一个新的备忘录处理程序
func NewMemoHandler(store *store.MemoStore) *MemoHandler {
	return &MemoHandler{
		store: store,
	}
}

// RegisterRoutes 注册所有API路由
func RegisterRoutes(r *gin.RouterGroup, store *store.MemoStore) {
	handler := NewMemoHandler(store)

	// 备忘录路由
	memos := r.Group("/memos")
	{
		memos.GET("", handler.ListMemos)
		memos.POST("", handler.CreateMemo)
		memos.GET("/:id", handler.GetMemo)
		memos.PUT("/:id", handler.UpdateMemo)
		memos.DELETE("/:id", handler.DeleteMemo)
	}

	// 标签路由
	r.GET("/tags", handler.ListTags)

	// 文件上传路由
	r.POST("/upload", handler.UploadFile)

	// 设置静态文件服务
	r.Static("/uploads", store.GetStaticDir())
}

// ListMemos 列出所有备忘录
func (h *MemoHandler) ListMemos(c *gin.Context) {
	memos, err := h.store.ListMemos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, memos)
}

// CreateMemo 创建一个新的备忘录
func (h *MemoHandler) CreateMemo(c *gin.Context) {
	var memo store.Memo
	if err := c.ShouldBindJSON(&memo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.store.CreateMemo(&memo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, memo)
}

// GetMemo 获取特定备忘录
func (h *MemoHandler) GetMemo(c *gin.Context) {
	id := c.Param("id")
	memo, err := h.store.GetMemo(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, memo)
}

// UpdateMemo 更新备忘录
func (h *MemoHandler) UpdateMemo(c *gin.Context) {
	id := c.Param("id")

	var updates store.Memo
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.store.UpdateMemo(id, &updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 获取更新后的memo
	memo, err := h.store.GetMemo(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, memo)
}

// DeleteMemo 删除备忘录
func (h *MemoHandler) DeleteMemo(c *gin.Context) {
	id := c.Param("id")
	if err := h.store.DeleteMemo(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// ListTags 列出所有唯一标签
func (h *MemoHandler) ListTags(c *gin.Context) {
	memos, err := h.store.ListMemos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 使用map来确保标签唯一性
	tagsMap := make(map[string]bool)
	for _, memo := range memos {
		for _, tag := range memo.Tags {
			tagsMap[tag] = true
		}
	}

	// 将map转换为切片
	tags := make([]string, 0, len(tagsMap))
	for tag := range tagsMap {
		tags = append(tags, tag)
	}

	c.JSON(http.StatusOK, tags)
}

// UploadFile 处理文件上传
func (h *MemoHandler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "未收到文件"})
		return
	}

	// 使用 h.store 存储文件
	fileData, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "无法打开上传的文件"})
		return
	}
	defer fileData.Close()

	data, err := io.ReadAll(fileData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "读取文件内容失败"})
		return
	}

	attachmentID := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	attachment := &store.Attachment{
		ID:   attachmentID,
		Data: data,
	}
	if err := h.store.CreateAttachment(attachment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "存储文件失败: " + err.Error()})
		return
	}

	url := fmt.Sprintf("/api/uploads/%s", attachmentID)

	c.JSON(http.StatusOK, gin.H{
		"url":  url,
		"name": file.Filename,
	})
}

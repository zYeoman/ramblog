package main

import (
	"io/fs"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"ramblog-app/backend/api"
	"ramblog-app/backend/config"
	"ramblog-app/backend/store"
)

func main() {
	// 加载配置
	cfg := config.LoadConfig()

	// 初始化存储
	memoStore, err := store.NewMemoStore(cfg.DataDir)
	if err != nil {
		log.Fatalf("无法初始化存储: %v", err)
	}

	// 设置Gin路由
	r := gin.Default()

	// 设置CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// API路由组
	apiGroup := r.Group("/api")
	{
		// 初始化API路由
		api.RegisterRoutes(apiGroup, memoStore)
	}

	// 创建静态文件子文件系统
	subFS, err := fs.Sub(StaticFiles, "out")
	if err != nil {
		log.Fatalf("无法创建静态文件子文件系统: %v", err)
	}

	// 设置静态文件处理中间件
	r.Use(func(c *gin.Context) {
		// 如果是API请求，跳过静态文件处理
		if strings.HasPrefix(c.Request.URL.Path, "/api/") {
			c.Next()
			return
		}

		// 尝试提供静态文件
		filePath := strings.TrimPrefix(c.Request.URL.Path, "/")
		if filePath == "" {
			filePath = "index.html"
		}

		// 检查文件是否存在
		if _, err := subFS.Open(filePath); err == nil {
			// 使用 http.FileServer 提供静态文件
			http.FileServer(http.FS(subFS)).ServeHTTP(c.Writer, c.Request)
			c.Abort()
			return
		}

		// 如果文件不存在，返回 index.html（SPA支持）
		if c.Request.Method == "GET" {
			c.FileFromFS("index.html", http.FS(subFS))
			c.Abort()
			return
		}

		// 继续处理请求
		c.Next()
	})

	// 启动服务器
	log.Printf("服务器启动在 %s\n", cfg.ServerAddr)
	if err := r.Run(cfg.ServerAddr); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
} 
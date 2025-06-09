package main

import (
	"log"
	"os"
	"path/filepath"
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

	// 检查前端静态文件目录是否存在
	staticDir := cfg.StaticDir
	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		log.Printf("警告: 静态文件目录 '%s' 不存在", staticDir)
	} else {
		// 设置静态文件处理中间件
		r.Use(func(c *gin.Context) {
			// 如果是API请求，跳过静态文件处理
			if strings.HasPrefix(c.Request.URL.Path, "/api/") {
				c.Next()
				return
			}

			// 尝试提供静态文件
			filePath := filepath.Join(staticDir, c.Request.URL.Path)
			if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
				c.File(filePath)
				c.Abort()
				return
			}

			// 如果是GET请求且不是静态文件，尝试提供index.html（SPA支持）
			if c.Request.Method == "GET" {
				indexPath := filepath.Join(staticDir, "index.html")
				if _, err := os.Stat(indexPath); err == nil {
					c.File(indexPath)
					c.Abort()
					return
				}
			}

			// 继续处理请求
			c.Next()
		})
	}

	// 启动服务器
	log.Printf("服务器启动在 %s\n", cfg.ServerAddr)
	log.Printf("静态文件目录: %s\n", staticDir)
	if err := r.Run(cfg.ServerAddr); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
} 
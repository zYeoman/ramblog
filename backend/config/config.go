package config

import (
	"os"
	"path/filepath"
)

// Config 存储应用配置
type Config struct {
	ServerAddr string // 服务器地址
	DataDir    string // 数据目录
}

// LoadConfig 从环境变量或默认值加载配置
func LoadConfig() *Config {
	// 获取数据目录，默认为 ./data
	dataDir := os.Getenv("MEMO_DATA_DIR")
	if dataDir == "" {
		dataDir = "./data"
	}

	// 确保数据目录存在
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		panic("无法创建数据目录: " + err.Error())
	}

	// 确保memos目录存在
	memosDir := filepath.Join(dataDir, "memos")
	if err := os.MkdirAll(memosDir, 0755); err != nil {
		panic("无法创建memos目录: " + err.Error())
	}

	// 获取服务器地址，默认为 :8080
	serverAddr := os.Getenv("MEMO_SERVER_ADDR")
	if serverAddr == "" {
		serverAddr = ":8080"
	}

	return &Config{
		ServerAddr: serverAddr,
		DataDir:    dataDir,
	}
}

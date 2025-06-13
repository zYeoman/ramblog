package config

import (
	"os"
	"path/filepath"
)

// Config 存储应用配置
type Config struct {
	ServerAddr string // 服务器地址
	DataDir    string // 数据目录
	StaticDir  string // 静态文件目录
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

	// 获取静态文件目录，默认为 ../out
	staticDir := os.Getenv("MEMO_STATIC_DIR")
	if staticDir == "" {
		// 尝试找到out目录
		possibleDirs := []string{
			"./static",
			"../out",    // 相对于backend目录
			"./out",     // 相对于当前目录
			"../../out", // 再上一级
		}

		for _, dir := range possibleDirs {
			if _, err := os.Stat(dir); err == nil {
				staticDir = dir
				break
			}
		}

		// 如果找不到，默认使用 ../out
		if staticDir == "" {
			staticDir = "./"
		}
	}

	return &Config{
		ServerAddr: serverAddr,
		DataDir:    dataDir,
		StaticDir:  staticDir,
	}
}

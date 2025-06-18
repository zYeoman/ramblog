package config

import (
	"flag"
	"fmt"
	"os"
)

// Config 存储应用配置
type Config struct {
	ServerAddr string // 服务器地址
	DataDir    string // 数据目录
	Debug      bool   // 是否启用调试模式
}

// LoadConfig 从命令行参数加载配置
func LoadConfig() *Config {
	// 定义命令行参数
	var (
		serverAddr = flag.String("addr", "127.0.0.1:3000", "服务器监听地址")
		dataDir    = flag.String("data", "./data", "数据存储目录")
		debug      = flag.Bool("debug", false, "是否启用调试模式")
	)

	// 定义短参数别名
	flag.StringVar(serverAddr, "a", *serverAddr, "服务器监听地址 (--addr 的简写)")
	flag.StringVar(dataDir, "d", *dataDir, "数据存储目录 (--data 的简写)")
	flag.BoolVar(debug, "D", *debug, "是否启用调试模式 (--debug 的简写)")

	// 自定义帮助信息
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "使用方法: %s [选项]\n\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "选项:\n")
		fmt.Fprintf(os.Stderr, "  -a, --addr string    服务器监听地址 (默认: \"127.0.0.1:3000\")\n")
		fmt.Fprintf(os.Stderr, "  -d, --data string    数据存储目录 (默认: \"./data\")\n")
		fmt.Fprintf(os.Stderr, "  -D, --debug          是否启用调试模式 (默认: false)\n")
		fmt.Fprintf(os.Stderr, "  -h, --help           显示帮助信息\n")
		os.Exit(0)
	}

	flag.Parse()

	return &Config{
		ServerAddr: *serverAddr,
		DataDir:    *dataDir,
		Debug:      *debug,
	}
}

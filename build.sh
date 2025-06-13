#!/bin/bash
set -e

PROJECT_NAME=$(basename "$(pwd)")
VERSION=${VERSION:-"dev"}  # 从环境变量获取版本号，默认为 dev

# 输出目录
OUTPUT_DIR=$(pwd)/"dist"
SRC_DIR=$(pwd)/"backend"
RELEASE_DIR=$(pwd)/"release"

# 确保目录存在
mkdir -p "$OUTPUT_DIR"
mkdir -p "$RELEASE_DIR"

# 构建 Next.js 静态文件
echo "正在构建 Next.js 静态文件..."
npm run export

cd $SRC_DIR

# 编译函数
build() {
    local GOOS=$1
    local GOARCH=$2
    local EXTENSION=$3
    local PLATFORM="${GOOS}_${GOARCH}"

    echo "正在编译 $GOOS/$GOARCH..."

    # 设置环境变量
    export GOOS=$GOOS
    export GOARCH=$GOARCH

    # 创建平台特定的发布目录
    local PLATFORM_RELEASE_DIR="${RELEASE_DIR}/${PROJECT_NAME}_${VERSION}_${PLATFORM}"
    mkdir -p "$PLATFORM_RELEASE_DIR"

    # 构建可执行文件
    go build -o "$PLATFORM_RELEASE_DIR/${PROJECT_NAME}${EXTENSION}"

    # 复制 Next.js 静态文件
    cp -r ../out "$PLATFORM_RELEASE_DIR/static"

    # 创建发布包
    cd "$RELEASE_DIR"
    if [ "$GOOS" = "windows" ]; then
        zip -r "${PROJECT_NAME}_${VERSION}_${PLATFORM}.zip" "${PROJECT_NAME}_${VERSION}_${PLATFORM}"
    else
        tar -czf "${PROJECT_NAME}_${VERSION}_${PLATFORM}.tar.gz" "${PROJECT_NAME}_${VERSION}_${PLATFORM}"
    fi

    # 检查编译是否成功
    if [ $? -eq 0 ]; then
        echo "✅ $GOOS/$GOARCH 编译和打包成功: ${PROJECT_NAME}_${VERSION}_${PLATFORM}.tar.gz"
    else
        echo "❌ $GOOS/$GOARCH 编译或打包失败"
        exit 1
    fi

    # 清理临时目录
    rm -rf "${PROJECT_NAME}_${VERSION}_${PLATFORM}"

    # 恢复环境变量
    unset GOOS
    unset GOARCH

    cd "$SRC_DIR"
}

# 编译不同平台
build "linux" "amd64" ""
build "windows" "amd64" ".exe"
build "darwin" "amd64" ""
build "darwin" "arm64" ""

# 生成 release 信息
echo "生成 release 信息..."
cat > "$RELEASE_DIR/release_info.md" << EOF
# ${PROJECT_NAME} v${VERSION}

## 下载

- Linux (amd64): [${PROJECT_NAME}_${VERSION}_linux_amd64.tar.gz](${PROJECT_NAME}_${VERSION}_linux_amd64.tar.gz)
- Windows (amd64): [${PROJECT_NAME}_${VERSION}_windows_amd64.zip](${PROJECT_NAME}_${VERSION}_windows_amd64.zip)
- macOS (amd64): [${PROJECT_NAME}_${VERSION}_darwin_amd64.tar.gz](${PROJECT_NAME}_${VERSION}_darwin_amd64.tar.gz)
- macOS (arm64): [${PROJECT_NAME}_${VERSION}_darwin_arm64.tar.gz](${PROJECT_NAME}_${VERSION}_darwin_arm64.tar.gz)

## 安装说明

1. 下载对应平台的压缩包
2. 解压文件
3. 运行可执行文件 \`${PROJECT_NAME}\` (Windows 下为 \`${PROJECT_NAME}.exe\`)
4. 访问 http://localhost:3000 查看应用

## 文件说明

每个发布包包含：
- 可执行文件
- 静态文件（位于 static 目录）
EOF

echo "所有平台编译和打包完成！"
echo "发布文件保存在 $RELEASE_DIR 目录"
echo "版本: $VERSION"


# Docker 构建脚本说明

本目录包含用于构建和部署 md-qrlink 应用的 Docker 相关脚本。

## 脚本列表

### 1. docker-build-local.sh

用于本地构建和运行 Docker 镜像的脚本。

**功能**：
- 构建 Docker 镜像（单平台）
- 停止并删除已存在的同名容器
- 运行新容器

**使用方法**：
```bash
./docker-build-local.sh
```

### 2. docker-build-push.sh

用于构建多平台 Docker 镜像并推送到 Docker Hub 的脚本。

**功能**：
- 使用 Docker Buildx 构建多平台镜像（默认支持 linux/amd64 和 linux/arm64）
- 推送镜像到 Docker Hub
- 支持通过参数设置镜像标签

**使用方法**：
```bash
# 使用默认标签 latest
./docker-build-push.sh

# 指定自定义标签
./docker-build-push.sh -t v1.0.0
```

**参数说明**：
- `-t <tag>`: 设置镜像标签，不指定则默认为 `latest`

**注意事项**：
1. 使用此脚本前，请确保已登录到 Docker Hub：
   ```bash
   docker login
   ```

2. 如需修改镜像名称，请编辑脚本中的 `IMAGE_NAME` 变量

3. 如需修改支持的平台，请编辑脚本中的 `PLATFORMS` 变量

4. 确保已安装 Docker Buildx 插件（Docker Desktop 或新版 Docker Engine 已默认包含）

## 使用示例

### 构建并推送带版本号的多平台镜像

```bash
./docker-build-push.sh -t v1.0.0
```

### 拉取并运行已推送的镜像

```bash
docker pull sugarjl/md-qrlink:latest
docker run -d -p 8080:80 --name md-qrlink-app sugarjl/md-qrlink:latest
```

应用将在 http://localhost:8080 可访问。
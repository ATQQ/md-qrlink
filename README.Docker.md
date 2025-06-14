# Docker 部署指南

本文档提供了使用 Docker 部署 md2wx 应用的详细说明。

## 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/) (可选，用于使用 docker-compose.yml)

## 使用 Docker 构建和运行

### 方法一：使用脚本（推荐）

项目提供了一个便捷的脚本来构建和运行 Docker 容器：

```bash
# 运行脚本
bash ./scripts/docker-build-local.sh
```

或者使用 npm 脚本：

```bash
npm run docker:build-local
```

这将自动构建镜像并启动容器，应用将在 http://localhost:8080 上可用。

### 方法二：手动 Docker 命令

如果您想手动控制构建和运行过程：

```bash
# 构建 Docker 镜像
docker build -t md-qrlink-local .

# 运行容器
docker run -d -p 8080:80 --name md-qrlink-app md-qrlink-local
```

### 方法三：使用 Docker Compose

```bash
# 构建并启动容器
docker compose up -d --build

# 或使用 npm 脚本
npm run docker:compose:build
```

## 配置说明

### Dockerfile

Dockerfile 使用多阶段构建：
1. 第一阶段使用 Node.js 环境构建应用
2. 第二阶段使用 Nginx 提供静态文件服务

### nginx.conf

提供了自定义的 Nginx 配置，包括：
- 静态资源缓存
- Gzip 压缩
- SPA 应用的路由重定向

### docker-compose.yml

定义了服务配置：
- 端口映射：8080:80
- 容器名称：md-qrlink-app
- 自动重启策略

## 自定义配置

### 修改端口

如果需要更改默认端口 (8080)：

1. 在 `docker-build.sh` 中修改 `PORT` 变量
2. 或在 `docker-compose.yml` 中修改 ports 配置

### 使用自定义 Nginx 配置

如果需要使用自定义的 Nginx 配置：

1. 在 Dockerfile 中取消注释 `COPY nginx.conf /etc/nginx/conf.d/default.conf` 行
2. 在 docker-compose.yml 中取消注释 volumes 配置

## 故障排除

### 查看容器日志

```bash
docker logs md-qrlink-app
```

### 进入容器内部

```bash
docker exec -it md-qrlink-app /bin/sh
```

### 停止和删除容器

```bash
docker stop md-qrlink-app
docker rm md-qrlink-app
```

### 删除镜像

```bash
docker rmi md-qrlink-local:latest
```
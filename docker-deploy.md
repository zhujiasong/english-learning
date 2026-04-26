# Docker 部署说明

## 1. 构建镜像

在云服务器进入项目根目录后执行：

```bash
docker build -t english-learning .
```

如果云服务器拉 npm 依赖困难，可以改用“本地预构建产物”方式。先在本地执行：

```bash
npm install
npm run db:setup
npm run build
```

确认生成 `.next/standalone` 后，把整个项目目录上传到云服务器，或者至少上传这些内容：

```text
.next/standalone
.next/static
public
prisma
Dockerfile.prebuilt
Dockerfile.prebuilt.dockerignore
```

然后在云服务器执行：

```bash
docker build -f Dockerfile.prebuilt -t english-learning .
```

这种方式不会在云服务器执行 `npm install`，只需要拉取 `node:22-slim` 基础镜像。

如果 npm 官方源访问慢，可以指定 registry：

```bash
docker build \
  --build-arg NPM_REGISTRY=https://registry.npmmirror.com \
  -t english-learning .
```

如果镜像源缺包，换回官方源：

```bash
docker build \
  --build-arg NPM_REGISTRY=https://registry.npmjs.org/ \
  -t english-learning .
```

## 2. 启动容器

```bash
docker run -d \
  --name english-learning \
  -p 3000:3000 \
  --restart unless-stopped \
  english-learning
```

访问：

```text
http://服务器IP:3000
```

## 3. 查看日志

```bash
docker logs -f english-learning
```

## 4. 停止和删除

```bash
docker stop english-learning
docker rm english-learning
```

强制删除：

```bash
docker rm -f english-learning
```

## 5. 更新部署

拉取或上传新代码后，在项目根目录执行：

```bash
docker rm -f english-learning
docker build -t english-learning .
docker run -d \
  --name english-learning \
  -p 3000:3000 \
  --restart unless-stopped \
  english-learning
```

## 6. 使用持久化数据库目录

当前镜像会在构建时初始化 SQLite 数据库。若希望 AI 生成的知识点内容长期保留，建议挂载 `prisma` 目录：

```bash
mkdir -p /data/english-learning/prisma
```

首次部署可以先不挂载，确认运行正常后再规划数据迁移。若直接挂载空目录，容器内构建好的 `prisma/dev.db` 会被覆盖，需要提前把数据库文件放到挂载目录。

挂载运行示例：

```bash
docker run -d \
  --name english-learning \
  -p 3000:3000 \
  -v /data/english-learning/prisma:/app/prisma \
  --restart unless-stopped \
  english-learning
```

## 7. Nginx 反向代理

如果只开放 80/443 端口，可以用 Nginx 代理到容器端口：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

重新加载 Nginx：

```bash
nginx -t
systemctl reload nginx
```

## 8. 常用排查命令

查看容器状态：

```bash
docker ps
docker ps -a
```

进入容器：

```bash
docker exec -it english-learning sh
```

查看镜像：

```bash
docker images
```

清理未使用镜像和构建缓存：

```bash
docker system prune -f
docker builder prune -f
```

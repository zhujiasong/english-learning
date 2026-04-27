# 贵州中考英语 AI 辅导

这是一个基于 Next.js 的英语学习系统，面向贵州中考英语复习场景，包含知识点学习、真题模拟、作文练习、划线提问、翻译朗读和 AI 问答等功能。

## 环境要求

推荐环境：

- Node.js 22+
- npm 10+
- Ubuntu 22.04/24.04、macOS 或其他可运行 Node.js 的系统

项目使用 SQLite 作为本地知识点/试题元数据数据库，默认文件路径为：

```env
DATABASE_URL=file:./prisma/dev.db
```

AI 提供商、模型和 API Key 在网页「模型配置」里填写，保存在浏览器本地，不需要写入服务器 `.env`。

## 本地启动

首次拉取代码后执行：

```bash
npm install
```

创建 `.env`：

```bash
cat > .env <<'EOF'
DATABASE_URL=file:./prisma/dev.db
EOF
```

初始化数据库：

```bash
npm run db:setup
```

启动开发服务：

```bash
npm run dev
```

浏览器打开：

```text
http://localhost:3000
```

## Ubuntu 一键初始化

Ubuntu 服务器或新机器可以直接执行：

```bash
chmod +x setup.sh
./setup.sh
```

脚本会完成：

- 检查并安装 Node.js 22
- 安装项目依赖
- 创建默认 `.env`
- 执行 Prisma 生成和数据库初始化

执行完成后启动开发服务：

```bash
npm run dev
```

## 生产构建和运行

本地或服务器上可以执行：

```bash
npm run build
npm start
```

默认端口为 `3000`。

## Docker 部署

构建镜像：

```bash
docker build -t english-learning .
```
构建镜像使用华为云：

```bash
docker build --build-arg NPM_REGISTRY=https://mirrors.huaweicloud.com/repository/npm/ -t english-learning .
```

运行容器：

```bash
docker run -d \
  --name english-learning \
  -p 3000:3000 \
  english-learning
```

访问：

```text
http://服务器IP:3000
```

更多 Docker 部署命令见：

```text
docker-deploy.md
```

## 常用命令

```bash
npm run dev        # 开发模式
npm run build      # 生产构建
npm start          # 启动生产服务
npm run lint       # 代码检查
npm run db:setup   # 初始化/重置本地数据库并写入种子数据
npm run db:push    # 同步 Prisma schema 到数据库
npm run db:seed    # 写入种子数据
```

## Git 注意事项

以下文件不会进入 Git：

- `.env`
- `.next/`
- `node_modules/`
- `prisma/dev.db`
- `tsconfig.tsbuildinfo`
- `next-env.d.ts`

这是正常的。新环境拉取代码后，需要重新执行依赖安装和数据库初始化。

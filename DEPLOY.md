# Cloudflare Workers 部署指南

## 前置准备

1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

2. 登录 Cloudflare
```bash
wrangler login
```

## 配置说明

### wrangler.toml 已配置
- Worker 名称: `time-train`
- D1 数据库: `timetrain-db` (ID: `40a2f429-e894-41f1-8baf-be011f494cb7`)
- Binding: `zTimeTrain`

### 配置 JWT_SECRET

在 `wrangler.toml` 中生成一个强随机密钥替换默认值：

```toml
[vars]
JWT_SECRET = "your-strong-random-secret-here-at-least-32-characters"
```

可以使用以下命令生成随机密钥：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 数据库设置

### 执行迁移

```bash
# 生产环境执行迁移
wrangler d1 execute timetrain-db --file=drizzle/migrations/0001_init.sql
```

## 部署到 Cloudflare

### 部署 Worker

```bash
npm run deploy:worker
```

## 本地开发

### 使用原有的 Express 服务器（推荐用于快速开发）

```bash
npm run dev
```

## 项目结构说明

```
├── worker/              # Cloudflare Workers 后端代码
│   ├── index.ts         # Worker 入口和所有 API
│   └── auth.ts          # JWT token 认证
├── drizzle/             # 数据库相关
│   ├── schema.ts        # Drizzle ORM schema
│   └── migrations/      # SQL 迁移文件
├── src/lib/api/         # 前端 API 客户端
│   ├── client.ts        # API 基础封装 (含 token 管理)
│   ├── auth.ts          # 登录/注册
│   ├── tasks.ts         # 任务 API
│   ├── carriages.ts     # 车厢 API
│   ├── points.ts        # 积分 API
│   ├── achievements.ts  # 成就 API
│   ├── level.ts         # 等级 API
│   ├── themes.ts        # 主题 API
│   └── initialData.ts   # 初始数据加载
├── server.ts            # 原 Express 服务器（保留用于本地开发）
└── wrangler.toml        # Cloudflare Workers 配置
```

## 安全配置

### 已配置
- ✅ JWT token 认证 (HMAC-SHA256)
- ✅ 所有 API (除登录/注册) 需要认证
- ✅ Token 有效期 7 天
- ✅ 密码明文存储 (按要求)

### 生产环境建议
- ⚠️ 请在 `wrangler.toml` 中配置强 `JWT_SECRET`
- ⚠️ CORS 当前允许所有来源，生产环境可按需限制

## 注意事项

1. **向后兼容**：原有的 `server.ts` 和 localStorage 逻辑保留，可以继续使用
2. **数据迁移**：现有用户数据需要手动从 localStorage 迁移到 D1

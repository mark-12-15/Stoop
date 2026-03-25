# 本地环境搭建指南

## ✅ 已完成

- [x] Podman 5.8.1 已安装
- [x] Podman machine正在运行
- [x] Supabase CLI 2.75.0 已安装
- [x] Docker兼容性已配置（~/.zshrc）

---

## 🚀 快速开始

### 1. 配置Podman环境变量（每个新终端需要）

```bash
export DOCKER_HOST="unix:///run/user/501/podman/podman.sock"
```

或者重启终端自动加载（已添加到 ~/.zshrc）

---

### 2. 初始化Supabase项目

```bash
cd /Users/liuwanlong/project/Stoop
supabase init
```

这会创建 `supabase/` 目录：
```
supabase/
├── config.toml        # Supabase配置
├── seed.sql           # 初始数据（可选）
└── migrations/        # 数据库迁移文件
```

---

### 3. 启动Supabase本地服务

```bash
# 设置环境变量（让Supabase CLI使用Podman）
export DOCKER_HOST="unix:///run/user/501/podman/podman.sock"

# 启动服务（首次启动会下载镜像，约5分钟）
supabase start
```

**预期输出**：
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
     Inbucket URL: http://localhost:54324  ← 邮件测试工具
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**保存这些key**，稍后配置 `.env.local` 需要！

---

### 4. 创建数据库表

复制 `doc/for-review/database.md` 中的SQL：

```bash
# 方式1：在Supabase Studio执行
# 打开 http://localhost:54323
# 左侧菜单 → SQL Editor → 粘贴SQL → Run

# 方式2：创建迁移文件
supabase migration new create_tables
# 编辑 supabase/migrations/xxxx_create_tables.sql
# 粘贴 database.md 中的SQL
supabase db reset  # 应用迁移
```

---

### 5. 配置Supabase Auth

编辑 `supabase/config.toml`:

```toml
[auth]
# 启用邮箱注册
enable_signup = true

# 本地测试：禁用邮件确认（直接登录）
enable_confirmations = false

# 如果要测试邮件流程，改为 true（邮件会被Inbucket捕获）
# enable_confirmations = true

[auth.email]
# 启用Magic Link登录
enable_signup = true

[auth.external.google]
enabled = true
client_id = "your-google-oauth-client-id"
secret = "your-google-oauth-secret"
redirect_uri = "http://localhost:54321/auth/v1/callback"
```

**配置Google OAuth**：
1. 访问 https://console.cloud.google.com/
2. 创建OAuth 2.0客户端ID
3. 授权重定向URI：`http://localhost:54321/auth/v1/callback`
4. 复制client_id和secret到config.toml

重启Supabase：
```bash
supabase stop
supabase start
```

---

### 6. 注册Lemon Squeezy测试账号

1. 访问 https://lemonsqueezy.com/
2. 注册账号
3. 进入Dashboard → Settings → API
4. 创建API key（选择Test Mode）
5. 保存API key

**创建测试产品**：
1. Dashboard → Products → Create Product
2. 名称：StoopKeep Pro Monthly
3. 价格：$30/month
4. 启用Test Mode
5. 复制Product ID

**配置Webhook**（稍后线上环境需要）：
- URL: `http://localhost:3000/api/webhooks/lemon-squeezy`
- 使用ngrok等工具暴露本地服务

---

### 7. 创建 .env.local

在项目根目录创建 `.env.local`:

```bash
# 环境标识
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase本地（从 supabase start 输出复制）
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Gemini AI（需要你的API key）
GOOGLE_AI_API_KEY=AIza...

# 存储（本地用Supabase Storage，不配置R2）
# 留空即可

# Lemon Squeezy（测试模式）
LEMON_SQUEEZY_API_KEY=test_xxx
LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_xxx
LEMON_SQUEEZY_STORE_ID=xxx
LEMON_SQUEEZY_PRODUCT_ID_MONTHLY=xxx
LEMON_SQUEEZY_PRODUCT_ID_YEARLY=xxx

# Admin邮箱（你的邮箱）
ADMIN_EMAILS=your-email@gmail.com
```

---

### 8. 安装Node.js依赖

```bash
cd /Users/liuwanlong/project/Stoop
npm install
```

**需要安装的包**（package.json会包含）：
- next
- react
- react-dom
- typescript
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs
- tailwindcss
- zod
- @google/generative-ai（Gemini SDK）

---

### 9. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 🧪 测试功能

### 测试邮件（Inbucket）

1. 访问 http://localhost:54324
2. 在你的应用输入邮箱：`test@example.com`
3. 点击发送Magic Link
4. 在Inbucket界面查看邮件
5. 点击邮件中的链接登录

### 测试数据库

```bash
# 连接数据库
psql postgresql://postgres:postgres@localhost:54322/postgres

# 查看表
\dt

# 查询数据
SELECT * FROM users;
```

### 测试存储

```bash
# 打开Supabase Studio
open http://localhost:54323

# 左侧菜单 → Storage
# 创建bucket：receipts（public）
# 上传测试文件
```

---

## 🔧 常用命令

```bash
# 启动Supabase
supabase start

# 停止Supabase
supabase stop

# 重置数据库（清空所有数据）
supabase db reset

# 查看日志
supabase logs

# 查看运行的容器
podman ps

# 查看Supabase状态
supabase status
```

---

## ⚠️ 常见问题

### Podman未运行

```bash
podman machine start podman-machine-default
```

### Supabase启动失败

```bash
# 检查DOCKER_HOST环境变量
echo $DOCKER_HOST

# 应该输出：unix:///run/user/501/podman/podman.sock

# 如果没有，执行：
export DOCKER_HOST="unix:///run/user/501/podman/podman.sock"
```

### 端口被占用

```bash
# 检查端口占用
lsof -i :54321
lsof -i :54322
lsof -i :54323
lsof -i :54324

# 停止占用的进程
kill -9 <PID>
```

### 容器无法启动

```bash
# 清理所有Supabase容器
podman rm -f $(podman ps -aq --filter "name=supabase")

# 重新启动
supabase start
```

---

## 📋 环境搭建Checklist

- [ ] 1.1 配置Podman兼容Docker ✅ 已完成
- [ ] 1.2 安装Supabase CLI ✅ 已完成
- [ ] 1.3 初始化Supabase项目
- [ ] 1.4 启动本地Supabase服务
- [ ] 1.5 执行数据库迁移SQL
- [ ] 1.6 配置Supabase Auth（OAuth）
- [ ] 1.7 注册Lemon Squeezy测试账号
- [ ] 1.8 创建.env.local文件
- [ ] 1.9 安装Node.js依赖
- [ ] 1.10 启动Next.js开发服务器
- [ ] 1.11 验证：访问http://localhost:3000
- [ ] 1.12 验证：Inbucket邮件测试

---

## 🎯 下一步

完成环境搭建后：
1. 查看 `doc/TASKS.md` 领取页面开发任务
2. 阅读 `doc/DEV_GUIDE.md` 了解开发规范
3. 开始开发第一个页面

---

## 📞 需要帮助？

- Supabase文档: https://supabase.com/docs
- Podman文档: https://podman.io/docs
- Lemon Squeezy文档: https://docs.lemonsqueezy.com/

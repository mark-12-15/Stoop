# Tech Stack

## Frontend

- **Next.js 14** (App Router)
- **TypeScript** (类型安全)
- **Tailwind CSS** (样式)
- **Radix UI / shadcn/ui** (UI组件库)

## Backend

- **Next.js API Routes** (RESTful API)
- **Supabase** (BaaS平台)
  - PostgreSQL (数据库)
  - Auth (用户认证)
  - Storage (文件存储，备选)

## AI/ML

### Gemini Flash 1.5
- **用途**: 照片分析 + 收据OCR
- **优势**: 
  - 多模态能力：原生图片理解
  - 快速响应：适合实时分析
  - 成本优势：比GPT-4 Vision便宜
  - 大上下文：1M tokens
- **注意事项**:
  - ⚠️ 前后可能不一致，需要重试机制
  - 使用低temperature (0.2) 降低随机性
  - 强制JSON Schema结构化输出
  - 关键信息需人工review

### API
- **Google AI API** (Gemini调用)
- **endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`

## File Storage

- **Cloudflare R2** (主力，照片和收据存储)
  - S3兼容API
  - 免费egress（出站流量）
  - 低成本
- **Supabase Storage** (备选)

## Payments

- **Lemon Squeezy**
  - 处理全球税务
  - Webhook回调
  - 订阅管理

## Deployment

- **Vercel** (Next.js应用托管)
  - Edge Functions
  - 自动部署
  - Preview环境
- **Supabase Cloud** (数据库托管)

## Development Tools

- **ESLint** + **Prettier** (代码规范)
- **TypeScript** (类型检查)
- **Git** + **GitHub** (版本控制)

---

## 技术选型理由

### 为什么选择Gemini Flash 1.5而不是GPT-4 Vision？

| 特性 | Gemini Flash 1.5 | GPT-4 Vision |
|------|------------------|--------------|
| 成本 | 💰 低 | 💰💰💰 高 |
| 速度 | ⚡ 快 | 🐢 较慢 |
| 多模态 | ✅ 原生支持 | ✅ 支持 |
| 上下文 | 1M tokens | 128K tokens |
| 一致性 | ⚠️ 较差 | ✅ 好 |

**结论**: 对于照片分析和收据OCR，Gemini的成本和速度优势更重要，一致性问题可以通过代码逻辑解决。

### 为什么选择Cloudflare R2而不是S3？

- ✅ 免费出站流量（S3按流量收费）
- ✅ S3兼容API（无需学习新接口）
- ✅ 成本更低（存储$0.015/GB vs S3 $0.023/GB）

### 为什么选择Supabase而不是自建PostgreSQL？

- ✅ 内置Auth系统（省开发时间）
- ✅ Row Level Security（数据安全）
- ✅ 实时订阅（可选功能）
- ✅ 免费tier足够MVP使用

---

## 环境变量

```bash
# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI
GOOGLE_AI_API_KEY=...

# Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=...
CLOUDFLARE_R2_PUBLIC_URL=https://...

# Payments
LEMON_SQUEEZY_API_KEY=...
LEMON_SQUEEZY_WEBHOOK_SECRET=...

# Admin
ADMIN_EMAILS=your-email@example.com

# Other
NEXT_PUBLIC_APP_URL=https://stoopkeep.com
```

---

## 依赖包（主要）

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "@google/generative-ai": "^0.1.0",
    "@radix-ui/react-*": "^1.0.0",
    "tailwindcss": "^3.3.0",
    "zod": "^3.22.0",
    "papaparse": "^5.4.1"
  }
}
```

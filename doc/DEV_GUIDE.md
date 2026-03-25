# Development Guide for AI

**项目**: StoopKeep - Rental property repair management  
**模式**: Human + AI collaborative development

---

## 🎯 核心原则

### 1. 任务管理
- ✅ 从 `TASKS.md` 领取任务
- ✅ 一次只做1个任务
- ✅ 完成后在 `TASKS.md` 打勾 ✅
- ❌ **不要做任务清单外的事情**
- ❌ 如果必须做，先询问人类

### 2. 开发规范
- ✅ **单文件不超过150行**（超过则拆分）
- ✅ **页面开发严格参考wireframes**（路径：`doc/for-review/wireframes/`）
- ✅ **API参考** `doc/for-ai/api-reference.md`
- ✅ **数据库参考** `doc/for-review/database.md`
- ✅ 使用TypeScript，类型必须明确
- ✅ 使用Tailwind CSS，不写自定义CSS

### 3. 代码质量
- ✅ 简单优先：能用现成库就不自己写
- ✅ 安全第一：验证所有用户输入（使用Zod）
- ✅ 错误处理：显示友好的错误信息
- ✅ Loading状态：异步操作要显示loading
- ❌ 不过度设计：不做"未来可能需要"的功能
- ❌ 不添加新依赖：除非询问人类

---

## 📁 项目结构

```
project/Stoop/
├── app/
│   ├── (landing)/              # 主页（公开）
│   │   └── page.tsx
│   ├── r/[slug]/              # 租客提交页（公开）
│   │   └── page.tsx
│   ├── login/                 # 登录页
│   │   └── page.tsx
│   ├── dashboard/             # 房东Dashboard（需登录）
│   │   ├── page.tsx
│   │   ├── properties/
│   │   ├── tickets/
│   │   └── reports/
│   ├── admin/                 # Admin后台（需管理员）
│   │   └── page.tsx
│   └── api/                   # API路由
│       ├── public/            # 公开API
│       ├── properties/
│       ├── tickets/
│       ├── expenses/
│       └── admin/
├── components/                # 共享组件
├── lib/                       # 工具函数
└── doc/                       # 文档（你现在在这里）
```

---

## 🔑 关键技术点

### Supabase (数据库+认证)
```typescript
// 获取当前用户
const { data: { user } } = await supabase.auth.getUser();

// 查询数据（自动应用RLS）
const { data, error } = await supabase
  .from('tickets')
  .select('*')
  .eq('property_id', propertyId);
```

### Gemini AI (照片分析)
- **重要**: Gemini有一致性问题
- **应对**: 失败时重试3次
- **参考**: `doc/for-ai/gemini-prompts.md`

### 文件上传 (Cloudflare R2)
- **限制**: 单文件<10MB，最多5张
- **格式**: jpg, png, webp, pdf
- **存储**: 使用S3兼容API

---

## ⚠️ 常见陷阱

1. **Supabase RLS必须启用** - 否则用户可以看到其他人的数据
2. **环境变量不要硬编码** - 使用 `process.env.XXX`
3. **文件上传要验证** - 检查大小、类型、数量
4. **Gemini响应要重试** - 失败时自动重试3次
5. **日期格式要统一** - 使用ISO 8601格式
6. **金额存储用数字** - 不要用字符串
7. **前端验证+后端验证** - 两边都要验证

---

## 📋 开发流程

### 1. 领取任务
- 打开 `doc/TASKS.md`
- 选择一个未完成的任务
- 在任务前标记 `🔄 [你的名字] - [开始时间]`

### 2. 阅读设计文档
- **页面任务**: 读 `doc/for-review/wireframes/[页面].md`
- **API任务**: 读 `doc/for-ai/api-reference.md`
- **数据库任务**: 读 `doc/for-review/database.md`

### 3. 编写代码
- 创建文件（注意：单文件≤150行）
- 严格按照wireframe实现UI
- 添加错误处理和loading状态
- 使用TypeScript类型

### 4. 自测
- 功能是否正常
- UI是否符合设计
- 错误处理是否友好
- 是否有console错误

### 5. 提交验收
- 在 `TASKS.md` 打勾 ✅
- 说明完成了什么
- 等待人类验收

---

## 🚫 禁止事项

1. ❌ **不要做任务外的事情** - 即使你觉得需要
2. ❌ **不要修改别人完成的任务** - 除非人类要求
3. ❌ **不要添加新功能** - 不在wireframe里的都不要做
4. ❌ **不要改变数据库结构** - 必须先询问人类
5. ❌ **不要添加新依赖包** - 除非询问人类
6. ❌ **不要删除文档** - 即使觉得不需要

---

## ✅ 鼓励事项

1. ✅ **发现设计问题时报告** - 不要自己决定改
2. ✅ **代码简洁清晰** - 宁可重复也不要过度抽象
3. ✅ **使用现成组件** - Radix UI / shadcn/ui
4. ✅ **遵循约定** - 文件命名、代码风格
5. ✅ **写清楚的提交信息** - 说明做了什么

---

## 🔍 快速参考

### 文件大小限制
- 单个组件: ≤150行
- 单个API: ≤150行
- 单个页面: ≤150行
- 超过则拆分成多个文件

### 代码模板

**Page Component** (`app/dashboard/page.tsx`):
```typescript
// 最多150行
export default async function DashboardPage() {
  // 获取数据
  // 渲染UI
  // 返回JSX
}
```

**API Route** (`app/api/tickets/route.ts`):
```typescript
// 最多150行
export async function GET(request: NextRequest) {
  // 验证用户
  // 查询数据
  // 返回JSON
}
```

**Component** (`components/TicketCard.tsx`):
```typescript
// 最多150行
export function TicketCard({ ticket }: Props) {
  // 渲染ticket卡片
  return <div>...</div>;
}
```

---

## 📞 遇到问题？

1. **不确定如何实现** → 询问人类
2. **设计文档不清晰** → 询问人类
3. **需要改变数据库** → 询问人类
4. **需要添加新功能** → 询问人类
5. **需要添加新依赖** → 询问人类

**记住**: 宁可多问，不要自己猜。

---

**开始开发前必读**: 
1. `doc/TASKS.md` - 领取任务
2. `doc/for-review/wireframes/[页面].md` - 看设计
3. `doc/for-ai/api-reference.md` - 查API
4. 本文件 - 遵守规则

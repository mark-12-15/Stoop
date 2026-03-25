# 15. Admin运维后台（极简版）

**路由**: `/admin`  
**访问**: 仅管理员（通过环境变量配置管理员邮箱）

---

## 设计理念

**极简版运维系统**，用于产品早期快速监控：
- ✅ 无需复杂的权限管理（只有一个管理员邮箱）
- ✅ 无需复杂的UI（简单表格+筛选即可）
- ✅ 核心功能：查看用户、房产、反馈
- ✅ 快速统计：关键指标一目了然

**不做什么**：
- ❌ 不做复杂的RBAC权限系统
- ❌ 不做fancy的图表和可视化
- ❌ 不做用户冒充(impersonate)功能
- ❌ 不做日志系统（Vercel自带）

---

## Admin后台结构

### 页面路由
```
/admin                  → Dashboard（总览）
/admin/users            → 用户管理
/admin/properties       → 房产管理
/admin/tickets          → 工单管理
/admin/feedback         → 反馈管理
```

---

## 1. Admin Dashboard（总览）

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] StoopKeep Admin                   [👤 Admin ▼]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Dashboard Overview                                        │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📊 Quick Stats                                     │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │                                                     │  │
│  │  👥 Total Users: 142                               │  │
│  │     ├─ Trial: 98 (69%)                            │  │
│  │     ├─ Paid: 38 (27%)                             │  │
│  │     └─ Canceled: 6 (4%)                           │  │
│  │                                                     │  │
│  │  🏠 Total Properties: 203                          │  │
│  │                                                     │  │
│  │  📋 Total Tickets: 1,847                           │  │
│  │     ├─ Tenant Submitted: 1,234 (67%)              │  │
│  │     └─ Manual Import: 613 (33%)                   │  │
│  │                                                     │  │
│  │  💬 Feedback (Unresolved): 15                      │  │
│  │     ├─ Bug Reports: 5                              │  │
│  │     ├─ Feature Requests: 8                         │  │
│  │     └─ Questions: 2                                │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📈 This Week                                       │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  New Users: 12                                      │  │
│  │  New Paid Subscriptions: 3                          │  │
│  │  New Tickets: 89                                    │  │
│  │  New Feedback: 7                                    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  💰 Revenue (via Lemon Squeezy)                     │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  MRR: $1,140 (38 paid users × $30/mo)              │  │
│  │  This Month: $1,140                                 │  │
│  │  ARR: $13,680                                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  Quick Actions:                                            │
│  [View Pending Feedback] [View Trial Users]               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Users Management（用户管理）

**路由**: `/admin/users`

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] StoopKeep Admin                   [👤 Admin ▼]     │
│  Dashboard • [Users] • Properties • Tickets • Feedback     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Users Management                                          │
│                                                            │
│  Filter: [All Users ▼] Status: [All ▼] [Search email...] │
│                                                            │
│  Total: 142 users  |  Showing: 1-20                       │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Email              │Status │Plan│Properties│Tickets  │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │john@doe.com       │Trial  │Free│3         │12       │ │
│  │  Created: 2024-03-20 (5 days ago)                   │ │
│  │  Trial: 2/3 tickets used                            │ │
│  │  Last login: 2 hours ago                            │ │
│  │  [View Details] [Send Email]                        │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │jane@smith.com     │Active │Pro │5         │234      │ │
│  │  Created: 2024-01-15 (2 months ago)                 │ │
│  │  Subscription: Monthly - $30/mo                     │ │
│  │  Last login: 1 day ago                              │ │
│  │  [View Details] [Send Email]                        │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │bob@test.com       │Canceled│Free│2         │45       │ │
│  │  Created: 2024-02-01 (1.5 months ago)               │ │
│  │  Canceled: 2024-03-01 (24 days ago)                 │ │
│  │  Last login: 24 days ago                            │ │
│  │  [View Details] [Send Email]                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [< Previous] Page 1 of 8 [Next >]                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### User Detail Modal（用户详情弹窗）

```
┌────────────────────────────────────────────────────────────┐
│  User Details: john@doe.com                      [X]       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📧 Email: john@doe.com                                    │
│  👤 Name: John Doe                                         │
│  📅 Created: 2024-03-20 (5 days ago)                       │
│  🔑 Auth Provider: google                                  │
│  🕐 Last Login: 2 hours ago                                │
│                                                            │
│  ─────────────────────────────────────────                │
│                                                            │
│  💳 Subscription:                                          │
│    Status: trial                                           │
│    Plan: free                                              │
│    Trial Tickets: 2/3 used                                 │
│    Monthly Ticket Limit: N/A                               │
│                                                            │
│  ─────────────────────────────────────────                │
│                                                            │
│  🏠 Properties (3):                                        │
│    • 123 Main St, Apt 2B (12 tickets)                     │
│    • 456 Oak Ave (0 tickets)                              │
│    • 789 Pine St (0 tickets)                              │
│                                                            │
│  ─────────────────────────────────────────                │
│                                                            │
│  📊 Activity:                                              │
│    Total Tickets: 12                                       │
│      ├─ Tenant Submitted: 3                               │
│      └─ Manual Import: 9                                  │
│    Last Export: Never                                      │
│    Total Exports: 0                                        │
│                                                            │
│  ─────────────────────────────────────────                │
│                                                            │
│  Actions:                                                  │
│  [View All Tickets] [View Properties] [Send Email]        │
│                                                            │
│  Danger Zone:                                              │
│  [Delete User Account] ⚠️                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Properties Management（房产管理）

**路由**: `/admin/properties`

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] StoopKeep Admin                   [👤 Admin ▼]     │
│  Dashboard • Users • [Properties] • Tickets • Feedback     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Properties Management                                     │
│                                                            │
│  Status: [All ▼] [Search address...]                      │
│                                                            │
│  Total: 203 properties  |  Showing: 1-20                  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Address           │Owner           │Tickets │Status  │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │123 Main St, 2B   │john@doe.com    │12      │Active  │ │
│  │  Created: 2024-03-20                                 │ │
│  │  Slug: unit-2b-abc123                                │ │
│  │  Tenant Link: https://stoopkeep.com/r/unit-2b-abc123│ │
│  │  [View Tickets] [Copy Link]                          │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │456 Oak Ave       │jane@smith.com  │234     │Active  │ │
│  │  Created: 2024-01-15                                 │ │
│  │  Slug: oak-ave-xyz789                                │ │
│  │  [View Tickets] [Copy Link]                          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [< Previous] Page 1 of 11 [Next >]                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Tickets Management（工单管理）

**路由**: `/admin/tickets`

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] StoopKeep Admin                   [👤 Admin ▼]     │
│  Dashboard • Users • Properties • [Tickets] • Feedback     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Tickets Management                                        │
│                                                            │
│  Source: [All ▼] Status: [All ▼] Type: [All ▼]           │
│  [Search description...]                                   │
│                                                            │
│  Total: 1,847 tickets  |  Showing: 1-20                   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Description      │Property      │Source │Status│Cost │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │Kitchen sink leak│123 Main St   │Tenant │Closed│$150 │ │
│  │  Owner: john@doe.com                                 │ │
│  │  Created: 2024-03-24                                 │ │
│  │  Expense Type: repair_maintenance                    │ │
│  │  [View Details]                                      │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │Annual insurance │456 Oak Ave   │Manual │Closed│$1200│ │
│  │  Owner: jane@smith.com                               │ │
│  │  Created: 2024-01-01                                 │ │
│  │  Expense Type: insurance                             │ │
│  │  [View Details]                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [< Previous] Page 1 of 93 [Next >]                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Feedback Management（反馈管理）

**路由**: `/admin/feedback`

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] StoopKeep Admin                   [👤 Admin ▼]     │
│  Dashboard • Users • Properties • Tickets • [Feedback]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Feedback Management                                       │
│                                                            │
│  Status: [New ▼] Type: [All ▼] [Search...]               │
│                                                            │
│  📊 Quick Stats:                                           │
│  New: 8  •  In Progress: 12  •  Resolved: 45  •  Total: 65│
│                                                            │
│  Showing: 8 new feedback                                   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🐛 Bug Report • NEW • 3 hours ago                    │ │
│  │ From: user@example.com (Visitor)                     │ │
│  │                                                      │ │
│  │ "Receipt upload fails on Safari browser..."          │ │
│  │                                                      │ │
│  │ Page: /dashboard/tickets/123                         │ │
│  │ Browser: Safari 17.3 / macOS 14.2                    │ │
│  │ Screenshots: 📎 2 attachments                        │ │
│  │                                                      │ │
│  │ Admin Notes:                                         │ │
│  │ ┌────────────────────────────────────┐              │ │
│  │ │ [Add notes here...]                │              │ │
│  │ └────────────────────────────────────┘              │ │
│  │                                                      │ │
│  │ Change Status: [In Progress ▼] [Update]             │ │
│  │ [Reply via Email] [View Screenshots] [Mark Resolved]│ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 💡 Feature Request • NEW • 1 day ago                 │ │
│  │ From: john@doe.com (User ID: abc123)                 │ │
│  │                                                      │ │
│  │ "It would be great to have batch edit..."           │ │
│  │                                                      │ │
│  │ Change Status: [In Progress ▼] [Update]             │ │
│  │ [Reply via Email] [Mark Resolved]                    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [< Previous] Page 1 of 1 [Next >]                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 管理员认证机制

### 方式1：环境变量（推荐，极简）

```env
# .env.local
ADMIN_EMAILS=your-email@example.com,co-founder@example.com
```

**中间件实现**：
```typescript
// middleware.ts 或 app/admin/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  // 检查是否登录
  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // 检查是否是管理员
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  if (!adminEmails.includes(user.email || '')) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">StoopKeep Admin</h1>
            <nav className="flex gap-4">
              <a href="/admin" className="hover:underline">Dashboard</a>
              <a href="/admin/users" className="hover:underline">Users</a>
              <a href="/admin/properties" className="hover:underline">Properties</a>
              <a href="/admin/tickets" className="hover:underline">Tickets</a>
              <a href="/admin/feedback" className="hover:underline">Feedback</a>
            </nav>
          </div>
          <div>
            {user.email} (Admin)
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
```

---

## Feedback前端入口汇总

### 1. 主页（Landing Page）- 陌生人入口

**方式A：Footer链接**（推荐）
```typescript
// app/(landing)/page.tsx
export default function LandingPage() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <>
      {/* Landing content */}
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex justify-center gap-8">
            <a href="/about">About</a>
            <a href="/blog">Blog</a>
            <a href="/pricing">Pricing</a>
            <button 
              onClick={() => setShowFeedbackModal(true)}
              className="hover:underline"
            >
              Give Feedback
            </button>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </>
  );
}
```

**方式B：悬浮按钮**（可选）
```typescript
// components/FeedbackButton.tsx
'use client';

export default function FeedbackButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 z-40"
      >
        💬 Feedback
      </button>

      <FeedbackModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
```

---

### 2. Dashboard（用户已登录）- 用户入口

**方式A：侧边栏底部**（推荐）
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">StoopKeep</h1>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4">
          <a href="/dashboard" className="block py-2">Dashboard</a>
          <a href="/dashboard/properties" className="block py-2">Properties</a>
          <a href="/dashboard/tickets" className="block py-2">Tickets</a>
          <a href="/dashboard/reports" className="block py-2">Reports</a>
        </nav>

        {/* Feedback Button - Bottom of Sidebar */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="w-full py-2 px-4 bg-blue-600 rounded hover:bg-blue-700"
          >
            💬 Give Feedback
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userEmail={user?.email} // 已登录用户自动填充邮箱
      />
    </div>
  );
}
```

**方式B：用户下拉菜单**（备选）
```typescript
// components/UserMenu.tsx
export default function UserMenu({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <>
      <div className="relative">
        <button onClick={() => setShowDropdown(!showDropdown)}>
          👤 {user.email}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded">
            <a href="/dashboard/account" className="block px-4 py-2">My Account</a>
            <a href="/dashboard/settings" className="block px-4 py-2">Settings</a>
            <button 
              onClick={() => {
                setShowFeedbackModal(true);
                setShowDropdown(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Give Feedback
            </button>
            <button className="block w-full text-left px-4 py-2 text-red-600">Logout</button>
          </div>
        )}
      </div>

      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userEmail={user.email}
      />
    </>
  );
}
```

---

## API实现要点

### Admin API中间件

```typescript
// lib/admin-auth.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function requireAdmin(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  if (!adminEmails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { user };
}

// 使用示例
// app/api/admin/users/route.ts
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) {
    return adminCheck; // 返回错误响应
  }

  // 继续处理管理员请求
  const supabase = createRouteHandlerClient({ cookies });
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  return NextResponse.json({ users });
}
```

---

## Admin API列表

```typescript
// 用户管理
GET    /api/admin/users              获取所有用户
GET    /api/admin/users/[id]         获取用户详情
DELETE /api/admin/users/[id]         删除用户

// 房产管理
GET    /api/admin/properties         获取所有房产
GET    /api/admin/properties/[id]    获取房产详情

// 工单管理
GET    /api/admin/tickets            获取所有工单
GET    /api/admin/tickets/[id]       获取工单详情

// 反馈管理（已实现）
GET    /api/admin/feedback           获取所有反馈
PUT    /api/admin/feedback/[id]      更新反馈状态

// Dashboard统计
GET    /api/admin/stats              获取总览统计数据
```

---

## 实施优先级

### Phase 1（MVP，1天）
1. ✅ 创建 `/admin` 路由和Layout
2. ✅ 实现管理员认证中间件（环境变量）
3. ✅ 实现Dashboard总览（基础统计）
4. ✅ 实现Feedback管理（已有API，只需前端）

### Phase 2（扩展，1天）
5. ✅ 实现Users列表页
6. ✅ 实现Properties列表页
7. ✅ 实现Tickets列表页

### Phase 3（可选）
8. ⏸️ 用户详情Modal
9. ⏸️ 搜索和筛选功能
10. ⏸️ 发送邮件功能

---

## Feedback前端入口实施

### 立即实施（MVP）

1. **主页Footer链接**
   - 在 `app/(landing)/page.tsx` 的Footer添加"Give Feedback"链接
   - 点击打开 `<FeedbackModal isOpen onClose />`

2. **Dashboard侧边栏按钮**
   - 在 `app/dashboard/layout.tsx` 侧边栏底部添加"Give Feedback"按钮
   - 点击打开 `<FeedbackModal isOpen onClose userEmail={user.email} />`

3. **创建FeedbackModal组件**
   - `components/FeedbackModal.tsx`
   - 调用 `/api/public/feedback` 或 `/api/feedback`

---

## 极简版技术栈

```typescript
// Admin后台技术栈
- Next.js App Router（路由）
- Tailwind CSS（样式）
- Supabase Client（数据查询）
- 环境变量（管理员认证）
- 无需额外依赖
```

---

## 完成检查清单

### Feedback入口
- [ ] 主页Footer添加"Give Feedback"链接
- [ ] Dashboard侧边栏添加"Give Feedback"按钮
- [ ] 创建 `components/FeedbackModal.tsx`
- [ ] 测试陌生人提交
- [ ] 测试用户提交

### Admin后台
- [ ] 创建 `/admin` 路由
- [ ] 实现管理员认证中间件
- [ ] 实现Dashboard总览统计
- [ ] 实现Feedback管理页面
- [ ] 实现Users列表页
- [ ] 实现Properties列表页
- [ ] 实现Tickets列表页

---

**极简Admin后台+Feedback入口设计完成！**

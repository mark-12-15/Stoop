# 09. 定价页面

**路由**: `/pricing`  
**访问**: 公开/登录后

---

## 设计理念

**核心价值主张**：
- 免费试用，真实体验完整功能
- 只有导出限制，激励升级
- 年付优惠，鼓励长期使用

**3+3+3配额模型**：
- 3个租客提交工单（体验AI分析）
- 3个房产（多房产房东必升级）
- 3个导出工单（报税痛点）

---

## 定价页面（桌面端）

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] StoopKeep                          [👤 Login]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              Simple Pricing for Landlords                │
│        Track maintenance, maximize tax deductions        │
│                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │       FREE           │  │      PRO ⭐          │    │
│  │                      │  │                      │    │
│  │      $0/mo           │  │    $99/year          │    │
│  │   Perfect to try     │  │  or $12/month        │    │
│  │                      │  │  (Save $45!)         │    │
│  ├──────────────────────┤  ├──────────────────────┤    │
│  │                      │  │                      │    │
│  │ TENANT SUBMISSIONS   │  │ TENANT SUBMISSIONS   │    │
│  │ ✓ 3 tenant tickets   │  │ ✓ Unlimited tickets  │    │
│  │   with AI analysis   │  │   with AI analysis   │    │
│  │ ✓ AI receipt OCR     │  │ ✓ AI receipt OCR     │    │
│  │                      │  │                      │    │
│  │ MANUAL IMPORT        │  │ MANUAL IMPORT        │    │
│  │ ✓ Unlimited manual   │  │ ✓ Unlimited manual   │    │
│  │   data entry         │  │   data entry         │    │
│  │ ✓ CSV bulk import    │  │ ✓ CSV bulk import    │    │
│  │                      │  │                      │    │
│  │ PROPERTIES           │  │ PROPERTIES           │    │
│  │ ✓ 3 properties max   │  │ ✓ Unlimited          │    │
│  │ ✓ Tenant links       │  │ ✓ Tenant links       │    │
│  │                      │  │                      │    │
│  │ TAX REPORTS          │  │ TAX REPORTS          │    │
│  │ ⚠️ 3 tickets export  │  │ ✓ Unlimited export   │    │
│  │ • Schedule E         │  │ • Schedule E         │    │
│  │ • Last 3 Years       │  │ • Last 3 Years       │    │
│  │                      │  │                      │    │
│  │ STORAGE              │  │ STORAGE              │    │
│  │ ✓ 20MB per ticket    │  │ ✓ 50MB per ticket    │    │
│  │ ✓ 100MB total        │  │ ✓ 5GB total          │    │
│  │                      │  │                      │    │
│  │                      │  │ PRIORITY SUPPORT     │    │
│  │                      │  │ ✓ Email support      │    │
│  │                      │  │ ✓ 24h response       │    │
│  │                      │  │                      │    │
│  │                      │  │                      │    │
│  │ [Current Plan]       │  │ [Upgrade to Pro →]   │    │
│  │                      │  │                      │    │
│  └──────────────────────┘  └──────────────────────┘    │
│                                                          │
│  💡 ROI Example: 50 repairs × $200 avg = $10,000        │
│     in deductions. Pro costs $99/year.                  │
│                                                          │
│  🔒 Secure payment by Lemon Squeezy                     │
│  ♻️ Cancel anytime, no questions asked                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 定价页面（移动端）

```
┌─────────────────────────────┐
│  [☰] StoopKeep     [Login]   │
├─────────────────────────────┤
│                             │
│    Simple Pricing           │
│    for Landlords            │
│                             │
│  ┌─────────────────────┐   │
│  │     FREE            │   │
│  │                     │   │
│  │    $0/mo            │   │
│  │  Perfect to try     │   │
│  ├─────────────────────┤   │
│  │                     │   │
│  │ ✓ 3 tenant tickets  │   │
│  │ ✓ Unlimited manual  │   │
│  │ ✓ 3 properties      │   │
│  │ ⚠️ 3 tickets export │   │
│  │ ✓ 100MB storage     │   │
│  │                     │   │
│  │ [Current Plan]      │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │     PRO ⭐          │   │
│  │                     │   │
│  │   $99/year          │   │
│  │  or $12/month       │   │
│  │  (Save $45!)        │   │
│  ├─────────────────────┤   │
│  │                     │   │
│  │ ✓ Unlimited tickets │   │
│  │ ✓ Unlimited manual  │   │
│  │ ✓ Unlimited props   │   │
│  │ ✓ Unlimited export  │   │
│  │ ✓ 5GB storage       │   │
│  │ ✓ Priority support  │   │
│  │                     │   │
│  │ [Upgrade to Pro →]  │   │
│  └─────────────────────┘   │
│                             │
│  💡 ROI: $10K deductions    │
│     for $99/year            │
│                             │
└─────────────────────────────┘
```

---

## 功能对比表（详细）

| Feature | Free | Pro |
|---------|------|-----|
| **Tenant Submissions** | | |
| Tenant-submitted tickets | 3 | ∞ |
| AI ticket analysis | ✅ | ✅ |
| AI receipt OCR | ✅ | ✅ |
| Email notifications | ✅ | ✅ |
| **Manual Data Entry** | | |
| Manual ticket creation | ∞ | ∞ |
| CSV bulk import | ✅ | ✅ |
| Batch editing | ✅ | ✅ |
| Historical data import | ✅ | ✅ |
| **Property Management** | | |
| Number of properties | 3 | ∞ |
| Tenant report links | ✅ | ✅ |
| Property deletion | ✅ | ✅ |
| **Tax Reports** | | |
| Schedule E export | 3 tickets | ∞ |
| Last 3 Years report | 3 tickets | ∞ |
| IRS-ready format | ✅ | ✅ |
| **Storage** | | |
| Per ticket limit | 20MB | 50MB |
| Total storage | 100MB | 5GB |
| Cloudflare R2 | ✅ | ✅ |
| **Support** | | |
| Email support | - | ✅ |
| Response time | - | 24h |
| **Price** | | |
| Monthly | $0 | $12 |
| Yearly | $0 | $99 |

---

## 升级触发点

### 1. 租客提交第4个工单

**触发流程**：

1. **租客端**（提交时）：
```
┌─────────────────────────────────────────────┐
│  Unable to Submit Ticket            [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Your landlord's plan limit reached      │
│                                             │
│  We've notified your landlord to upgrade.   │
│  You'll receive an email once the issue     │
│  is resolved and you can resubmit.          │
│                                             │
│  💡 In the meantime, you can contact        │
│  your landlord directly about urgent        │
│  repairs.                                   │
│                                             │
│  [Got it]                                   │
│                                             │
└─────────────────────────────────────────────┘
```

2. **房东端**（实时通知）：
- Email: "Your tenant tried to submit a ticket but your Free plan limit (3/3) is reached"
- Dashboard顶部Banner:
```
⚠️ Your tenant tried to submit a ticket but was blocked by Free plan limit.
[Upgrade to Pro →]  [Dismiss]
```

3. **房东Dashboard弹窗**（下次登录时）：
```
┌─────────────────────────────────────────────┐
│  Free Plan Limit Reached            [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ You've used 3/3 tenant submissions      │
│                                             │
│  Your tenant tried to submit a ticket,      │
│  but your Free plan limit is reached.       │
│                                             │
│  💡 You can still:                          │
│  • Add unlimited tickets manually           │
│  • Import CSV data                          │
│                                             │
│  🚀 Upgrade to Pro to:                      │
│  ✓ Accept unlimited tenant submissions      │
│  ✓ Keep using AI ticket analysis           │
│  ✓ Export full tax reports                  │
│                                             │
│  [Stay on Free]    [Upgrade to Pro →]       │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 2. 添加第4个房产

```
┌─────────────────────────────────────────────┐
│  Free Plan Limit Reached            [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ You've used 3/3 properties              │
│                                             │
│  Upgrade to Pro to add unlimited properties │
│                                             │
│  Current properties:                        │
│  • 123 Main St, Apt 2B                      │
│  • 456 Oak Ave                              │
│  • 789 Pine St                              │
│                                             │
│  [Cancel]          [Upgrade to Pro →]       │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 3. 导出第4个工单（Schedule E）

```
┌─────────────────────────────────────────────┐
│  Upgrade to Export Full Report      [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Free Plan Limitation                    │
│                                             │
│  You have 43 repairs in 2024 ($18,234)      │
│  Free plan exports first 3 only ($850)      │
│                                             │
│  💰 Missing deductions: $17,384             │
│                                             │
│  Upgrade to Pro ($99/year) to:              │
│  ✓ Export all 43 repairs                    │
│  ✓ Maximize your tax savings                │
│  ✓ Unlimited exports forever                │
│                                             │
│  ROI: $17,384 in deductions for $99         │
│                                             │
│  [Export 3 (Free)]    [Upgrade to Pro →]    │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 4. Storage配额用尽

**触发场景**：
- 上传新照片/收据时超过100MB总容量
- 单个工单上传超过20MB

```
┌─────────────────────────────────────────────┐
│  Storage Limit Reached              [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Free Plan Storage Limit (100MB)         │
│                                             │
│  Current usage: 87MB / 100MB                │
│  File you're trying to upload: 18MB         │
│                                             │
│  💡 You can:                                │
│  • Delete old receipts to free up space     │
│  • Upgrade to Pro for 5GB storage           │
│                                             │
│  🚀 Pro Plan includes:                      │
│  ✓ 5GB total storage (50x more)             │
│  ✓ 50MB per ticket (vs 20MB)                │
│  ✓ Unlimited ticket submissions             │
│                                             │
│  [Manage Files]    [Upgrade to Pro →]       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 支付流程

### 选择年付/月付

```
┌─────────────────────────────────────────────┐
│  Choose Your Plan                   [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  ⭕ Yearly ($99/year) 💰 SAVE $45           │
│     Best value • $8.25/month                │
│                                             │
│  ○  Monthly ($12/month)                     │
│     Billed monthly • Cancel anytime         │
│                                             │
│                                             │
│  [Continue to Payment →]                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 跳转到Lemon Squeezy

```typescript
const handleSubscribe = (interval: 'month' | 'year') => {
  const checkoutUrl = interval === 'year'
    ? 'https://stoopfix.lemonsqueezy.com/checkout/buy/yearly'
    : 'https://stoopfix.lemonsqueezy.com/checkout/buy/monthly';
  
  // 传递用户信息（预填）
  const params = new URLSearchParams({
    checkout: {
      email: user.email,
      name: user.name,
      custom: {
        user_id: user.id
      }
    }
  });
  
  window.location.href = `${checkoutUrl}?${params.toString()}`;
};
```

**支付成功后**：
- Lemon Squeezy Webhook → `/api/webhooks/lemon-squeezy`
- 更新数据库：`users.plan = 'pro'`, `users.plan_expires_at = ...`
- 重定向回Dashboard：`/dashboard?upgraded=true`

---

## 降级/取消订阅

### 入口位置

**Dashboard右上角** → 用户菜单：
```
┌────────────────────┐
│ 👤 John Doe ▼      │
├────────────────────┤
│ Dashboard          │
│ Properties         │
│ Tickets            │
│ Reports            │
│ ─────────────────  │
│ Settings           │
│ ⭐ Current Plan: Pro│  ← 点击进入
│ ─────────────────  │
│ Logout             │
└────────────────────┘
```

**点击"Current Plan"** → 跳转到 `/settings/billing`

---

### Billing页面

```
┌──────────────────────────────────────────────┐
│  [Logo] StoopKeep              [👤 John ▼]    │
├──────────────────────────────────────────────┤
│                                              │
│  Settings > Billing & Subscription           │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ Current Plan: Pro ⭐                   │ │
│  │                                        │ │
│  │ Billing Cycle: Yearly ($99/year)       │ │
│  │ Next billing date: Dec 31, 2024        │ │
│  │                                        │ │
│  │ [Manage Subscription on Lemon Squeezy →]│
│  │ [Cancel Subscription]                  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ Usage Summary                          │ │
│  │                                        │ │
│  │ Tenant submissions: 15 (Unlimited ✅)  │ │
│  │ Properties: 5 (Unlimited ✅)           │ │
│  │ Exports this month: 8                  │ │
│  │ Storage used: 1.2GB / 5GB              │ │
│  └────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

---

### 取消订阅弹窗

```
┌─────────────────────────────────────────────┐
│  Cancel Subscription                [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  Are you sure you want to cancel?           │
│                                             │
│  If you cancel:                             │
│  • Your Pro features remain active until    │
│    Dec 31, 2024                             │
│  • After that, you'll revert to Free plan   │
│  • You'll lose access to full exports       │
│  • Unlimited properties will be locked      │
│                                             │
│  💡 You can reactivate anytime              │
│                                             │
│  [Keep Pro]        [Yes, Cancel]            │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 降级后处理

**超过Free配额的处理逻辑**：
- **超过3个房产**：采用 **Auto-Freeze with Swap** 策略（见下方详细说明）
- **超过3个租客工单**：停止接收新提交，现有保留
- **导出**：限制为3条
- **超过100MB存储**：禁止上传新文件，现有保留（显示警告）

---

### 房产降级策略：Auto-Freeze with Swap

> **背景**：租客通过公开 URL 提交工单，若不强制执行限额，房东可无视警告继续对所有房产收票。因此必须在系统层面强制执行。

#### 1. 系统自动处理（降级触发时）

- 系统自动保留**最早创建的3个**房产为 Active
- 其余房产状态自动变更为 **Frozen**
- 全程无需房东手动选择

#### 2. 租客公开页行为（`/r/[slug]`）

**Active 房产** → 正常展示工单提交表单（无变化）

**Frozen 房产** → 隐藏表单，显示暂停提示：

```
┌─────────────────────────────────────────┐
│                                         │
│           🔒                            │
│                                         │
│   This maintenance portal is            │
│   currently paused.                     │
│                                         │
│   Please contact your landlord          │
│   directly for repair requests.         │
│                                         │
└─────────────────────────────────────────┘
```

#### 3. 房东 Dashboard Banner

降级后 Dashboard 顶部显示（不可 Dismiss，直到恢复正常）：

```
┌──────────────────────────────────────────────────────────┐
│ ⚠️ Your plan is now Free. 2 properties have been paused  │
│    to meet the 3-property limit.                         │
│    [Manage Properties]      [Upgrade to Pro →]           │
└──────────────────────────────────────────────────────────┘
```

#### 4. 房产列表页（Frozen 状态展示）

Frozen 房产在列表中以灰色哑光样式展示，带 🔒 标记：

```
┌──────────────────────────────────────────────────────────┐
│  Properties                          [+ Add Property]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ✅ 123 Main St, Apt 2B          [View] [Tickets] │   │
│  │    Active · 3 open tickets                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ✅ 456 Oak Ave                  [View] [Tickets] │   │
│  │    Active · 1 open ticket                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ✅ 789 Pine St                  [View] [Tickets] │   │
│  │    Active · 0 open tickets                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔒 321 Elm St          [Swap to Active] [View]   │   │  ← 灰色哑光
│  │    Frozen · Tenant portal paused                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔒 654 Maple Ave       [Swap to Active] [View]   │   │  ← 灰色哑光
│  │    Frozen · Tenant portal paused                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 5. Swap 机制

房东点击 Frozen 房产的 **[Swap to Active]** 时，弹出选择框，要求先选一个 Active 房产换下来（始终保持 ≤ 3 个 Active）：

```
┌─────────────────────────────────────────┐
│  Swap Property                  [X]     │
├─────────────────────────────────────────┤
│                                         │
│  To activate 321 Elm St, you must       │
│  pause one of your active properties.   │
│                                         │
│  Choose one to pause:                   │
│                                         │
│  ○  123 Main St, Apt 2B                 │
│  ○  456 Oak Ave                         │
│  ○  789 Pine St                         │
│                                         │
│  [Cancel]       [Confirm Swap]          │
│                                         │
└─────────────────────────────────────────┘
```

Swap 完成后：
- 所选 Active 房产变为 Frozen（租客链接显示暂停）
- 目标 Frozen 房产变为 Active（租客链接恢复正常）
- Toast 提示："Property swapped successfully."

#### 6. 升级恢复（Free → Pro）

升级成功后，系统自动将所有 Frozen 房产恢复为 Active，无需房东任何操作。Dashboard 降级 Banner 同步消失。

---

## 组件

| 组件 | 说明 | Props |
|------|------|-------|
| `PricingPage` | 定价页面容器 | - |
| `PlanCard` | 计划卡片（Free/Pro） | plan, features, price, onSubscribe |
| `FeatureList` | 功能列表 | features[], highlight |
| `ComparisonTable` | 对比表格 | plans[] |
| `UpgradeModal` | 升级弹窗 | trigger, stats, onUpgrade |
| `IntervalToggle` | 年付/月付切换 | value, onChange |
| `ROICalculator` | ROI计算器 | repairs, avgCost |

---

## API

### GET /api/pricing

**响应**：
```typescript
{
  plans: [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      features: [...]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 12, yearly: 99 },
      features: [...]
    }
  ],
  current_plan: 'free',
  limits: {
    tenant_tickets: { used: 2, limit: 3 },
    properties: { used: 1, limit: 3 },
    exports: { used: 0, limit: 3 }
  }
}
```

---

### POST /api/webhooks/lemon-squeezy

**用途**：接收Lemon Squeezy的支付回调

**处理事件**：
- `order_created` - 订阅创建
- `subscription_updated` - 订阅更新
- `subscription_cancelled` - 订阅取消
- `subscription_expired` - 订阅过期

**实现**：
```typescript
export async function POST(request: Request) {
  const signature = request.headers.get('X-Signature');
  const body = await request.text();
  
  // 验证签名
  const isValid = verifyLemonSqueezySignature(signature, body);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  switch (event.meta.event_name) {
    case 'order_created':
      await handleOrderCreated(event);
      break;
    case 'subscription_cancelled':
      await handleSubscriptionCancelled(event);
      break;
  }
  
  return new Response('OK');
}

async function handleOrderCreated(event) {
  const userId = event.meta.custom_data.user_id;
  const variantId = event.data.attributes.first_order_item.variant_id;
  
  // 判断是年付还是月付
  const interval = variantId === YEARLY_VARIANT_ID ? 'year' : 'month';
  const expiresAt = interval === 'year' 
    ? addYears(new Date(), 1)
    : addMonths(new Date(), 1);
  
  // 更新用户
  await db.update(users)
    .set({
      plan: 'pro',
      plan_interval: interval,
      plan_expires_at: expiresAt,
      lemon_squeezy_order_id: event.data.id
    })
    .where(eq(users.id, userId));
}
```

# 04. Dashboard主页

**路由**: `/dashboard`  
**访问**: 需登录

---

## 设计理念

Dashboard基于房东的核心关注点设计：
1. **第一优先级**：需要处理的工单（TO DO）
2. **第二优先级**：当前税年支出（TAX YEAR）
3. **第三优先级**：缺票据提醒（MISSING RECEIPTS）
4. **第四优先级**：近3年统计（IRS审计准备）

---

## 4A. Dashboard主界面（Free用户）

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                 [👤 John ▼]│
├─────────────────────────────────────────────┤
│                                             │
│  Dashboard                                  │
│                                             │
│  ⚠️ Free Plan: 2/3 tickets used  [Upgrade] │ ← 只有Free用户显示
│                                             │
│  ┌────────────────┐ ┌────────────────┐     │
│  │ 🔔 TO DO       │ │ 💰 TAX YEAR    │     │
│  │      8         │ │   [2024 ▼]     │     │
│  │  └ 🔴 2 Urgent │ │   $18,234      │     │
│  │                │ │   43 Tickets   │     │
│  │  [View All]    │ │  [View All]    │     │
│  └────────────────┘ └────────────────┘     │
│                                             │
│  ┌────────────────┐ ┌────────────────┐     │
│  │ ⚠️ MISSING     │ │ 📄 LAST 3 YEARS│     │
│  │   RECEIPTS     │ │   (IRS Ready)  │     │
│  │      3         │ │   $52,891      │     │
│  │                │ │   128 Tickets  │     │
│  │ [Add Receipt]  │ │  [View All]    │     │
│  └────────────────┘ └────────────────┘     │
│                                             │
│  ─────────────────────────────             │
│                                             │
│  Recent Activity (Last 5)                   │
│  ┌─────────────────────────────────────┐   │
│  │ 🔴 Kitchen sink leak - Unit 3B      │   │ ← Emergency（红色）
│  │    Status: To Do • 5 min ago        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ AC repair - Unit 2A              │   │ ← Pending Receipt（黄色）
│  │    Status: Missing Receipt • 2 days │   │
│  │    [Upload Receipt]                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ Toilet clog - Unit 1C            │   │ ← Closed（绿色）
│  │    Status: Closed • $150 • Mar 10  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🟡 Door lock - Studio               │   │ ← Normal（黄色）
│  │    Status: To Do • 3 days ago       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ Water heater - Apt 1A            │   │ ← Closed（绿色）
│  │    Status: Closed • $280 • Mar 5   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [View All Tickets]                         │
│                                             │
└─────────────────────────────────────────────┘
```

**Pro用户界面**（无配额提醒）：
```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                 [👤 John ▼]│
├─────────────────────────────────────────────┤
│                                             │
│  Dashboard                                  │
│                                             │
│  ┌────────────────┐ ┌────────────────┐     │ ← 直接显示统计卡片
│  │ 🔔 TO DO       │ │ 💰 TAX YEAR    │     │
│  │      8         │ │   [2024 ▼]     │     │
│  │  └ 🔴 2 Urgent │ │   $18,234      │     │
│  ...                                        │
└─────────────────────────────────────────────┘
```

**Recent Activity图标含义**：

| 图标 | 含义 | 状态 | 颜色 |
|------|------|------|------|
| 🔴 | Emergency | NEW/ACTION_REQUIRED + is_emergency=true | 红色（紧急） |
| 🟡 | Normal | NEW/ACTION_REQUIRED + is_emergency=false | 黄色（普通） |
| ⚠️ | Pending Receipt | PENDING_RECEIPT | 黄色（等待票据） |
| ✅ | Closed | CLOSED | 绿色（已完成） |

**头像下拉菜单**：
```
点击 [👤 John ▼] 显示：
┌─────────────────┐
│ John Doe        │
│ john@email.com  │
├─────────────────┤
│ Dashboard       │
│ Properties      │ → /properties
│ Settings        │ → /settings
├─────────────────┤
│ Logout          │
└─────────────────┘
```

---

## 4B. 报税季提醒（1-4月）

**位置**: 紧接在顶部导航栏下方，Dashboard标题上方

### 有工单的情况

2026年1-4月，显示以下Banner：

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                 [👤 John ▼]│
├─────────────────────────────────────────────┤
│                                             │
│  📄 Tax Season Reminder                     │ ← Banner位置
│  You're filing 2025 taxes. You have 43     │
│  tickets from 2025.                         │
│  ⚠️ 3 tickets are missing receipts.        │
│  [Export 2025 Schedule E] [Add Receipts]   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Dashboard                                  │ ← Dashboard标题
│  ...                                        │
└─────────────────────────────────────────────┘
```

### 无工单的情况

如果2025年没有任何工单记录：

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                 [👤 John ▼]│
├─────────────────────────────────────────────┤
│                                             │
│  📄 Tax Season Reminder                     │
│  You're filing 2025 taxes.                  │
│  ⚠️ You don't have any maintenance records  │
│  for 2025 yet.                              │
│                                             │
│  💡 Did you handle repairs yourself?        │
│  Add them now to maximize your deductions.  │
│                                             │
│  [+ Log Expense]  [···]                     │ ← [···] 打开 Action Sheet
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Dashboard                                  │
│  ...                                        │
└─────────────────────────────────────────────┘
```

**[···] Dismiss Action Sheet**（点击后从底部弹出）：
```
┌─────────────────────────────────────────────┐
│  Remind me later?                           │
├─────────────────────────────────────────────┤
│  [🔔 Remind me in 4 weeks]                 │ ← snooze 4周
│  [✅ I've already filed my 2025 taxes]     │ ← 本税年永久关闭
├─────────────────────────────────────────────┤
│  [Cancel]                                   │
└─────────────────────────────────────────────┘
```

### Banner 状态降级

随着时间推移，Banner 的展示形态会发生变化，以避免用户产生"提醒疲劳"：

| 阶段 | 触发条件 | 展示形态 | 颜色 |
|------|---------|---------|------|
| **全量 Banner** | 1月1日 – 3月31日，未 snooze | 完整横幅（见上方设计） | 蓝色（informational） |
| **小胶囊 Chip** | 已 snooze、snooze 未到期 | 标题栏下方一行小提示："📄 2025 tax reminder snoozed · [View]" | 灰色 |
| **橙色 Banner** | 4月1日起，且未标记"已报税" | 完整横幅重新出现，颜色升级为橙色，文案改为 "⚠️ Tax deadline is approaching — April 15." | 橙色（warning） |
| **完全隐藏** | 已点击"I've already filed" | 本税年内完全不显示 | — |

**关键规则**：4月1日起强制重新浮出，即使处于 snooze 状态也会被覆盖（snooze 只在1月–3月有效）。

### 显示逻辑

```typescript
const today = new Date();
const currentMonth = today.getMonth(); // 0=1月, 3=4月
const isTaxSeason = currentMonth >= 0 && currentMonth <= 3; // 1-4月显示

const currentYear = today.getFullYear();
const taxYear = currentYear - 1; // 1-4月报去年的税

// ⚠️ 关键前提：只有 properties.length > 0 时才显示报税季提醒
// 空状态（无房产）时完全隐藏，聚焦于 Add Property 引导
const showTaxBanner = isTaxSeason && propertiesCount > 0;

// 用户偏好（存储在 user_preferences 或 localStorage）
const taxYearDone: boolean;       // 用户点击"I've already filed"
const snoozeUntil: Date | null;   // snooze到期时间

const isAprilDeadlineZone = currentMonth === 3; // 4月
const isSnoozed = snoozeUntil != null && today < snoozeUntil && !isAprilDeadlineZone;

// Banner 状态
type TaxBannerState = "full" | "chip" | "orange" | "hidden";

function getTaxBannerState(): TaxBannerState {
  if (!showTaxBanner) return "hidden";
  if (taxYearDone) return "hidden";         // 已报税，永久隐藏
  if (isAprilDeadlineZone) return "orange"; // 4月，强制橙色 Banner
  if (isSnoozed) return "chip";             // snooze中，小胶囊
  return "full";                            // 默认全量 Banner
}

// Snooze处理
function handleSnooze() {
  const fourWeeksLater = new Date();
  fourWeeksLater.setDate(fourWeeksLater.getDate() + 28);
  setSnoozeUntil(fourWeeksLater); // 写入 user_preferences
}

// 永久关闭
function handleAlreadyFiled() {
  setTaxYearDone(true); // 写入 user_preferences，key: `tax_${taxYear}_filed`
}

const taxYearTickets = tickets.filter(t =>
  new Date(t.closed_at).getFullYear() === taxYear
);

if (showTaxBanner && taxYearTickets.length === 0) {
  // 显示"无工单"提示，引导手动添加（Log Expense）
}
```

---

## 4C. 空状态（首次登录 / properties.length === 0）

**触发条件**：`propertiesCount === 0`（不是 tickets === 0）

**隐藏内容**：报税季提醒 Banner、StatCards、FreePlanBanner、RecentActivity 全部隐藏，页面 100% 聚焦于 Add Property 引导。

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                 [👤 John ▼]│
├─────────────────────────────────────────────┤
│                                             │
│  Dashboard                                  │
│                                             │
│        ┌──────────────────────┐             │
│        │   [🏠 house icon]    │             │
│        │                      │             │
│        │  Welcome to          │             │
│        │  StoopKeep!          │             │
│        │                      │             │
│        │  Let's get started   │             │
│        │  by adding your      │             │
│        │  first property.     │             │
│        │                      │             │
│        │  [+ Add Property]    │             │
│        └──────────────────────┘             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4D. 按钮交互逻辑

### 顶部导航

| 元素 | 显示条件 | 点击行为 | 目标 |
|------|---------|---------|------|
| **[Logo]** | 总是显示 | 跳转到Dashboard | `/dashboard` |
| **[👤 John ▼]** | 总是显示 | 打开下拉菜单 | 菜单（见上方） |
| **Dashboard** | 下拉菜单项 | 跳转到Dashboard | `/dashboard` |
| **Properties** | 下拉菜单项 | 跳转到房产管理 | `/properties` |
| **Settings** | 下拉菜单项 | 跳转到设置页面 | `/settings` |
| **Logout** | 下拉菜单项 | 登出并跳转 | 调用`supabase.auth.signOut()` → `/` |

### 配额提醒

| 元素 | 显示条件 | 点击行为 | 目标 |
|------|---------|---------|------|
| **"2/3 tickets used"** | Free用户 | 纯文本，不可点击 | - |
| **[Upgrade]** | Free用户 | 跳转到定价页 | `/pricing` |
| *(整行不显示)* | Pro用户 | - | - |

### 报税季 Banner 按钮

| 元素 | 显示条件 | 点击行为 | 目标 |
|------|---------|---------|------|
| **[+ Log Expense]** | 无工单提示中 | 跳转到添加支出记录 | `/finances/new`（或弹窗） |
| **[···]** | 无工单提示中 | 弹出 Action Sheet | 见下方 |
| **[🔔 Remind me in 4 weeks]** | Action Sheet 中 | Snooze 28天，Banner 降为 Chip | 写入 `user_preferences.snooze_until` |
| **[✅ I've already filed]** | Action Sheet 中 | 本税年永久关闭 Banner | 写入 `user_preferences.tax_{year}_filed = true` |
| **[Cancel]** | Action Sheet 中 | 关闭 Action Sheet | 无状态变更 |
| **[Export 2025 Schedule E]** | 有工单提示中 | 导出 Schedule E | `/api/export/schedule-e?year=2025` |
| **[Add Receipts]** | 有工单提示中 | 查看缺票据工单 | `/tickets?filter=pending_receipt` |

**注意**：旧版的 `[+ Add Repair Records]` 按钮已重命名为 `[+ Log Expense]`，并统一归属于 Finances 模块入口。

### 统计卡片按钮

| 卡片 | 按钮 | 点击行为 | 目标 |
|------|------|---------|------|
| **TO DO** | [View All] | 查看待办工单列表 | `/tickets?filter=todo` |
| **TAX YEAR** | [2024 ▼] | 下拉选择年份，刷新卡片数据 | 前端状态更新 |
| **TAX YEAR** | [View All] | 查看该年度所有工单列表 | `/tickets?year=2024&status=closed` |
| **MISSING RECEIPTS** | [Add Receipt] | 查看缺票据工单列表 | `/tickets?filter=pending_receipt` |
| **LAST 3 YEARS** | [View All] | 查看3年所有工单列表 | `/tickets?last3years=true&status=closed` |

**设计原则**：Dashboard卡片只提供"查看"入口，Export功能在工单列表页提供

**用户路径**：
```
Dashboard卡片 → 点击[View All] → 工单列表页
                                    ↓
                            确认数据无误
                                    ↓
                            点击页面顶部[Export] → 下载Excel
```

### Recent Activity

| 元素 | 点击行为 | 目标 |
|------|---------|------|
| **工单卡片整体** | 打开工单详情弹窗 | URL变为`/dashboard?ticket=xxx`（弹窗） |
| **[Upload Receipt]** | 打开上传票据弹窗 | 弹窗显示上传表单 |
| **[View All Tickets]** | 查看所有工单 | `/tickets` |

### 工单状态筛选路由

| 路由 | 筛选条件 | 显示内容 |
|------|---------|---------|
| `/tickets` | 全部工单 | 显示所有未归档的工单 |
| `/tickets?filter=todo` | 待办 | status IN ('new', 'action_required', 'pending_receipt') |
| `/tickets?filter=pending_receipt` | 缺票据 | status = 'pending_receipt' |
| `/tickets?filter=closed` | 已关闭 | status = 'closed' |
| `/tickets?filter=archived` | 已归档 | status = 'archived' |

---

## 组件

- `DashboardHeader` - 顶部导航（带下拉菜单）
- `UserDropdown` - 用户头像下拉菜单
- `StatCard` - 统计卡片（4个）
- `TaxSeasonBanner` - 报税季提醒（1-4月显示），支持四种状态：`full`（蓝色全量）、`chip`（snooze中）、`orange`（4月倒计时）、`hidden`（已报税/无属性）
- `TaxDismissActionSheet` - 点击 `[···]` 后弹出的选择器，包含 Snooze / Already Filed / Cancel 三个选项
- `RecentActivity` - 最近活动列表（显示最近5条）
- `TicketCard` - 工单卡片（可点击打开详情）

---

## API

- `GET /api/dashboard/stats` - 获取Dashboard统计数据

---

## 统计逻辑

```typescript
// 1. TO DO卡片
const todoTickets = tickets.filter(t =>
  ['new', 'action_required', 'pending_receipt'].includes(t.status)
);
const urgentCount = todoTickets.filter(t => t.is_emergency).length;

// 2. TAX YEAR卡片（动态显示年份）
const currentMonth = new Date().getMonth();
const displayYear = currentMonth <= 3 
  ? new Date().getFullYear() - 1  // 1-4月显示去年（报税季）
  : new Date().getFullYear();     // 5-12月显示今年

const taxYearStart = new Date(`${displayYear}-01-01`);
const taxYearEnd = new Date(`${displayYear}-12-31`);
const taxYearTickets = tickets.filter(t =>
  t.status === 'closed' &&
  t.closed_at >= taxYearStart &&
  t.closed_at <= taxYearEnd
);
const taxYearTotal = taxYearTickets.reduce((sum, t) => sum + t.final_cost, 0);

// 3. MISSING RECEIPTS卡片
const missingReceiptsTickets = tickets.filter(t =>
  t.status === 'pending_receipt'
);

// 4. LAST 3 YEARS卡片（rolling 3年）
const threeYearsAgo = new Date();
threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
const last3YearsTickets = tickets.filter(t =>
  t.status === 'closed' &&
  t.closed_at >= threeYearsAgo
);
const last3YearsTotal = last3YearsTickets.reduce((sum, t) => sum + t.final_cost, 0);

// 5. Recent Activity（最近5条）
const recentTickets = tickets
  .filter(t => t.status !== 'archived')  // 排除已归档
  .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))  // 按更新时间倒序
  .slice(0, 5);  // 只取前5条
```

---

## 交互细节

### 1. 工单卡片点击

```typescript
const handleTicketClick = (ticketId: string) => {
  // 更新URL但不跳转页面
  router.push(`/dashboard?ticket=${ticketId}`, { shallow: true });
  // 打开弹窗显示工单详情
  setSelectedTicket(ticketId);
};
```

### 2. 年份切换

```typescript
const handleYearChange = async (year: number) => {
  setSelectedYear(year);
  // 重新获取该年度的统计数据
  const stats = await fetchTaxYearStats(year);
  setTaxYearStats(stats);
};
```

### 3. 导出PDF

```typescript
const handleExport = async () => {
  const response = await fetch(`/api/export/schedule-e?year=${selectedYear}`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `StoopKeep-Schedule-E-${selectedYear}.xlsx`;
  a.click();
};
```

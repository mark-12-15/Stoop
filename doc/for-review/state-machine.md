# 工单状态机设计

**状态总数**: 5 个  
**核心流程**: 租客提交 → AI 分析 → 房东点击查看 → 完成维修 → 上传票据 → 归档

---

## 状态流转图

```
┌─────────┐
│   NEW   │  租客刚提交，AI分析中（未读状态）
└────┬────┘
     │ AI分析完成（自动，30秒内）
     ▼
┌──────────────────┐
│ ACTION_REQUIRED  │  房东已查看，待处理（此时租客不可删除）
└────┬─────────────┘
     │ 房东完成维修，两种路径：
     ├─ 路径A：有发票 → 直接上传 + 填费用
     │         ↓
     │    ┌────────┐
     │    │ CLOSED │
     │    └────────┘
     │
     └─ 路径B：无发票 → 先标记完成
              ↓
     ┌──────────────────┐
     │ PENDING_RECEIPT  │  已完成，等待上传票据
     └────┬─────────────┘
          │ 上传票据 + AI OCR + 确认金额
          ▼
     ┌────────┐
     │ CLOSED │  已关闭，有完整费用记录
     └────┬───┘
          │ 3年后自动归档（符合IRS审计周期）
          ▼
     ┌──────────┐
     │ ARCHIVED │  历史记录，可导出但不再显示在主看板
     └──────────┘
```

**设计理念**: 
- 平台只记录工单和费用，不管理维修流程
- 房东线下自行安排维修，回到系统填写费用和票据
- 支持无票据先标记完成，后续补充（PENDING_RECEIPT状态）
- 3年归档周期符合IRS标准审计追溯期

---

## 状态定义

### 1. NEW（新提交）

**触发条件**:
- 租客通过 Web 表单提交工单

**系统行为**:
- 立即返回成功响应给租客
- 异步调用 `/api/internal/analyze-ticket` 触发 AI 分析
- AI分析完成后自动转换到 ACTION_REQUIRED

**租客权限**:
- ✅ 可以编辑工单（status='new'时）
- ✅ 可以删除工单（status='new'时）

**房东权限**:
- ✅ 可以删除工单（误报、重复等）

**可见性**:
- 房东看板：显示为"未读"（灰色标签）
- 租客端：显示为"📥 New"

**停留时长**: 通常 < 1 分钟（AI 分析完成后自动转换）

**下一状态**:
- → `ACTION_REQUIRED`（自动，AI 分析完成）

---

### 2. ACTION_REQUIRED（待处理）

**触发条件**:
- AI 分析完成，房东点击查看工单详情
- 自动记录 `viewed_at` 时间戳

**系统行为**:
- 邮件通知房东，包含 AI 分析摘要
- 高优先级（is_emergency=true）的工单：发送紧急通知（邮件标红）

**房东操作流程**:
1. **查看工单详情**（点击卡片，自动记录 `viewed_at`）
2. **线下处理**（找维修工、自己修等，平台不管）
3. **回到系统**：
   - 有发票 → 点击 [Close Ticket]，上传发票+填费用 → CLOSED
   - 无发票 → 点击 [Mark as Done] → PENDING_RECEIPT

**租客权限**:
- ❌ 不可编辑（房东已查看）
- ❌ 不可删除（房东已查看）

**房东权限**:
- ✅ 可以删除工单（只是查看了，无成本投入）
- ✅ 可以修改备注

**可见性**:
- 房东看板：显示在"TO DO"（橙色标签）
- 排序：优先显示紧急工单

**停留时长**: 取决于房东处理速度（无时间限制）

**下一状态**:
- → `CLOSED`（手动，有发票直接关闭）
- → `PENDING_RECEIPT`（手动，无发票先标记完成）
- → 删除（手动，房东删除）

---

### 3. PENDING_RECEIPT（等待票据）🆕

**触发条件**:
- 房东点击 [Mark as Done]（维修已完成，但还没拿到发票）

**系统行为**:
- 记录完成时间
- Dashboard显示"⚠️ Missing Receipts"提醒
- 定期提醒房东上传票据（每7天）

**房东操作**:
- 等待维修工给发票
- 收到发票后，点击 [Upload Receipt]
- 上传发票 → AI OCR提取金额 → 房东确认 → 转到 CLOSED

**租客权限**:
- ❌ 不可编辑
- ❌ 不可删除

**房东权限**:
- ❌ 不可删除（维修已完成，只是缺票据）
- ✅ 可以修改备注
- ✅ 可以上传票据并关闭

**可见性**:
- 房东看板：显示为"⚠️ Missing Receipt"（黄色标签）
- Dashboard: 统计在"MISSING RECEIPTS"卡片

**停留时长**: 取决于何时拿到发票（无时间限制）

**下一状态**:
- → `CLOSED`（手动，上传票据后）

---

### 4. CLOSED（已关闭）

**触发条件**:
- 路径A：从 ACTION_REQUIRED 直接上传发票+填费用
- 路径B：从 PENDING_RECEIPT 上传票据后

**必填字段**:
- `final_cost` 必填
- `receipt_photo_urls` 可选（建议上传）
- `receipt_vendor_name` AI自动提取

**系统行为**:
- 记录 `closed_at` 时间戳
- 纳入 Schedule E 导出范围
- 更新房东的年度统计数据（总维修次数、总花费）

**租客权限**:
- ❌ 不可编辑
- ❌ 不可删除

**房东权限**:
- ❌ 不可删除（有财务记录，税务需要）
- ✅ 可以修改费用、票据、备注（未归档前）
- ✅ 可以手动归档

**可见性**:
- 房东看板：显示为"✅ Closed"（绿色标签）
- 可导出到 Schedule E

**停留时长**: 3年后自动归档

**下一状态**:
- → `ARCHIVED`（自动，3年后）
- → `ARCHIVED`（手动，房东点击归档）

---

### 5. ARCHIVED（已存档）

**触发条件**:
- `closed_at` 超过 3 年（符合IRS审计周期）
- 或房东手动归档

**系统行为**:
- 从主看板隐藏（不计入配额）
- 仍可搜索和查看
- 可导出到 Schedule E（IRS可能追溯审计）
- 不影响历史统计数据

**租客权限**:
- ❌ 不可见（租客看不到归档工单）

**房东权限**:
- ❌ 不可删除（历史记录永久保留）
- ❌ 不可修改（归档后锁定所有字段）
- ✅ 可以查看
- ✅ 可以导出

**可见性**:
- 房东看板：默认不显示
- 需要切换到"Archived"标签才能看到
- 统计在"LAST 3 YEARS"卡片中（rolling 3年）

**配额影响**:
- ❌ 不计入配额（归档后释放）

**下一状态**:
- 无（终态）

---

## 状态转换矩阵

| 当前状态 | 可转换到 | 触发方式 | 条件 | 是否可删除 |
|----------|----------|----------|------|-----------|
| NEW | ACTION_REQUIRED | 自动 | AI 分析完成 | ✅ 可删除 |
| ACTION_REQUIRED | CLOSED | 手动 | 房东上传发票+填费用 | ✅ 可删除 |
| ACTION_REQUIRED | PENDING_RECEIPT | 手动 | 房东点击 [Mark as Done] | ✅ 可删除 |
| PENDING_RECEIPT | CLOSED | 手动 | 上传票据+确认金额 | ❌ 不可删除 |
| CLOSED | ARCHIVED | 自动 | 超过 3 年 | ❌ 不可删除 |
| CLOSED | ARCHIVED | 手动 | 房东手动归档 | ❌ 不可删除 |
| ARCHIVED | - | - | 终态 | ❌ 不可删除 |

**注意**：状态不允许回退（单向流转）

---

## 前端组件设计

### 看板（Kanban Board）- 简化版

```tsx
// components/TicketBoard.tsx
const columns = [
  {
    id: 'new',
    label: 'Analyzing',
    color: 'gray',
    description: 'AI is analyzing...'
  },
  {
    id: 'action_required',
    label: 'To Do',
    color: 'orange',
    description: 'Needs your attention',
    badge: (tickets) => tickets.filter(t => t.ai_severity === 'high').length
  },
  {
    id: 'closed',
    label: 'Done',
    color: 'green',
    description: 'Ready for tax report'
  }
];

// MVP阶段不需要拖拽，用按钮更简单
```

### 工单卡片 - 简化版

```tsx
// components/TicketCard.tsx
<div className={`ticket-card status-${ticket.status}`}>
  {/* 紧急标记 */}
  {ticket.ai_severity === 'high' && (
    <div className="emergency-badge">🚨 URGENT</div>
  )}
  
  {/* 房产信息 */}
  <div className="property-info">
    {ticket.property.unit_number || ticket.property.address}
  </div>
  
  {/* AI 总结 */}
  <div className="summary">
    {ticket.ai_summary || ticket.tenant_raw_text.slice(0, 100)}
  </div>
  
  {/* 分类标签 */}
  <div className="category-tag">
    {getCategoryIcon(ticket.ai_category)} {ticket.ai_category}
  </div>
  
  {/* 时间信息 */}
  <div className="time-info">
    <span>{formatRelativeTime(ticket.created_at)}</span>
  </div>
  
  {/* 快捷操作按钮 */}
  <div className="actions">
    {ticket.status === 'action_required' && (
      <button onClick={() => closeTicket(ticket.id)} className="primary">
        Close & Add Cost
      </button>
    )}
    {ticket.status === 'closed' && (
      <button onClick={() => viewDetails(ticket.id)}>
        View Details
      </button>
    )}
  </div>
</div>
```

---

## 状态相关的 UI 元素

### 颜色方案 - 简化版

```css
/* Ticket status colors */
.status-new { 
  border-left: 4px solid #9CA3AF; /* gray */
}
.status-action_required { 
  border-left: 4px solid #F59E0B; /* orange */
}
.status-closed { 
  border-left: 4px solid #10B981; /* green */
}
.status-archived {
  border-left: 4px solid #6B7280; /* gray-500 */
  opacity: 0.6;
}
```

### 图标映射

```typescript
const statusIcons = {
  new: '⏳',
  action_required: '🔔',
  closed: '✅',
  archived: '📦'
};

const categoryIcons = {
  plumbing: '🚰',
  electrical: '⚡',
  appliance: '🔧',
  hvac: '❄️',
  structural: '🏗️',
  pest: '🐛',
  locksmith: '🔐',
  other: '🔨'
};
```

---

## 异常流程处理

### 场景 1：AI 分析失败

**问题**: OpenAI API 超时或返回错误

**处理**:
1. 工单状态直接设为 `ACTION_REQUIRED`
2. `ai_summary` 设为 `null`
3. 在看板上显示"⚠️ AI 分析失败，需人工查看"
4. 房东点击后看到租客原始描述

### 场景 2：房东长期不处理

**问题**: 工单在 `ACTION_REQUIRED` 状态超过 7 天

**处理**:
1. 每 7 天发送提醒邮件
2. 在看板上显示"⏰ 已等待 X 天"
3. 不自动关闭（房东可能在线下处理了）

### 场景 3：房东忘记关闭工单

**问题**: 工单在 `ACTION_REQUIRED` 状态超过 30 天

**处理**:
1. 每 7 天发送提醒邮件
2. 年底报税季（1-3月）提醒频率增加到每 3 天
3. 在看板上显示"⏰ 已等待 X 天"

### 场景 4：租客重复提交同一问题

**问题**: 同一房产、同一分类、48 小时内提交 2 次

**处理**:
1. 后端检测重复（根据 `property_id` + `ai_category` + 时间窗口）
2. 第二次提交时提示："你已经提交过类似的问题，房东正在处理"
3. 在现有工单下添加"租客追加描述"字段
4. 通知房东："租客又提交了相同问题，可能很紧急"

---

## 字段修改权限矩阵

| 字段 | 未归档前 | 归档后 | 说明 |
|------|---------|--------|------|
| **租客信息** | ❌ 不可改 | ❌ 不可改 | 原始记录，审计需要 |
| `tenant_name` | ❌ | ❌ | |
| `tenant_email` | ❌ | ❌ | |
| `tenant_phone` | ❌ | ❌ | |
| `tenant_raw_text` | ❌ | ❌ | |
| `tenant_photo_urls` | ❌ | ❌ | |
| `is_emergency` | ❌ | ❌ | |
| **AI分析** | ❌ 不可改 | ❌ 不可改 | AI生成，不可修改 |
| `ai_category` | ❌ | ❌ | |
| `ai_severity` | ❌ | ❌ | |
| `ai_summary` | ❌ | ❌ | |
| `ai_estimated_cost` | ❌ | ❌ | |
| **房东填写** | ✅ 可改 | ❌ 不可改 | 财务调整 vs 历史锁定 |
| `landlord_notes` | ✅ | ❌ | |
| `final_cost` | ✅ | ❌ | |
| `receipt_photo_urls` | ✅ | ❌ | |
| `receipt_vendor_name` | ✅ | ❌ | |

---

## 数据库触发器（自动化）

```sql
-- 自动归档超过 3 年的工单（符合IRS审计周期）
CREATE OR REPLACE FUNCTION auto_archive_old_tickets()
RETURNS void AS $$
BEGIN
  UPDATE tickets
  SET status = 'archived'
  WHERE status = 'closed'
    AND closed_at < NOW() - INTERVAL '3 years';
END;
$$ LANGUAGE plpgsql;

-- 使用 Vercel Cron 或 Supabase pg_cron 扩展
-- Vercel: 在 vercel.json 配置，调用 /api/cron/archive
-- pg_cron: SELECT cron.schedule('auto-archive', '0 2 * * *', 'SELECT auto_archive_old_tickets()');
```

---

## 配额计算规则

```typescript
// Free用户配额：3个工单
// Pro用户配额：无限

// 统计未归档的工单数量
const usedQuota = tickets.filter(t =>
  t.status !== 'archived'  // 只有归档的不计入配额
).length;

const canCreate = usedQuota < user.subscription.ticket_limit;

// 归档操作立即释放配额
// 这是唯一可以释放配额的方式（删除也会释放，但只能删除NEW/ACTION_REQUIRED状态的）
```

---

## 导出规则

```typescript
// 哪些工单可以导出到Schedule E？
const exportableTickets = tickets.filter(t =>
  t.status === 'closed' || t.status === 'archived'  // 两种都可导出
);

// 为什么归档的也要导出？
// 场景：2026年，IRS审计2023年的税表
// 房东需要提供2023年的Schedule E
// 系统里2023年的工单已经归档了
// 如果归档的不能导出 → 房东无法提供证据 ❌
// 所以：归档的也必须能导出 ✅
```

---

## 性能优化

### 索引策略

```sql
-- 已在 database-schema.md 中定义
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_property_status ON tickets(property_id, status);
```

### 缓存策略

- 房东的工单统计数据缓存 5 分钟（Redis）
- 看板数据每 30 秒刷新一次（前端轮询或 WebSocket）

---

**下一步**: 查看 `ai-prompts.md` 了解如何让 AI 准确分析工单

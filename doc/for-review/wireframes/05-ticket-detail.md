# 05. 工单详情弹窗

**触发**: 
- Dashboard Recent Activity（点击工单卡片）
- 工单列表页（点击表格行或卡片）
- 工单列表页Actions列（点击[View]按钮）

**类型**: 模态框（URL: `/dashboard?ticket=uuid` 或 `/tickets?ticket=uuid`）

---

## 入口说明

| 入口 | URL | 返回行为 |
|------|-----|---------|
| Dashboard Recent Activity | `/dashboard?ticket=uuid` | 关闭回到Dashboard |
| 工单列表页（表格行） | `/tickets?ticket=uuid&...` | 关闭回到列表（保留筛选） |
| 工单列表页（[View]按钮） | 同上 | 同上 |

**实现**：
```typescript
// 打开详情
router.push(`${currentPath}?ticket=${ticketId}`, { scroll: false });

// 关闭详情
const closeModal = () => {
  const params = new URLSearchParams(searchParams);
  params.delete('ticket');
  router.push(`${currentPath}?${params.toString()}`);
};
```

---

## 界面设计

### 场景A: 租客提交的NEW工单（初次打开）

```
┌──────────────────────────────────────────────────┐
│  Ticket #TKT-12345                    [X]        │
├──────────────────────────────────────────────────┤
│                                                  │
│  🔴 Status: NEW - Unread                         │
│  📋 Source: Tenant Submitted                     │
│                                                  │
│  URGENT - Plumbing Issue                         │
│  🏠 123 Main St, Apt 2B                         │
│  📅 Submitted: Dec 20, 2024 10:30 AM            │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  🤖 AI Analysis                                  │
│  Category: Plumbing • Severity: High            │
│  Summary: Kitchen sink pipe leaking slowly      │
│  Suggested: Call licensed plumber               │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Tenant Description                           │
│  "Water is dripping from under the kitchen      │
│   sink. It's getting worse."                    │
│                                                  │
│  👤 Contact: John Doe                           │
│  📞 Phone: (555) 123-4567                       │
│  ✉️ Email: john@example.com                     │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📷 Photos (2)                                   │
│  [Image 1] [Image 2]                            │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Landlord Notes                               │
│  ┌────────────────────────────────────────┐    │
│  │ [点击输入备注...]                      │    │ ← inline编辑
│  └────────────────────────────────────────┘    │
│  [Save] ← 修改后出现                            │
│                                                  │
│  [Mark Complete (No Receipt)]  [Close with Receipt]  [Close as Invalid]
│                                                  │
└──────────────────────────────────────────────────┘
```

**打开时自动操作**：
- NEW状态自动转为ACTION_REQUIRED（标记已读）
- 页面加载时调用：`PUT /api/tickets/[id]/mark-read`

### 场景B: 租客提交的ACTION_REQUIRED工单（已读）

```
┌──────────────────────────────────────────────────┐
│  Ticket #TKT-12345                    [X]        │
├──────────────────────────────────────────────────┤
│                                                  │
│  🟡 Status: ACTION REQUIRED                      │
│  📋 Source: Tenant Submitted                     │
│  📅 Read: Dec 20, 2024 10:32 AM                 │ ← 已读时间
│                                                  │
│  [工单内容同上...]                               │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Landlord Notes                               │
│  ┌────────────────────────────────────────┐    │
│  │ Called Joe the plumber, he'll come    │    │
│  │ tomorrow morning.                      │    │ ← 可直接编辑
│  └────────────────────────────────────────┘    │
│  [Save] ← 内容变化后出现                        │
│                                                  │
│  [Mark Complete (No Receipt)]  [Close with Receipt]  [Close as Invalid]
│                                                  │
└──────────────────────────────────────────────────┘
```

### 场景C: 手动导入的CLOSED工单（查看模式）

```
┌──────────────────────────────────────────────────┐
│  Ticket #TKT-67890                    [X]        │
├──────────────────────────────────────────────────┤
│                                                  │
│  ✅ Status: CLOSED                               │
│  📝 Source: Manual Entry                         │
│                                                  │
│  Kitchen Faucet Replacement                      │
│  🏠 456 Oak Ave                                 │
│  📅 Repair Date: Mar 15, 2024                   │
│  💰 Cost: $150.00                               │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Description                                  │
│  Replaced old kitchen faucet with new one.      │
│  Purchased from Home Depot.                     │
│                                                  │
│  🏢 Vendor: DIY (Self-repair)                   │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📄 Receipt                                      │
│  [receipt.pdf] [View]                           │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Notes                                        │
│  Took about 2 hours. Easy installation.         │
│                                                  │
│  [Edit]  [Delete]                               │
│                                                  │
└──────────────────────────────────────────────────┘
```

**点击[Edit]后**：
```
┌──────────────────────────────────────────────────┐
│  Ticket #TKT-67890                    [X]        │
├──────────────────────────────────────────────────┤
│                                                  │
│  ✅ Status: CLOSED                               │
│  📝 Source: Manual Entry                         │
│                                                  │
│  Description:                                    │
│  ┌────────────────────────────────────────┐    │
│  │ Kitchen Faucet Replacement            │    │ ← 可编辑
│  └────────────────────────────────────────┘    │
│                                                  │
│  Property: [456 Oak Ave ▼]                      │ ← 下拉选择
│  Repair Date: [Mar 15, 2024 📅]                │ ← 日期选择器
│  Cost: [$150.00]                                 │ ← 可编辑
│                                                  │
│  Vendor: [DIY (Self-repair)]                    │ ← 可编辑
│                                                  │
│  Receipt: [receipt.pdf] [Change File]           │
│                                                  │
│  Notes:                                          │
│  ┌────────────────────────────────────────┐    │
│  │ Took about 2 hours.                   │    │ ← 可编辑
│  └────────────────────────────────────────┘    │
│                                                  │
│  [Save]  [Cancel]  [Delete]                     │ ← Edit变为Save
│                                                  │
└──────────────────────────────────────────────────┘
```

**删除确认弹窗**：
```
┌────────────────────────────────────┐
│  Delete Ticket                     │
├────────────────────────────────────┤
│                                    │
│  ⚠️ Are you sure?                  │
│                                    │
│  This will permanently delete:     │
│  "Kitchen Faucet Replacement"      │
│  Cost: $150.00                     │
│                                    │
│  This action cannot be undone.     │
│                                    │
│  [Cancel]  [Delete Permanently]    │
│                                    │
└────────────────────────────────────┘
```

### 场景D: 租客提交的PENDING_RECEIPT工单

```
┌──────────────────────────────────────────────────┐
│  Ticket #TKT-45678                    [X]        │
├──────────────────────────────────────────────────┤
│                                                  │
│  ⚠️ Status: PENDING RECEIPT                      │
│  📋 Source: Tenant Submitted                     │
│                                                  │
│  AC Repair                                       │
│  🏠 789 Elm St                                  │
│  📅 Submitted: Jun 10, 2024                     │
│  📅 Marked Complete: Jun 15, 2024               │
│  💰 Cost: $350.00                               │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  🤖 AI Analysis                                  │
│  Category: HVAC • Severity: Medium              │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Tenant Description                           │
│  "AC stopped working, very hot."                │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ⚠️ Missing Receipt                              │
│                                                  │
│  📎 Upload Receipt:                             │
│  [Choose File] or [Drag and Drop]              │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Landlord Notes                               │
│  ┌────────────────────────────────────────┐    │
│  │ AC tech came and fixed. Waiting for   │    │ ← 直接编辑
│  │ invoice from contractor.               │    │
│  └────────────────────────────────────────┘    │
│  [Save] ← 修改后出现                            │
│                                                  │
│  [Mark as Closed]                               │ ← 更明确的按钮文字
│                                                  │
└──────────────────────────────────────────────────┘
```

**[Mark as Closed]二次确认弹窗（无receipt）**：
```
┌────────────────────────────────────┐
│  Mark as Closed                    │
├────────────────────────────────────┤
│                                    │
│  ⚠️ Close without receipt?         │
│                                    │
│  This ticket will be marked as     │
│  CLOSED without a receipt.         │
│                                    │
│  You can still upload a receipt    │
│  later by reopening this ticket.   │
│                                    │
│  [Cancel]  [Mark as Closed]        │
│                                    │
└────────────────────────────────────┘
```

**[Mark as Closed]二次确认弹窗（有receipt）**：
```
┌────────────────────────────────────┐
│  Mark as Closed                    │
├────────────────────────────────────┤
│                                    │
│  ✅ Mark this ticket as closed?    │
│                                    │
│  Receipt: receipt.pdf              │
│  Cost: $350.00                     │
│                                    │
│  This will finalize the ticket.    │
│                                    │
│  [Cancel]  [Mark as Closed]        │
│                                    │
└────────────────────────────────────┘
```

### 场景E: 租客提交的CLOSED工单（可编辑）

```
┌──────────────────────────────────────────────────┐
│  Ticket #TKT-99999                    [X]        │
├──────────────────────────────────────────────────┤
│                                                  │
│  ✅ Status: CLOSED                               │
│  📋 Source: Tenant Submitted                     │
│  📅 Closed: Dec 22, 2024                        │
│  💰 Cost: $200.00                               │
│                                                  │
│  Heater Repair                                   │
│  🏠 321 Pine St                                 │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  🤖 AI Analysis                                  │
│  Category: HVAC • Severity: High                │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Tenant Description                           │
│  "Heater not working in living room."           │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📄 Receipt                                      │
│  [receipt.pdf] [View]                           │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📝 Landlord Notes                               │
│  HVAC contractor came and fixed.                │
│                                                  │
│  [Edit]                                         │
│                                                  │
└──────────────────────────────────────────────────┘
```

**点击[Edit]后**（与手动导入类似）：
```
┌──────────────────────────────────────────────────┐
│  Ticket #TKT-99999                    [X]        │
├──────────────────────────────────────────────────┤
│                                                  │
│  ✅ Status: CLOSED                               │
│  📋 Source: Tenant Submitted                     │
│                                                  │
│  [租客信息不可编辑...]                           │
│                                                  │
│  Cost: [$200.00]                                 │ ← 可编辑
│  Repair Date: [Dec 22, 2024 📅]                │ ← 可编辑
│  Receipt: [receipt.pdf] [Change File]           │
│                                                  │
│  Notes:                                          │
│  ┌────────────────────────────────────────┐    │
│  │ HVAC contractor came and fixed.       │    │ ← 可编辑
│  └────────────────────────────────────────┘    │
│                                                  │
│  [Save]  [Cancel]                               │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 状态Badge

| Status | 显示 | 颜色 |
|--------|------|------|
| NEW | 🔴 Status: NEW - Unread | 红色 |
| ACTION_REQUIRED | 🟡 Status: ACTION REQUIRED | 黄色 |
| PENDING_RECEIPT | ⚠️ Status: PENDING RECEIPT | 橙色 |
| CLOSED | ✅ Status: CLOSED | 绿色 |
| ARCHIVED | 📦 Status: ARCHIVED | 灰色 |

**来源标识**：
- 📋 Source: Tenant Submitted
- 📝 Source: Manual Entry

---

## 自动标记已读

**触发**：打开NEW状态的工单弹窗

**行为**：
```typescript
// 组件挂载时
useEffect(() => {
  if (ticket.status === 'new') {
    fetch(`/api/tickets/${ticketId}/mark-read`, { method: 'PUT' });
    // NEW → ACTION_REQUIRED
  }
}, []);
```

**API**: `PUT /api/tickets/[id]/mark-read`

---

## 操作按钮规则

| Status | Source | 按钮 |
|--------|--------|------|
| NEW / ACTION_REQUIRED | tenant | [Mark Complete (No Receipt)] [Close with Receipt] [Close as Invalid] |
| PENDING_RECEIPT | tenant | [Mark as Closed] (智能二次确认) + inline编辑notes、上传文件 |
| CLOSED | tenant | [Edit] → [Save] + [Cancel] |
| CLOSED / ARCHIVED | manual | [Edit] → [Save] + [Cancel] + [Delete] |

**PENDING_RECEIPT二次确认逻辑**：
- 无receipt → ⚠️ 警告弹窗："Close without receipt?"
- 有receipt → ✅ 确认弹窗：显示receipt文件名和cost

---

## 交互实现

### 1. Landlord Notes（inline编辑）

**所有租客提交的工单**都支持直接编辑notes：

```typescript
const [notes, setNotes] = useState(ticket.landlord_notes || '');
const [isDirty, setIsDirty] = useState(false);

const handleNotesChange = (e) => {
  setNotes(e.target.value);
  setIsDirty(e.target.value !== ticket.landlord_notes);
};

const handleSaveNotes = async () => {
  await fetch(`/api/tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify({ landlord_notes: notes })
  });
  setIsDirty(false);
};

// UI
<textarea value={notes} onChange={handleNotesChange} />
{isDirty && <Button onClick={handleSaveNotes}>Save</Button>}
```

### 2. Mark Complete (No Receipt)

**点击后直接操作**（不弹窗）：

```typescript
const handleMarkComplete = async () => {
  const cost = prompt('Enter final cost:');
  if (!cost) return;
  
  await fetch(`/api/tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'pending_receipt',
      final_cost: parseFloat(cost),
      closed_at: new Date().toISOString()
    })
  });
  
  closeModal();
  router.refresh();
};
```

### 3. Close with Receipt

#### 流程步骤

**步骤1：选择文件**
```
┌────────────────────────────────────┐
│  Close with Receipt                │
├────────────────────────────────────┤
│                                    │
│  Upload Receipt                    │
│  ┌──────────────────────────┐     │
│  │  [Drop file or click]    │     │
│  │                          │     │
│  │  📄 Supports: PDF, JPG,  │     │
│  │     PNG (Max 10MB)       │     │
│  └──────────────────────────┘     │
│                                    │
│  [Cancel]                          │
│                                    │
└────────────────────────────────────┘
```

**步骤2：AI识别中**
```
┌────────────────────────────────────┐
│  Analyzing Receipt...              │
├────────────────────────────────────┤
│                                    │
│  🤖 AI is reading the receipt...   │
│                                    │
│  ⏳ Extracting:                    │
│     • Vendor name                  │
│     • Total amount                 │
│     • Date                         │
│                                    │
│  Please wait...                    │
│                                    │
└────────────────────────────────────┘
```

**步骤3：确认识别结果**
```
┌────────────────────────────────────┐
│  Confirm Receipt Details           │
├────────────────────────────────────┤
│                                    │
│  📄 Receipt Preview                │
│  [receipt-thumbnail.jpg]  [View]   │
│                                    │
│  ✨ AI Recognized (92% confidence) │
│                                    │
│  Vendor: [ABC Plumbing Inc.]  ✏️   │ ← 可编辑
│  Cost:   [$150.00]            ✏️   │
│  Date:   [Mar 15, 2024]       📅   │
│                                    │
│  [Cancel]  [Confirm & Close]       │
│                                    │
└────────────────────────────────────┘
```

**说明**：
- Notes使用ticket自带的`landlord_notes`字段
- 所有字段可编辑（纠错）
- 点击缩略图或[View]查看完整receipt

**步骤4：AI识别失败（fallback）**
```
┌────────────────────────────────────┐
│  Manual Entry Required             │
├────────────────────────────────────┤
│                                    │
│  ⚠️ Unable to read receipt         │
│                                    │
│  Receipt: receipt.pdf  [View]      │
│                                    │
│  Please enter details manually:    │
│                                    │
│  Vendor: [_______________]         │
│  Cost:   [$_______________] *      │
│  Date:   [_______________] 📅      │
│                                    │
│  [Cancel]  [Save & Close]          │
│                                    │
└────────────────────────────────────┘
```

**说明**：
- Receipt已上传，链接显示在顶部
- 手动输入识别失败的信息
- Notes仍使用ticket的`landlord_notes`字段

#### 实现代码

```typescript
const handleCloseWithReceipt = async () => {
  // 步骤1：选择文件
  const file = await selectFile({
    accept: 'image/*,application/pdf',
    maxSize: 10 * 1024 * 1024 // 10MB
  });
  
  if (!file) return;
  
  // 步骤2：上传文件到存储
  showLoading('Uploading receipt...');
  const { receipt_url } = await uploadFile(file);
  
  // 步骤3：AI识别
  showLoading('🤖 AI is reading the receipt...');
  
  try {
    const aiResult = await fetch('/api/ai/analyze-receipt', {
      method: 'POST',
      body: JSON.stringify({ receipt_url })
    }).then(r => r.json());
    
    // 步骤4：显示确认对话框
    const confirmed = await openConfirmDialog({
      title: 'Confirm Receipt Details',
      component: ReceiptConfirmForm,
      data: {
        receipt_url,
        vendor: aiResult.vendor || '',
        final_cost: aiResult.total_amount || '',
        repair_date: aiResult.date || new Date(),
        confidence: aiResult.confidence,
        ai_recognized: true
      }
    });
    
    if (confirmed) {
      // 步骤5：保存工单
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'closed',
          closed_reason: 'completed',
          final_cost: confirmed.final_cost,
          receipt_url: confirmed.receipt_url,
          receipt_vendor_name: confirmed.vendor,
          receipt_ai_confidence: aiResult.confidence,
          receipt_ai_recognized: true,
          closed_at: confirmed.repair_date
          // landlord_notes使用ticket自带的字段，不在这里传
        })
      });
      
      closeModal();
      router.refresh();
    }
    
  } catch (error) {
    // AI识别失败：显示手动输入表单
    const manual = await openManualEntryDialog({
      receipt_url,
      ai_recognized: false
    });
    
    if (manual) {
      await saveTicket(manual);
    }
  }
};
```

#### AI识别结果确认表单组件

```typescript
interface ReceiptConfirmFormProps {
  receipt_url: string;
  vendor: string;
  final_cost: number;
  repair_date: Date;
  confidence?: number;
  ai_recognized: boolean;
}

const ReceiptConfirmForm = ({ data, onConfirm, onCancel }: Props) => {
  const [formData, setFormData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="receipt-confirm-form">
      {/* Receipt预览 */}
      <div className="receipt-preview">
        <img src={getThumbnail(data.receipt_url)} alt="Receipt" />
        <button onClick={() => viewFullReceipt(data.receipt_url)}>
          View Full Receipt
        </button>
      </div>
      
      {/* AI识别标识 */}
      {data.ai_recognized && (
        <div className="ai-badge">
          ✨ AI Recognized
          {data.confidence && (
            <span className="confidence">
              {Math.round(data.confidence * 100)}% confidence
            </span>
          )}
        </div>
      )}
      
      {/* 可编辑字段 */}
      <div className="form-fields">
        <div className="field">
          <label>Vendor</label>
          <input
            value={formData.vendor}
            onChange={(e) => setFormData({...formData, vendor: e.target.value})}
            placeholder="e.g., ABC Plumbing Inc."
          />
        </div>
        
        <div className="field">
          <label>Cost *</label>
          <input
            type="number"
            step="0.01"
            value={formData.final_cost}
            onChange={(e) => setFormData({...formData, final_cost: parseFloat(e.target.value)})}
            required
          />
        </div>
        
        <div className="field">
          <label>Repair Date</label>
          <input
            type="date"
            value={formatDate(formData.repair_date)}
            onChange={(e) => setFormData({...formData, repair_date: new Date(e.target.value)})}
          />
        </div>
      </div>
      
      {/* 说明：Notes使用ticket自带的landlord_notes */}
      <div className="info-text">
        💡 Use the ticket's Notes field to add comments
      </div>
      
      {/* 操作按钮 */}
      <div className="actions">
        <button onClick={onCancel} variant="secondary">
          Cancel
        </button>
        <button 
          onClick={() => onConfirm(formData)} 
          disabled={!formData.final_cost}
        >
          Confirm & Close
        </button>
      </div>
    </div>
  );
};
```

### 4. Close as Invalid

**弹窗输入原因**：

```typescript
const handleCloseAsInvalid = () => {
  openDialog({
    title: 'Close as Invalid',
    message: 'This ticket will be marked as CLOSED (Invalid) and will NOT count towards your Free plan limit.',
    fields: {
      reason: { 
        type: 'textarea', 
        label: 'Reason (optional)',
        placeholder: 'e.g., Not a maintenance issue, duplicate, tenant resolved...'
      }
    },
    onSubmit: async (data) => {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'closed',
          closed_reason: 'invalid',
          landlord_notes: data.reason,
          closed_at: new Date().toISOString()
        })
      });
      
      closeModal();
      router.refresh();
    }
  });
};
```

**Free配额逻辑**：
```typescript
// 统计Free用户已用工单时，排除invalid
const usedTickets = await db
  .select()
  .from(tickets)
  .where(
    and(
      eq(tickets.landlord_id, userId),
      eq(tickets.source, 'tenant_submitted'),
      ne(tickets.closed_reason, 'invalid')  // ← 排除invalid
    )
  );
```

### 5. 手动导入工单Edit → Save

```typescript
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState(ticket);

const handleEdit = () => setIsEditing(true);
const handleCancel = () => {
  setIsEditing(false);
  setFormData(ticket);
};

const handleSave = async () => {
  await fetch(`/api/tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify(formData)
  });
  setIsEditing(false);
  router.refresh();
};

// UI
{isEditing ? (
  <>
    <EditForm data={formData} onChange={setFormData} />
    <Button onClick={handleSave}>Save</Button>
    <Button onClick={handleCancel}>Cancel</Button>
    <Button onClick={handleDelete} variant="danger">Delete</Button>
  </>
) : (
  <>
    <ViewMode data={formData} />
    <Button onClick={handleEdit}>Edit</Button>
    <Button onClick={handleDelete} variant="danger">Delete</Button>
  </>
)}
```

### 6. PENDING_RECEIPT工单[Mark as Closed]按钮

**判断receipt状态，显示不同确认弹窗**：

```typescript
const handleMarkAsClosed = () => {
  const hasReceipt = !!ticket.receipt_url;
  
  if (hasReceipt) {
    // 有receipt：显示确认信息
    openConfirmDialog({
      title: 'Mark as Closed',
      message: `✅ Mark this ticket as closed?\n\nReceipt: ${ticket.receipt_url.split('/').pop()}\nCost: $${ticket.final_cost}\n\nThis will finalize the ticket.`,
      confirmText: 'Mark as Closed',
      onConfirm: async () => {
        await fetch(`/api/tickets/${ticketId}`, {
          method: 'PUT',
          body: JSON.stringify({
            status: 'closed',
            closed_reason: 'completed'
          })
        });
        
        closeModal();
        router.refresh();
      }
    });
  } else {
    // 无receipt：警告提示
    openConfirmDialog({
      title: 'Mark as Closed',
      message: '⚠️ Close without receipt?\n\nThis ticket will be marked as CLOSED without a receipt.\n\nYou can still upload a receipt later by reopening this ticket.',
      confirmText: 'Mark as Closed',
      confirmVariant: 'warning',
      onConfirm: async () => {
        await fetch(`/api/tickets/${ticketId}`, {
          method: 'PUT',
          body: JSON.stringify({
            status: 'closed',
            closed_reason: 'completed'
          })
        });
        
        closeModal();
        router.refresh();
      }
    });
  }
};
```

**上传文件（自动关闭）**：
```typescript
const handleUploadReceipt = async (file: File) => {
  const formData = new FormData();
  formData.append('receipt', file);
  
  await fetch(`/api/tickets/${ticketId}/upload-receipt`, {
    method: 'POST',
    body: formData
  });
  // API自动将status改为CLOSED
  
  router.refresh();
};
```

### 7. 租客提交的CLOSED工单编辑

**可编辑字段**（租客信息不可编辑）：

```typescript
const handleEditTenantClosed = () => {
  setIsEditing(true);
  // 只能编辑：final_cost, closed_at, receipt_url, landlord_notes
};

const handleSave = async () => {
  await fetch(`/api/tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify({
      final_cost: formData.final_cost,
      closed_at: formData.closed_at,
      receipt_url: formData.receipt_url,
      landlord_notes: formData.landlord_notes
      // 不包括tenant_name, tenant_email等字段
    })
  });
  
  setIsEditing(false);
  router.refresh();
};
```

---

## API

### GET /api/tickets/[id]

```typescript
{
  id: string;
  status: 'new' | 'action_required' | 'pending_receipt' | 'closed' | 'archived';
  source: 'tenant_submitted' | 'landlord_manual';
  description: string;
  property_id: string;
  property_address: string;
  created_at: string;
  closed_at?: string;
  final_cost?: number;
  receipt_url?: string;
  landlord_notes?: string;
  
  // 租客提交额外字段
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  ai_category?: string;
  ai_severity?: string;
  ai_summary?: string;
  photos?: string[];
  
  // 手动导入额外字段
  vendor?: string;
  repair_date?: string;
}
```

### PUT /api/tickets/[id]

```typescript
{
  status?: TicketStatus;
  final_cost?: number;
  receipt_url?: string;
  landlord_notes?: string;
  closed_at?: string;
  closed_reason?: 'completed' | 'invalid';  // invalid工单不计入Free配额
  
  // 手动导入工单可编辑所有字段
  description?: string;
  property_id?: string;
  repair_date?: string;
  vendor?: string;
}
```

### PUT /api/tickets/[id]/mark-read

**行为**：NEW → ACTION_REQUIRED

```typescript
{
  status: 'action_required',
  read_at: new Date().toISOString()
}
```

### POST /api/tickets/[id]/upload-receipt

**请求**：`multipart/form-data` with `receipt` file

**响应**：
```typescript
{
  receipt_url: string;
  status: 'closed';  // 自动从pending_receipt转为closed
}
```

### DELETE /api/tickets/[id]

**响应**：`204 No Content`

---

### POST /api/ai/analyze-receipt

**用途**：使用Gemini 1.5 Flash分析receipt图片，提取关键信息

**请求**：
```typescript
{
  receipt_url: string;  // 已上传的receipt文件URL
}
```

**响应**（成功）：
```typescript
{
  success: true,
  vendor: string,           // 供应商名称
  total_amount: number,     // 总金额
  date: string,             // ISO格式日期
  confidence: number,       // 0-1之间，识别置信度
  raw_text?: string,        // 原始识别文本（调试用）
  metadata: {
    model: 'gemini-1.5-flash',
    processing_time_ms: number
  }
}
```

**响应**（失败）：
```typescript
{
  success: false,
  error: string,
  fallback_to_manual: true
}
```

**示例**：
```typescript
// 请求
POST /api/ai/analyze-receipt
{
  "receipt_url": "https://storage.example.com/receipts/abc123.jpg"
}

// 响应
{
  "success": true,
  "vendor": "ABC Plumbing Inc.",
  "total_amount": 150.00,
  "date": "2024-03-15T00:00:00Z",
  "confidence": 0.92,
  "metadata": {
    "model": "gemini-1.5-flash",
    "processing_time_ms": 1850
  }
}
```

**错误处理**：
- 4xx客户端错误 → 显示错误信息
- 5xx服务端错误 → fallback到手动输入
- 超时（>10s） → fallback到手动输入

**Gemini Prompt示例**：
```
Analyze this receipt image and extract the following information in JSON format:
{
  "vendor": "Vendor/company name",
  "total_amount": numeric value only (no currency symbols),
  "date": "YYYY-MM-DD format",
  "confidence": your confidence score 0-1
}

Rules:
- If you see "TOTAL", "AMOUNT DUE", "BALANCE DUE", or similar, use that as total_amount
- Date should be the transaction date, not due date or created date
- If uncertain about any field, set confidence lower (0.5-0.7)
- Return null for fields you cannot determine with confidence
- Do not include $ or other currency symbols in total_amount

Examples:
✅ Good: {"vendor": "ABC Plumbing", "total_amount": 150.00, "date": "2024-03-15", "confidence": 0.95}
❌ Bad: {"vendor": "", "total_amount": "$150", "date": "03/15/2024", "confidence": 1.0}
```

**Gemini API调用示例**：
```typescript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const result = await model.generateContent([
  prompt,
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image
    }
  }
]);

const response = JSON.parse(result.response.text());
```

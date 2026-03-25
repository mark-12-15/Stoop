# 12. 手动添加费用记录

**路由**: 弹窗（URL: `/dashboard?action=add-manual`）  
**访问**: 需登录

---

## 设计理念

手动添加功能支持**所有租赁费用类型**，解决以下场景：

### 维修相关
1. **历史维修数据**：产品上线前的维修记录
2. **房东DIY维修**：房东自己修理，无需租客提交
3. **外部维修商**：房东直接找人修，没走系统
4. **清洁和用品**：换房时清洁、Home Depot材料采购

### 其他费用
5. **固定费用**：保险、房产税、HOA费、物业管理费
6. **月度费用**：水电煤气（如房东承担）
7. **偶发费用**：招租广告、法律咨询、差旅里程

**核心原则**：
- ✅ 支持所有费用类型（维修、保险、税费等）
- ✅ 无数量限制（增加数据粘性）
- ✅ 所有字段可编辑（包括日期、费用类型）
- ✅ 支持批量导入（CSV）
- ✅ 直接CLOSED状态（无需走流程）

---

## 页面结构

### 单条添加弹窗

```
┌─────────────────────────────────────────────┐
│  Add Expense Record             [X]         │
├─────────────────────────────────────────────┤
│                                             │
│  Expense Type *                             │
│  ┌─────────────────────────────┐           │
│  │ Repairs & Maintenance ▼     │           │
│  └─────────────────────────────┘           │
│  › Repairs & Maintenance (default)          │
│  › Insurance                                │
│  › Property Tax                             │
│  › Mortgage Interest                        │
│  › Utilities                                │
│  › Management Fees                          │
│  › HOA Fees                                 │
│  › Cleaning & Maintenance                   │
│  › Legal & Professional Services            │
│  › Advertising                              │
│  › Supplies & Materials                     │
│  › Travel & Auto                            │
│  › Other                                    │
│                                             │
│  Date *                                     │
│  ┌─────────────────────────────┐           │
│  │ 📅 03/15/2024               │           │
│  └─────────────────────────────┘           │
│                                             │
│  Property *                                 │
│  ┌─────────────────────────────┐           │
│  │ 123 Main St, Apt 2B ▼       │           │
│  └─────────────────────────────┘           │
│                                             │
│  Description *                              │
│  ┌─────────────────────────────────────┐   │
│  │ Annual homeowners insurance premium │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Cost *                                     │
│  ┌─────────────────────────────┐           │
│  │ $ 150.00                    │           │
│  └─────────────────────────────┘           │
│                                             │
│  Receipts (Optional)                        │
│  ┌────────────────────────────────────┐    │
│  │  📁 [Upload Receipts]              │    │
│  │  or drag and drop images/PDFs      │    │
│  │  Supports: JPG, PNG, PDF           │    │
│  │  Limit: 20MB total (Free)          │    │
│  │  Multiple files supported          │    │
│  └────────────────────────────────────┘    │
│                                             │
│  Vendor Name (Optional)                     │
│  ┌─────────────────────────────┐           │
│  │ ABC Plumbing Company        │           │
│  └─────────────────────────────┘           │
│                                             │
│  Notes (Optional)                           │
│  ┌─────────────────────────────────────┐   │
│  │ Emergency repair on weekend         │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  💡 Tip: You can edit this record anytime  │
│                                             │
│  [ Cancel ]          [ Save Record ]        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 入口位置

### 1. Dashboard主按钮（主入口）

```
┌─────────────────────────────────────────────┐
│  Dashboard              [+ Add Expense]     │ ← 右上角按钮
│                                             │
│  ⚠️ Free Plan: 2/3 records used  [Upgrade] │
│  ...                                        │
└─────────────────────────────────────────────┘
```

### 2. 报税季Banner（引导入口）

```
│  📄 Tax Season Reminder                     │
│  ⚠️ You don't have any expense records      │
│  for 2025 yet.                              │
│  [+ Add Expense Records]                   │ ← 点击打开弹窗
```

### 3. Dashboard空状态（首次使用）

```
│  🎉 Welcome to StoopKeep!                    │
│                                             │
│  Get started by:                            │
│  1. [Share Property Link] with tenants     │
│  2. [+ Add Past Expenses] manually         │ ← 点击打开弹窗
```

### 4. 工单列表页（列表操作）

```
│  Expenses                   [+ Add Expense] │ ← 列表页右上角
```

---

## 字段说明

### 必填字段（5个）

| 字段 | 类型 | 验证规则 | 示例 |
|------|------|---------|------|
| **Expense Type** | Select | 必选，默认"Repairs & Maintenance" | Insurance |
| **Date** | Date | 不能晚于今天 | 2024-03-15 |
| **Property** | Select | 必须是用户的房产 | 123 Main St, Apt 2B |
| **Description** | Textarea | 最少10字符 | Annual homeowners insurance |
| **Cost** | Number | > 0, 最多2位小数 | 1200.00 |

### 可选字段（3个）

| 字段 | 类型 | 说明 | 限制 |
|------|------|------|------|
| **Receipts** | File(s) | 支持多张收据（JPG/PNG/PDF） | Free: 20MB/record, Pro: 50MB/record |
| **Vendor Name** | Text | 供应商/服务商名称 | 最多100字符 |
| **Notes** | Textarea | 额外备注 | 最多500字符 |

---

## 批量导入功能

### 入口

```
┌─────────────────────────────────────────────┐
│  Add Expense Record             [X]         │
├─────────────────────────────────────────────┤
│                                             │
│  📋 Need to add multiple records?           │
│  [Import from CSV] [Download Template]     │
│                                             │
│  ────────────── or ──────────────          │
│                                             │
│  Expense Type *                             │
│  ...                                        │
└─────────────────────────────────────────────┘
```

### CSV模板格式

```csv
expense_type,date,property_address,description,cost,vendor_name,notes
repair_maintenance,2024-03-15,"123 Main St, Apt 2B","Kitchen sink leak",150.00,"ABC Plumbing","Emergency repair"
insurance,2024-01-01,"123 Main St, Apt 2B","Annual homeowners insurance",1200.00,"State Farm",""
property_tax,2024-03-01,"456 Oak Ave","Q1 property tax",2500.00,"County Tax Office",""
cleaning,2024-02-15,"123 Main St, Apt 2B","Move-out deep cleaning",250.00,"Sparkle Clean",""
```

**CSV字段说明**：

| 字段 | 必填 | 格式 | 说明 |
|------|------|------|------|
| `expense_type` | ✅ | 枚举值 | 见下方"费用类型值"表格 |
| `date` | ✅ | YYYY-MM-DD | 费用发生日期 |
| `property_address` | ✅ | Text | 必须匹配你的房产地址 |
| `description` | ✅ | Text | 费用描述（至少10字符） |
| `cost` | ✅ | Number | 金额（最多2位小数） |
| `vendor_name` | ❌ | Text | 供应商名称（可为空） |
| `notes` | ❌ | Text | 备注（可为空） |

**费用类型值（expense_type）**：

| CSV值 | 显示名称 | Schedule E行号 |
|-------|---------|---------------|
| `repair_maintenance` | Repairs & Maintenance | Line 14 |
| `insurance` | Insurance | Line 9 |
| `property_tax` | Property Tax | Line 16 |
| `mortgage_interest` | Mortgage Interest | Line 13 |
| `utilities` | Utilities | Line 17 |
| `management_fees` | Management Fees | Line 12 |
| `hoa_fees` | HOA Fees | Line 18 |
| `cleaning` | Cleaning & Maintenance | Line 14 (合并到repairs) |
| `legal_professional` | Legal & Professional | Line 11 |
| `advertising` | Advertising | Line 5 |
| `supplies` | Supplies & Materials | Line 15 |
| `travel_auto` | Travel & Auto | Line 6 |
| `other` | Other | Line 19 |

**⚠️ 重要说明**：
- CSV导入**不包含收据文件**（CSV无法存储图片）
- `expense_type` 必须使用CSV值（小写+下划线），不能用显示名称
- 如需添加收据，导入后单独编辑每个工单上传
- 适用场景：快速导入历史数据的基本信息

---

**CSV导入逻辑**：
```typescript
async function importFromCSV(file: File) {
  const records = parseCSV(file);
  
  // 验证数据
  const validated = records.map(record => {
    if (!record.repair_date || !record.property_address || !record.description || !record.cost) {
      throw new Error(`Missing required fields in row: ${JSON.stringify(record)}`);
    }
    return record;
  });
  
  // 批量创建工单
  const results = await Promise.all(
    validated.map(record => createManualTicket({
      closed_at: new Date(record.repair_date),
      property_id: findPropertyByAddress(record.property_address),
      description: record.description,
      final_cost: parseFloat(record.cost),
      vendor_name: record.vendor_name || null,
      notes: record.notes || null,
      source: 'landlord_manual',
      status: 'closed',
      receipt_urls: []  // CSV导入无收据
    }))
  );
  
  // 显示导入结果
  showToast(`Successfully imported ${results.length} records. You can add receipts by editing each ticket.`);
}
```

---

## 编辑功能（重要）

### 编辑权限

**手动导入的工单 = 完全可编辑**

```typescript
// 任何时候都可以编辑所有字段
const editableFields = [
  'closed_at',      // ✅ 维修日期可改
  'property_id',    // ✅ 房产可改
  'description',    // ✅ 描述可改
  'final_cost',     // ✅ 金额可改
  'vendor_name',    // ✅ 供应商可改
  'notes',          // ✅ 备注可改
  'receipt_urls'    // ✅ 收据可增删改（多张）
];

// 不可编辑字段
const readOnlyFields = [
  'source',         // 固定 'landlord_manual'
  'status'          // 固定 'closed'
];
```

### 编辑入口

**工单列表页点击工单**：

```
┌─────────────────────────────────────────┐
│ Kitchen sink repair                     │
│ Property: 123 Main St, Apt 2B          │
│ Cost: $150 • Mar 15, 2024              │
│ Source: Manual Entry                    │ ← 标识
│                                         │
│ [Edit] [Delete]                        │ ← 操作按钮
└─────────────────────────────────────────┘
```

**编辑弹窗**（与添加弹窗相同，预填数据）：

```
┌─────────────────────────────────────────────┐
│  Edit Repair Record             [X]         │
├─────────────────────────────────────────────┤
│                                             │
│  Repair Date *                              │
│  ┌─────────────────────────────┐           │
│  │ 📅 03/15/2024  (editable)   │           │
│  └─────────────────────────────┘           │
│                                             │
│  Cost *                                     │
│  ┌─────────────────────────────┐           │
│  │ $ 150.00    (editable)      │           │
│  └─────────────────────────────┘           │
│                                             │
│  Receipts (2 files)                         │
│  ┌────────────────────────────────────┐    │
│  │ 📄 receipt1.pdf  [View] [Remove]   │    │
│  │ 📄 receipt2.jpg  [View] [Remove]   │    │
│  │                                    │    │
│  │ [+ Add More Receipts]              │    │
│  │ 15MB / 20MB used (Free plan)       │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ...                                        │
│                                             │
│  [ Cancel ]  [ Delete ]  [ Save Changes ]  │
│                                             │
└─────────────────────────────────────────────┘
```

### 批量操作（仅限手动导入工单）

**适用场景**：
- 批量修正房产归属（搬家后地址变更）
- 批量更新维修商名称（统一供应商信息）
- 批量删除错误数据

---

**工单列表页 - 批量选择模式**：

```
┌─────────────────────────────────────────────┐
│  Tickets                     [Batch Mode]   │ ← 开启批量模式
│                                             │
│  ☑️ 3 selected          [Actions ▼]        │
│                                             │
│  ✓ Kitchen sink - $150 - Mar 15 (Manual)   │ ← 只能选手动导入的
│  ✓ AC repair - $350 - Feb 10 (Manual)      │
│  ✓ Toilet clog - $80 - Jan 5 (Manual)      │
│  ☐ Water leak - $220 - Apr 1 (Tenant)      │ ← 租客提交的不可选
│  ☐ ...                                     │
└─────────────────────────────────────────────┘
```

---

**Actions下拉菜单**：

```
┌─────────────────────────┐
│ Batch Actions (3)       │
├─────────────────────────┤
│ 📝 Update Property      │ ← 统一改房产
│ 🏢 Update Vendor        │ ← 统一改供应商
│ ─────────────────────   │
│ 🗑️ Delete Selected      │ ← 批量删除
└─────────────────────────┘
```

**💡 导出功能说明**：
- 不支持从工单列表批量导出
- 所有导出统一在 `/reports` 页面完成
- 支持 Schedule E 和 Last 3 Years 报表

---

### 批量更新弹窗（Update Property/Vendor）

```
┌─────────────────────────────────────────────┐
│  Batch Update - 3 tickets       [X]         │
├─────────────────────────────────────────────┤
│                                             │
│  You're updating 3 manual tickets:          │
│  • Kitchen sink - $150 - Mar 15            │
│  • AC repair - $350 - Feb 10               │
│  • Toilet clog - $80 - Jan 5               │
│                                             │
│  ─────────────────────────────────         │
│                                             │
│  Change Property To:                        │
│  ┌─────────────────────────────┐           │
│  │ 123 Main St, Apt 2B ▼       │           │
│  └─────────────────────────────┘           │
│                                             │
│  Change Vendor To:                          │
│  ┌─────────────────────────────┐           │
│  │ ABC Plumbing Company        │           │
│  └─────────────────────────────┘           │
│                                             │
│  ⚠️ This will overwrite existing values    │
│  Leave blank to keep original values       │
│                                             │
│  [ Cancel ]          [ Apply Changes ]      │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 批量删除确认

```
┌─────────────────────────────────────────────┐
│  Delete 3 Tickets?              [X]         │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Are you sure you want to delete these? │
│                                             │
│  • Kitchen sink - $150 - Mar 15            │
│  • AC repair - $350 - Feb 10               │
│  • Toilet clog - $80 - Jan 5               │
│                                             │
│  Total amount: $580                         │
│                                             │
│  💡 This action cannot be undone.           │
│  Your tax reports will be affected.         │
│                                             │
│  [ Cancel ]          [ Yes, Delete ]        │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 批量操作限制

**只能批量操作手动导入的工单**：
- ✅ `source = 'landlord_manual'`
- ❌ `source = 'tenant_submitted'`（租客提交的不能批量操作）

**不支持批量修改的字段**（因为每个工单不同）：
- ❌ Repair Date（日期各不相同）
- ❌ Cost（金额各不相同）
- ❌ Description（描述各不相同）
- ❌ Receipts（收据各不相同）

**支持批量修改的字段**（可以统一更改）：
- ✅ Property（搬家场景：所有工单从旧地址改到新地址）
- ✅ Vendor（统一供应商：所有Joe's Plumbing改成Joe's Professional Plumbing LLC）

---

## 与租客提交工单的区别

| 特性 | 租客提交工单 | 手动导入工单 |
|------|------------|------------|
| **数量限制** | Free: 3个 | ✅ 无限 |
| **创建状态** | NEW | CLOSED |
| **状态流程** | NEW → ACTION_REQUIRED → CLOSED | 固定CLOSED |
| **租客信息** | 有（tenant_name等） | 无 |
| **AI分析** | 必须有 | 无 |
| **日期** | 系统时间 | ✅ 用户输入任意日期 |
| **编辑权限** | CLOSED后不可编辑 | ✅ 任何时候都可编辑 |
| **删除权限** | NEW/ACTION_REQUIRED可删除 | ✅ 任何时候都可删除 |
| **批量操作** | 不支持 | ✅ 支持批量编辑/删除 |
| **标识** | 无特殊标识 | 显示"Manual Entry"标签 |

---

## 数据库字段

**tickets表新增字段**：

```sql
ALTER TABLE tickets
ADD COLUMN source VARCHAR(20) DEFAULT 'tenant_submitted' 
CHECK (source IN ('tenant_submitted', 'landlord_manual'));

-- 收据文件（JSONB格式，只存储URL和Size）
ADD COLUMN receipt_files JSONB DEFAULT '[]';

-- 该工单收据总大小（bytes，用于快速配额检查）
ADD COLUMN total_receipt_size BIGINT DEFAULT 0;
```

**receipt_files 字段说明**：
- 类型：JSONB数组
- 每个元素：`{"url": "string", "size": number}`
- 示例：`[{"url": "https://...", "size": 8388608}]`
- 用途：记录收据URL和文件大小，用于配额校验

**用户总存储计算**：
```sql
-- 查询用户总存储使用量
SELECT SUM(total_receipt_size) as total_storage
FROM tickets
WHERE landlord_id = ? AND total_receipt_size > 0;
```

**手动导入工单的数据示例**：

```json
{
  "id": "uuid-123",
  "source": "landlord_manual",
  "status": "closed",
  "property_id": "prop-456",
  "description": "Kitchen sink pipe repair",
  "final_cost": 150.00,
  "vendor_name": "ABC Plumbing",
  "notes": "Emergency repair",
  
  // ✅ 收据文件（只存储URL和Size用于配额校验）
  "receipt_files": [
    {
      "url": "https://r2.../receipts/uuid-123/receipt1.pdf",
      "size": 8388608  // 8MB (bytes)
    },
    {
      "url": "https://r2.../receipts/uuid-123/receipt2.jpg",
      "size": 7340032  // 7MB (bytes)
    }
  ],
  "total_receipt_size": 15728640,  // 15MB total (用于快速配额检查)
  
  "closed_at": "2024-03-15T10:00:00Z",  // 用户输入的日期
  "created_at": "2025-01-20T14:30:00Z",  // 实际创建时间
  "updated_at": "2025-01-20T14:30:00Z",
  
  // 以下字段为NULL
  "tenant_identifier": null,
  "tenant_name": null,
  "tenant_email": null,
  "tenant_phone": null,
  "ai_category": null,
  "ai_severity": null,
  "ai_summary": null,
  "is_emergency": false
}
```

---

## API端点

### 创建手动工单

```typescript
POST /api/tickets/manual

Body (multipart/form-data):
{
  "repair_date": "2024-03-15",
  "property_id": "uuid",
  "description": "Kitchen sink repair",
  "cost": 150.00,
  "receipt_files": File[], // ✅ 支持多个文件
  "vendor_name": "ABC Plumbing" (optional),
  "notes": "Emergency repair" (optional)
}

Response:
{
  "success": true,
  "ticket": {
    "id": "uuid-123",
    "receipt_files": [
      {"url": "https://r2.../receipt1.pdf", "size": 8388608},
      {"url": "https://r2.../receipt2.jpg", "size": 7340032}
    ],
    "total_receipt_size": 15728640
  }
}

Error (超出配额):
{
  "success": false,
  "error": "STORAGE_LIMIT_EXCEEDED",
  "message": "Total file size (25MB) exceeds your plan limit (20MB per ticket for Free plan)",
  "details": {
    "total_size": 26214400,
    "limit": 20971520,
    "plan": "free"
  }
}
```

**文件上传验证逻辑**：
```typescript
async function uploadReceipts(files: File[], user: User, ticketId: string) {
  // 1. 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}`);
    }
  }
  
  // 2. 计算总大小
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  
  // 3. 检查per-ticket限制
  const perTicketLimit = user.plan === 'free' ? 20 * 1024 * 1024 : 50 * 1024 * 1024;
  if (totalSize > perTicketLimit) {
    throw new StorageLimitError({
      type: 'PER_TICKET_LIMIT',
      totalSize,
      limit: perTicketLimit,
      plan: user.plan
    });
  }
  
  // 4. 检查用户总存储配额
  const userTotalStorage = await calculateUserStorage(user.id);
  const totalLimit = user.plan === 'free' ? 100 * 1024 * 1024 : 5 * 1024 * 1024 * 1024;
  if (userTotalStorage + totalSize > totalLimit) {
    throw new StorageLimitError({
      type: 'TOTAL_STORAGE_LIMIT',
      current: userTotalStorage,
      adding: totalSize,
      limit: totalLimit,
      plan: user.plan
    });
  }
  
  // 5. 上传到R2并构建简化JSON
  const receiptFiles = await Promise.all(
    files.map(async (file) => {
      const url = await uploadToR2(file, ticketId);
      return {
        url,
        size: file.size
      };
    })
  );
  
  return { receiptFiles, totalSize };
}
```

### 编辑手动工单

```typescript
PATCH /api/tickets/:id/manual

Body: (所有字段都可选，只更新提供的字段)
{
  "repair_date": "2024-03-20",
  "property_id": "new-uuid",
  "description": "Updated description",
  "cost": 180.00,
  "vendor_name": "New Vendor",
  "notes": "Updated notes"
}

// 验证：只有 source='landlord_manual' 的工单可以编辑
```

### 批量导入CSV

```typescript
POST /api/tickets/manual/batch

Body: FormData
{
  "csv_file": File
}

Response:
{
  "success": true,
  "imported": 25,
  "failed": 2,
  "errors": [
    { "row": 3, "error": "Invalid date format" },
    { "row": 7, "error": "Property not found" }
  ]
}
```

---

## 用户流程

### 流程1: 新用户导入历史数据

```
1. 注册登录
2. Dashboard空状态 → 点击[Add Past Repairs]
3. 看到两个选项：
   - 单条添加
   - 批量导入CSV
4. 下载CSV模板
5. 在Excel填写100个历史工单
6. 上传CSV
7. 系统导入100个工单（全部CLOSED状态）
8. 成功！数据已在系统中
```

### 流程2: 房东自己修理

```
1. 房东周末自己修了个水龙头
2. Dashboard → 点击[+ Add Repair]
3. 填写：
   - 日期：今天
   - 房产：123 Main St
   - 描述：Kitchen faucet replacement
   - 费用：$80（Home Depot买的配件）
   - 上传：Home Depot收据照片
4. 保存
5. 直接进入CLOSED状态，计入当年税务抵扣
```

### 流程3: 批量修改供应商名称

```
1. 工单列表页
2. 多选25个工单（都是同一个供应商）
3. 点击"Batch Actions" → "Update Vendor"
4. 输入供应商新名称："ABC Plumbing LLC"
5. 应用更改
6. 25个工单的供应商同时更新
```

---

## 设计原则总结

✅ **无限制导入** - 增加数据粘性，成本几乎为零  
✅ **完全可编辑** - 让用户用着爽，随时修正数据  
✅ **批量操作** - 提升效率，适合大量历史数据  
✅ **清晰标识** - "Manual Entry"标签，区分数据来源  
✅ **简化流程** - 直接CLOSED，无需走状态机

**核心逻辑**：数据进得去（无限），出不来（导出限制3个），要出来（付费）

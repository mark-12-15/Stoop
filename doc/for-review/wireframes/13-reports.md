# 13. 税务报表页面

**路由**: `/reports`  
**访问**: 需登录

**用途**: 导出Schedule E和3年报表（专门用于报税）

---

## 设计理念

这是一个**专注报税导出**的页面：
- 只有2个导出选项：Schedule E（年度）+ Last 3 Years（审计）
- **支持所有费用类型**：维修、保险、房产税、水电费等
- 可预览报表内容（检查后再导出）
- 可从Dashboard直接导出（快速操作）
- 可从Reports页面预览导出（仔细检查）
- Schedule E导出按IRS标准分行显示所有费用类型

---

## 页面结构

```
┌──────────────────────────────────────────────────┐
│  [Logo] StoopKeep                      [👤 John ▼]│
├──────────────────────────────────────────────────┤
│                                                  │
│  Tax Reports                                     │
│  Export IRS-ready reports for your CPA           │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 📊 Schedule E (Annual Report)              │ │
│  │                                            │ │
│  │  Tax Year: [2024 ▼]                       │ │
│  │                                            │ │
│  │  Summary:                                  │ │
│  │  • 135 expense records                     │ │
│  │  • Total deductions: $45,780               │ │
│  │  • 3 properties                            │ │
│  │                                            │ │
│  │  Breakdown:                                │ │
│  │  • Repairs & Maintenance: $18,234          │ │
│  │  • Insurance: $3,600                       │ │
│  │  • Property Tax: $15,000                   │ │
│  │  • Utilities: $4,800                       │ │
│  │  • Other: $4,146                           │ │
│  │                                            │ │
│  │  [Preview Report]  [📥 Export Excel]       │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 📁 Last 3 Years Report (IRS Audit Ready)   │ │
│  │                                            │ │
│  │  Coverage: 2022 - 2024 (rolling 3 years)   │ │
│  │                                            │ │
│  │  Summary:                                  │ │
│  │  • 128 closed repairs                      │ │
│  │  • Total deductions: $52,891               │ │
│  │  • 3 properties                            │ │
│  │                                            │ │
│  │  Year-by-Year Breakdown:                   │ │
│  │  2024: $18,234 (43 repairs)                │ │
│  │  2023: $22,456 (52 repairs)                │ │
│  │  2022: $12,201 (33 repairs)                │ │
│  │                                            │ │
│  │  [Preview Report]  [📥 Export Excel]       │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ⚠️ Disclaimer: This is not tax advice.         │
│  Please consult a CPA for your tax filing.      │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 导出选项详解

### 1. Schedule E（年度报表）

**用途**: IRS Schedule E格式，**包含所有费用类型**的完整报税报表

**Excel结构**:
```
Sheet 1: Schedule E Summary
┌────────────────────────────────┬─────────────┐
│ Expense Category (IRS Line)    │ Total       │
├────────────────────────────────┼─────────────┤
│ Line 5  - Advertising          │ $200.00     │
│ Line 6  - Auto & Travel        │ $450.00     │
│ Line 9  - Insurance            │ $3,600.00   │
│ Line 11 - Legal & Professional │ $800.00     │
│ Line 12 - Management Fees      │ $2,160.00   │
│ Line 13 - Mortgage Interest    │ $12,500.00  │
│ Line 14 - Repairs & Maintenance│ $18,234.00  │
│ Line 15 - Supplies             │ $650.00     │
│ Line 16 - Taxes (Property)     │ $15,000.00  │
│ Line 17 - Utilities            │ $4,800.00   │
│ Line 18 - HOA Fees             │ $1,200.00   │
│ Line 19 - Other                │ $300.00     │
├────────────────────────────────┼─────────────┤
│ TOTAL EXPENSES                 │ $59,894.00  │
└────────────────────────────────┴─────────────┘

Property Breakdown:
┌────────────────────────┬──────────┬────────────┐
│ Property               │ Records  │ Total      │
├────────────────────────┼──────────┼────────────┤
│ 123 Main St, Apt 2B    │ 48       │ $22,345.00 │
│ 456 Oak Ave            │ 52       │ $28,123.00 │
│ 789 Pine St            │ 35       │ $9,426.00  │
└────────────────────────┴──────────┴────────────┘

Sheet 2: 123 Main St, Apt 2B (详细记录)
┌──────────┬─────────────────────────┬───────────────┬──────────┬────────┐
│ Date     │ Category                │ Description   │ Vendor    │ Amount │
├──────────┼─────────────────────────┼───────────────┼──────────┼────────┤
│ 1/1/24   │ Insurance               │ Annual policy │ State Farm│ $1,200 │
│ 1/15/24  │ Property Tax            │ Q1 payment    │ County    │ $2,500 │
│ 3/15/24  │ Repairs & Maintenance   │ Kitchen sink  │ Plumbing  │ $150   │
│ 3/5/24   │ Repairs & Maintenance   │ Toilet repair │ Plumbing  │ $80    │
│ 4/1/24   │ Utilities               │ Water bill    │ Water Co  │ $400   │
├──────────┼─────────────────────────┼───────────────┼──────────┼────────┤
│          │                         │Property Total │          │$22,345 │
└──────────┴─────────────────────────┴───────────────┴──────────┴────────┘

Sheet 3: 456 Oak Ave
[同样结构]

Sheet 4: 789 Pine St
[同样结构]

Sheet 5: Category Details (按费用类型分类)
每个费用类型一个详细列表，按房产分组
```

**数据来源**:
- 查询条件: `status = 'closed'` AND `YEAR(closed_at) = {selectedYear}`
- 按 `expense_category` 分组统计
- 按房产分组详细列表
- 包含字段: Date, Category, Description, Vendor, Amount

**文件名**: `Schedule-E-2024.xlsx`

**Free限制**: 前3条记录

**Schedule E行号映射**:
```sql
-- 导出时的分类映射
SELECT 
  CASE expense_category
    WHEN 'advertising' THEN 'Line 5 - Advertising'
    WHEN 'travel_auto' THEN 'Line 6 - Auto & Travel'
    WHEN 'insurance' THEN 'Line 9 - Insurance'
    WHEN 'legal_professional' THEN 'Line 11 - Legal & Professional'
    WHEN 'management_fees' THEN 'Line 12 - Management Fees'
    WHEN 'mortgage_interest' THEN 'Line 13 - Mortgage Interest'
    WHEN 'repair_maintenance' THEN 'Line 14 - Repairs & Maintenance'
    WHEN 'cleaning' THEN 'Line 14 - Repairs & Maintenance' -- 清洁归入维修
    WHEN 'supplies' THEN 'Line 15 - Supplies'
    WHEN 'property_tax' THEN 'Line 16 - Taxes'
    WHEN 'utilities' THEN 'Line 17 - Utilities'
    WHEN 'hoa_fees' THEN 'Line 18 - HOA Fees'
    WHEN 'other' THEN 'Line 19 - Other'
  END AS schedule_e_line,
  SUM(final_cost) AS total
FROM tickets
WHERE status = 'closed' AND YEAR(closed_at) = 2024
GROUP BY expense_category;
```

---

### 2. Last 3 Years Report（3年报表）

**用途**: IRS审计准备，3年滚动维修费用汇总

**Excel结构**:
```
Sheet 1: Summary
┌──────┬─────────┬────────┬─────────┐
│ Year │ Repairs │  Total │ % Total │
├──────┼─────────┼────────┼─────────┤
│ 2024 │  43     │$18,234 │  34.5%  │
│ 2023 │  52     │$22,456 │  42.4%  │
│ 2022 │  33     │$12,201 │  23.1%  │
├──────┼─────────┼────────┼─────────┤
│ Total│ 128     │$52,891 │ 100.0%  │
└──────┴─────────┴────────┴─────────┘

Sheet 2: 2024
[按房产分组的详细列表]

Sheet 3: 2023
[按房产分组的详细列表]

Sheet 4: 2022
[按房产分组的详细列表]
```

**数据来源**:
- 查询条件: `status = 'closed'` AND `closed_at >= NOW() - INTERVAL '3 years'`
- 实时计算（rolling 3 years）
- 按年份 → 按房产分组

**文件名**: `Last-3-Years-Report.xlsx`

**Free限制**: 前3条工单

---

## 预览功能

点击[Preview Report]打开预览弹窗：

```
┌─────────────────────────────────────────────┐
│  Schedule E Preview (2024)          [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  Summary:                                   │
│  • 43 repairs • $18,234 • 3 properties      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 123 Main St, Apt 2B                 │   │
│  │ 15 repairs • $5,234                 │   │
│  │                                     │   │
│  │ • 3/15: Kitchen sink - $150         │   │
│  │ • 3/5: Toilet repair - $80          │   │
│  │ • 2/20: Water heater - $280         │   │
│  │ ... (12 more)                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 456 Oak Ave                         │   │
│  │ 18 repairs • $8,456                 │   │
│  │ ...                                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 789 Pine St                         │   │
│  │ 10 repairs • $4,544                 │   │
│  │ ...                                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Close]           [📥 Export Excel]        │
│                                             │
└─────────────────────────────────────────────┘
```

**用途**:
- 让房东检查数据是否完整
- 确认金额计算是否正确
- 发现遗漏的票据或费用

---

## Dashboard快捷导出

### TAX YEAR卡片

```
Dashboard卡片:
┌────────────────┐
│ 💰 TAX YEAR    │
│   [2024 ▼]     │
│   $18,234      │
│   43 Tickets   │
│  [Export]      │ ← 点击直接导出Schedule E
└────────────────┘
```

**导出逻辑**:
```typescript
const handleExportFromDashboard = async () => {
  // 检查Free配额
  if (isFreeUser && ticketCount > 3) {
    showUpgradeModal({
      type: 'schedule-e',
      year: selectedYear,
      total: ticketCount,
      amount: totalAmount
    });
    return;
  }
  
  // 直接导出
  const response = await fetch(`/api/export/schedule-e?year=${selectedYear}`);
  const blob = await response.blob();
  downloadFile(blob, `Schedule-E-${selectedYear}.xlsx`);
  
  // 导出后Toast提示
  toast.success('Schedule E exported successfully');
};
```

---

### LAST 3 YEARS卡片

```
Dashboard卡片:
┌────────────────┐
│ 📄 LAST 3 YEARS│
│   (IRS Ready)  │
│   $52,891      │
│   128 Tickets  │
│  [Export]      │ ← 点击直接导出3年报表
└────────────────┘
```

**导出逻辑**:
```typescript
const handleExport3Years = async () => {
  // 检查Free配额
  if (isFreeUser && ticketCount > 3) {
    showUpgradeModal({
      type: '3-years',
      total: ticketCount,
      amount: totalAmount
    });
    return;
  }
  
  // 直接导出
  const response = await fetch(`/api/export/3-years`);
  const blob = await response.blob();
  downloadFile(blob, `Last-3-Years-Report.xlsx`);
  
  toast.success('3 Years Report exported successfully');
};
```

---

## Free用户升级弹窗

### Schedule E升级弹窗

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
│  ✓ Unlimited exports                        │
│                                             │
│  ROI: $17,384 in deductions for $99         │
│                                             │
│  [Export 3 (Free)]    [Upgrade to Pro →]    │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Last 3 Years升级弹窗

```
┌─────────────────────────────────────────────┐
│  Upgrade to Export Full Report      [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Free Plan Limitation                    │
│                                             │
│  You have 128 repairs (2022-2024)           │
│  Total: $52,891                             │
│                                             │
│  Free plan exports first 3 only             │
│                                             │
│  💰 Missing records: 125 repairs            │
│                                             │
│  Upgrade to Pro ($99/year) to:              │
│  ✓ Export all 128 repairs                   │
│  ✓ Complete IRS audit documentation         │
│  ✓ Unlimited exports                        │
│                                             │
│  [Export 3 (Free)]    [Upgrade to Pro →]    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 导航入口

| 入口 | 路由 | 说明 |
|------|------|------|
| Dashboard导航 | `/reports` | 顶部新增[Reports]按钮 |
| TAX YEAR → [Export] | 直接导出 | 不跳转页面 |
| LAST 3 YEARS → [Export] | 直接导出 | 不跳转页面 |
| TAX YEAR → [View All] → [Preview] | `/reports` | 跳转到Reports页面预览 |

---

## 组件

| 组件 | 说明 | Props |
|------|------|-------|
| `ReportsPage` | 页面容器 | - |
| `ScheduleECard` | Schedule E卡片 | year, onExport, onPreview |
| `Last3YearsCard` | 3年报表卡片 | onExport, onPreview |
| `PreviewModal` | 预览弹窗 | type, data, onExport |
| `UpgradeModal` | 升级提示 | type, stats, onUpgrade |
| `YearSelector` | 年份选择器 | value, onChange |

---

## API

### GET /api/export/schedule-e

**Query参数**:
```typescript
{
  year: number;  // 2024
}
```

**逻辑**:
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year')!);
  const user = await getUser();
  
  // 查询CLOSED工单
  const tickets = await db
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.landlord_id, user.id),
        eq(tickets.status, 'closed'),
        sql`EXTRACT(YEAR FROM closed_at) = ${year}`
      )
    )
    .orderBy(desc(tickets.closed_at));
  
  // Free配额限制
  if (user.plan === 'free' && tickets.length > 3) {
    tickets.splice(3);  // 只保留前3个
  }
  
  // 按房产分组
  const grouped = groupBy(tickets, 'property_id');
  
  // 生成Excel
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Summary
  const summary = workbook.addWorksheet('Summary');
  summary.addRow(['Property', 'Repairs', 'Total']);
  let grandTotal = 0;
  for (const [propertyId, tickets] of Object.entries(grouped)) {
    const property = await getProperty(propertyId);
    const total = tickets.reduce((sum, t) => sum + t.final_cost, 0);
    summary.addRow([property.full_address, tickets.length, total]);
    grandTotal += total;
  }
  summary.addRow(['TOTAL', tickets.length, grandTotal]);
  
  // Sheet 2-N: 每个房产的详细记录
  for (const [propertyId, tickets] of Object.entries(grouped)) {
    const property = await getProperty(propertyId);
    const sheet = workbook.addWorksheet(property.address);
    sheet.addRow(['Date', 'Description', 'Vendor', 'Amount']);
    for (const ticket of tickets) {
      sheet.addRow([
        ticket.closed_at,
        ticket.ai_summary,
        ticket.vendor,
        ticket.final_cost
      ]);
    }
  }
  
  // 返回Excel文件
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Schedule-E-${year}.xlsx"`
    }
  });
}
```

---

### GET /api/export/3-years

**逻辑**:
```typescript
export async function GET(request: Request) {
  const user = await getUser();
  
  // 计算3年前的日期
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  // 查询CLOSED工单
  const tickets = await db
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.landlord_id, user.id),
        eq(tickets.status, 'closed'),
        gte(tickets.closed_at, threeYearsAgo)
      )
    )
    .orderBy(desc(tickets.closed_at));
  
  // Free配额限制
  if (user.plan === 'free' && tickets.length > 3) {
    tickets.splice(3);
  }
  
  // 按年份分组
  const groupedByYear = groupBy(tickets, t => 
    new Date(t.closed_at).getFullYear()
  );
  
  // 生成Excel
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Summary
  const summary = workbook.addWorksheet('Summary');
  summary.addRow(['Year', 'Repairs', 'Total', '% Total']);
  const grandTotal = tickets.reduce((sum, t) => sum + t.final_cost, 0);
  for (const [year, tickets] of Object.entries(groupedByYear)) {
    const total = tickets.reduce((sum, t) => sum + t.final_cost, 0);
    const pct = (total / grandTotal * 100).toFixed(1);
    summary.addRow([year, tickets.length, total, `${pct}%`]);
  }
  summary.addRow(['Total', tickets.length, grandTotal, '100.0%']);
  
  // Sheet 2-N: 每年的详细记录（按房产分组）
  for (const [year, yearTickets] of Object.entries(groupedByYear)) {
    const sheet = workbook.addWorksheet(year);
    const groupedByProperty = groupBy(yearTickets, 'property_id');
    
    for (const [propertyId, tickets] of Object.entries(groupedByProperty)) {
      const property = await getProperty(propertyId);
      sheet.addRow([property.full_address]);  // 房产标题
      sheet.addRow(['Date', 'Description', 'Vendor', 'Amount']);
      for (const ticket of tickets) {
        sheet.addRow([
          ticket.closed_at,
          ticket.ai_summary,
          ticket.vendor,
          ticket.final_cost
        ]);
      }
      sheet.addRow([]);  // 空行分隔
    }
  }
  
  // 返回Excel文件
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Last-3-Years-Report.xlsx"`
    }
  });
}
```

---

### GET /api/reports/stats

**用途**: 获取统计数据用于预览

**响应**:
```typescript
{
  schedule_e: {
    year: 2024,
    total_repairs: 43,
    total_amount: 18234,
    properties_count: 3,
    by_property: [
      { property_id, name, repairs, amount },
      ...
    ]
  },
  last_3_years: {
    total_repairs: 128,
    total_amount: 52891,
    by_year: [
      { year: 2024, repairs: 43, amount: 18234 },
      { year: 2023, repairs: 52, amount: 22456 },
      { year: 2022, repairs: 33, amount: 12201 }
    ]
  }
}
```

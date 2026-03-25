# 11. 工单管理页面

**路由**: `/tickets`  
**访问**: 需登录

**用途**: 日常工单查看、筛选、管理

---

## 设计理念

这是一个**纯工单管理**页面：
- 简单筛选（All/To Do/Closed/Archived）
- 房产筛选（从Properties跳转）
- 卡片/表格切换
- 分页
- **无导出功能**（报税导出在`/reports`页面）

---

## 视图切换逻辑

```typescript
const defaultView = useMemo(() => {
  // 数据量 > 15 → 默认表格
  if (tickets.length > 15) {
    return 'table';
  }
  
  // 默认卡片
  return 'card';
}, [tickets]);
```

---

## 页面结构（表格视图 - 推荐）

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo] StoopKeep                                  [👤 John ▼]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tickets (87 total)                                             │
│                                                                  │
│  [Filter: All ▼] [Sort: Date ▼] [View: ⊞ Table | ☰ Cards]      │
│                                                                  │
│  ─────────────────────────────────────────────────────────      │
│                                                                  │
│  ┌──┬──────┬───────────────────┬───────────┬────────┬──────┬───┐│
│  │  │ Icon │ Description       │ Property  │  Date  │ Cost │...││
│  ├──┼──────┼───────────────────┼───────────┼────────┼──────┼───┤│
│  │  │ 🔴   │ Kitchen sink leak │ Apt 2B    │ 3/15   │ $150 │...││
│  │  │ ⚠️   │ AC repair         │ Oak Ave   │ 3/10   │ $350 │...││
│  │  │ ✅   │ Toilet clog       │ Apt 1C    │ 3/5    │ $80  │...││
│  │  │ 🟡   │ Door lock         │ Studio    │ 2/28   │ $120 │...││
│  │  │ ✅   │ Water heater      │ Apt 1A    │ 2/20   │ $280 │...││
│  │  │ ... (15 more rows)                                      ││
│  └──┴──────┴───────────────────┴───────────┴────────┴──────┴───┘│
│                                                                  │
│  Showing 1-20 of 87           [< Prev]  1 2 3 4  [Next >]      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 表格列定义

| 列 | 宽度 | 排序 | 说明 |
|---|------|------|------|
| **Icon** | 60px | - | 状态图标（🔴🟡⚠️✅） |
| **Description** | 40% | ✅ | 工单描述，点击打开详情 |
| **Property** | 20% | ✅ | 房产地址 |
| **Date** | 15% | ✅ | created_at（默认排序） |
| **Cost** | 10% | ✅ | final_cost |
| **Actions** | 10% | - | [View] 按钮 |

---

## 页面结构（卡片视图 - 少量数据）

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                 [👤 John ▼]│
├─────────────────────────────────────────────┤
│                                             │
│  Tickets - To Do (8 tickets)   [Export]    │
│                                             │
│  [Filter: To Do ▼] [Sort: Latest ▼]        │
│  [View: ⊞ Table | ☰ Cards]                 │
│                                             │
│  ─────────────────────────────             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔴 Kitchen sink leak                │   │
│  │ Property: 123 Main St, Apt 2B       │   │
│  │ Status: To Do • 5 min ago           │   │
│  │ [View Details]                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ AC repair                        │   │
│  │ Property: 456 Oak Ave               │   │
│  │ Status: Missing Receipt • 2 days    │   │
│  │ Cost: $350 • [Upload Receipt]       │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 筛选条件

### Filter下拉选项

| 选项 | 路由参数 | 筛选逻辑 |
|------|---------|---------|
| All | 无 | status != 'archived' |
| To Do | `?filter=todo` | status IN ('new', 'action_required', 'pending_receipt') |
| Pending Receipt | `?filter=pending_receipt` | status = 'pending_receipt' |
| Closed | `?filter=closed` | status = 'closed' |
| Archived | `?filter=archived` | status = 'archived' |

---

### 房产筛选（从Properties跳转）

| 来源 | 路由 | 筛选逻辑 |
|------|------|---------|
| Properties [View Tickets] | `?property={propertyId}` | property_id = {propertyId} |
| Properties [View Active Tickets] | `?property={propertyId}&filter=todo` | property_id = {propertyId} AND status IN (...) |

**UI显示**：
```
Tickets - 123 Main St, Apt 2B (5 tickets)

💡 Showing tickets for "123 Main St, Apt 2B"
[Clear Filter] to see all properties
```

---

### 入口点总结

| 入口 | 路由 | 说明 |
|------|------|------|
| Dashboard导航 | `/tickets` | 显示所有工单 |
| Dashboard TO DO卡片 | `/tickets?filter=todo` | 显示待处理工单 |
| Properties [View Tickets] | `/tickets?property={id}` | 显示某房产工单 |

---

## 分页功能

### 分页参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 当前页码 |
| `per_page` | number | 20 | 每页条数（表格20，卡片10） |

### 分页UI

```
Showing 1-20 of 43

[< Prev]  1  [2]  3  ...  [Next >]

Jump to: [__] Go
```

**页码显示规则**：总是显示第1页、最后1页、当前页前后各1页，其他用`...`

### 分页API响应

```typescript
interface PaginationResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
```

---

## 组件

| 组件 | 说明 | Props |
|------|------|-------|
| `TicketsPage` | 页面容器 | searchParams |
| `TicketsTable` | 表格视图 | tickets[], onSort |
| `TicketsCards` | 卡片视图 | tickets[] |
| `TicketRow` | 表格行 | ticket |
| `TicketCard` | 卡片项 | ticket |
| `FilterDropdown` | 筛选下拉 | value, onChange |
| `SortDropdown` | 排序下拉 | value, onChange |
| `ViewToggle` | 视图切换 | view, onChange |
| `Pagination` | 分页组件 | pagination, onPageChange |

---

## API

### GET /api/tickets

**Query参数**：
```typescript
interface TicketsQuery {
  page?: number;        // 页码，默认1
  per_page?: number;    // 每页数量，默认20
  filter?: string;      // todo | pending_receipt | closed | archived
  property?: string;    // property_id（房产筛选）
  sort?: string;        // date_desc | date_asc | cost_desc | cost_asc
}
```

**响应**：
```typescript
{
  tickets: Ticket[];
  pagination: {
    page: 1,
    per_page: 20,
    total: 87,
    total_pages: 5,
    has_next: true,
    has_prev: false
  }
}
```

**实现**：
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const per_page = parseInt(searchParams.get('per_page') || '20');
  
  let query = db.select().from(tickets);
  
  // 房产筛选
  if (searchParams.has('property')) {
    const propertyId = searchParams.get('property')!;
    query = query.where(eq(tickets.property_id, propertyId));
  }
  
  // 状态筛选
  if (searchParams.get('filter') === 'todo') {
    query = query.where(or(
      eq(tickets.status, 'new'),
      eq(tickets.status, 'action_required'),
      eq(tickets.status, 'pending_receipt')
    ));
  } else if (searchParams.get('filter')) {
    query = query.where(eq(tickets.status, searchParams.get('filter')));
  } else {
    // 默认：排除archived
    query = query.where(ne(tickets.status, 'archived'));
  }
  
  // 排序
  const sortMap = {
    'date_desc': desc(tickets.created_at),
    'date_asc': asc(tickets.created_at),
    'cost_desc': desc(tickets.final_cost),
    'cost_asc': asc(tickets.final_cost)
  };
  query = query.orderBy(sortMap[searchParams.get('sort') || 'date_desc']);
  
  // 分页
  const allTickets = await query;
  const total = allTickets.length;
  const offset = (page - 1) * per_page;
  const paginatedTickets = allTickets.slice(offset, offset + per_page);
  
  return Response.json({
    tickets: paginatedTickets,
    pagination: {
      page, per_page, total,
      total_pages: Math.ceil(total / per_page),
      has_next: page < Math.ceil(total / per_page),
      has_prev: page > 1
    }
  });
}
```

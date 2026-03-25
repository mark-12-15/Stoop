# 02. 租客提交工单页面

**路由**: `/report/[slug]`  
**访问**: 公开（通过专属链接）

---

## 2A. 首次访问（无localStorage）

显示提交表单：

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                            │
├─────────────────────────────────────────────┤
│                                             │
│  Report a Maintenance Issue                 │
│  Property: 123 Main St, Apt 2B             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  What's the problem? *                     │
│  ┌─────────────────────────────┐           │
│  │ Describe the issue...       │           │
│  │                             │           │
│  │                             │           │
│  └─────────────────────────────┘           │
│                                             │
│  Add Photos (Up to 5)                      │
│  ┌────┐ ┌────┐ ┌────┐                     │
│  │ +  │ │    │ │    │                     │
│  └────┘ └────┘ └────┘                     │
│                                             │
│  ☐ This is an emergency                    │
│      (safety risk or major damage)         │
│                                             │
│  ─────────────────────────────             │
│                                             │
│  Your Contact Info (Optional)               │
│  ▼ Click to add name, email or phone       │
│                                             │
│  [ Submit Request ]                         │
│                                             │
└─────────────────────────────────────────────┘
```

**联系信息展开后**:
```
│  Your Contact Info (Optional)               │
│  ▲ Hide                                     │
│  ┌─────────────────────────────┐           │
│  │ Name                        │           │
│  └─────────────────────────────┘           │
│  ┌─────────────────────────────┐           │
│  │ Email                       │           │
│  └─────────────────────────────┘           │
│  ┌─────────────────────────────┐           │
│  │ Phone                       │           │
│  └─────────────────────────────┘           │
```

**提交成功页面**:
```
┌─────────────────────────────────────────────┐
│  ✅ Request Submitted!                      │
│                                             │
│  Your landlord has been notified.          │
│  Reference ID: #TKT-12345                  │
│                                             │
│  💡 Tip: Visit this page anytime to view   │
│  your requests and check their status.     │
│                                             │
│  [ View My Requests ]                       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 2B. 再次访问（有localStorage）

显示工单列表：

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                            │
├─────────────────────────────────────────────┤
│                                             │
│  Maintenance Requests                       │
│  Property: 123 Main St, Apt 2B             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [ + Report New Issue ]                     │
│                                             │
│  ─────────────────────────────             │
│                                             │
│  Your Previous Requests (3)                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔴 Kitchen sink leak                │   │
│  │ Submitted: 5 minutes ago            │   │
│  │ Status: 📥 New                      │   │
│  │                                     │   │
│  │ "Water dripping from under..."      │   │
│  │ 📷 2 photos                         │   │
│  │                                     │   │
│  │ [Edit] [Delete]                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🟡 AC not working                   │   │
│  │ Submitted: 2 days ago               │   │
│  │ Status: 🔄 In Progress              │   │
│  │                                     │   │
│  │ "Air conditioner won't turn on..."  │   │
│  │ 📷 1 photo                          │   │
│  │                                     │   │
│  │ [View Details]                      │   │ ← 只读
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ Toilet clog                      │   │
│  │ Closed: Mar 10 • Cost: $150        │   │
│  │                                     │   │
│  │ [View Details]                      │   │ ← 只读
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 2C. 编辑工单页面

点击[Edit]按钮后：

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                [Cancel]    │
├─────────────────────────────────────────────┤
│                                             │
│  Edit Request #TKT-12345                   │
│  Property: 123 Main St, Apt 2B             │
│  Submitted: 5 minutes ago                   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  What's the problem? *                     │
│  ┌─────────────────────────────┐           │
│  │ Kitchen sink is leaking     │           │
│  │ under the cabinet           │           │
│  │                             │           │
│  └─────────────────────────────┘           │
│                                             │
│  Photos (2)                                 │
│  ┌──────┐ ┌──────┐ ┌────┐                 │
│  │Photo1│ │Photo2│ │ +  │                 │
│  │  [x] │ │  [x] │ │    │                 │
│  └──────┘ └──────┘ └────┘                 │
│                                             │
│  ☑ This is an emergency                    │
│                                             │
│  [ Save Changes ]                           │
│                                             │
│  ℹ️ You can edit this request until your   │
│  landlord views it.                         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 2D. 删除确认弹窗

点击[Delete]按钮后：

```
┌─────────────────────────────────┐
│  Delete Request?                │
├─────────────────────────────────┤
│                                 │
│  Are you sure you want to       │
│  delete this maintenance        │
│  request?                       │
│                                 │
│  This action cannot be undone.  │
│                                 │
│  [ Cancel ]  [ Delete ]         │
│                                 │
└─────────────────────────────────┘
```

---

## 2E. 查看详情页面（已被房东查看）

点击[View Details]按钮后：

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                [← Back]    │
├─────────────────────────────────────────────┤
│                                             │
│  Request #TKT-45678                        │
│  Property: 123 Main St, Apt 2B             │
│  Submitted: 2 days ago                      │
│                                             │
│  Status: 🔄 In Progress                    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Description                                │
│  "Air conditioner won't turn on.           │
│   Tried resetting the breaker but          │
│   no luck..."                               │
│                                             │
│  Photos (1)                                 │
│  ┌──────────┐                              │
│  │ Photo 1  │                              │
│  └──────────┘                              │
│                                             │
│  Emergency: No                              │
│                                             │
│  ─────────────────────────────             │
│                                             │
│  💬 Landlord Update                         │ ← 新增
│  "I've contacted the HVAC contractor.      │
│   They'll come tomorrow morning."           │
│                                             │
│  ─────────────────────────────             │
│                                             │
│  ℹ️ Your landlord is working on this.      │
│  You cannot edit once they've viewed it.   │
│                                             │
└─────────────────────────────────────────────┘
```

**显示规则**：
- 如果`landlord_notes`有内容 → 显示"💬 Landlord Update"区块
- 如果为空 → 不显示该区块
- 租客只读，不可编辑

## 2F. 查看已关闭工单详情

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                [← Back]    │
├─────────────────────────────────────────────┤
│                                             │
│  Request #TKT-12890                        │
│  Property: 123 Main St, Apt 2B             │
│  Submitted: Mar 8, 2024                     │
│                                             │
│  Status: ✅ Closed                          │
│  Completed: Mar 10, 2024                    │
│  Cost: $150.00                              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Description                                │
│  "Toilet won't flush properly..."           │
│                                             │
│  Photos (2)                                 │
│  ┌──────────┐ ┌──────────┐                 │
│  │ Photo 1  │ │ Photo 2  │                 │
│  └──────────┘ └──────────┘                 │
│                                             │
│  Emergency: No                              │
│                                             │
│  ─────────────────────────────             │
│                                             │
│  💬 Landlord Update                         │
│  "Plumber came and fixed the flush         │
│   mechanism. Should be working now."        │
│                                             │
│  ─────────────────────────────             │
│                                             │
│  ✅ This request has been completed.        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 组件

- `TenantReportForm` - 主表单（折叠式联系信息）
- `TenantTicketList` - 工单列表页面
- `TenantTicketEdit` - 编辑工单页面
- `TenantTicketDetail` - 查看详情页面（只读）
- `DeleteConfirmModal` - 删除确认弹窗
- `PhotoUploader` - 照片上传组件

---

## API

### POST /api/public/properties/[slug]/tickets
**说明**：租客提交工单

**请求**：
```typescript
{
  tenant_raw_text: string;
  is_emergency: boolean;
  photo_urls?: string[];
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  tenant_identifier: string;  // 客户端生成的UUID
}
```

**响应**：
- 成功：`201 Created` + 工单ID
- 房产不存在：`404 Not Found` + `{ error: 'Property not found' }`

---

### GET /api/public/properties/[slug]/tickets
**说明**：获取工单列表

**Headers**：`X-Tenant-Identifier: {uuid}`

**响应**：
- 成功：`200 OK` + 工单列表
- 房产不存在：`404 Not Found` + `{ error: 'Property not found' }`

---

### PUT /api/public/tickets/[id]
**说明**：编辑工单（仅NEW状态）

**验证**：
- tenant_identifier匹配
- status = 'new'

**响应**：
- 成功：`200 OK`
- 无权限：`403 Forbidden`
- 工单不存在：`404 Not Found`

---

### DELETE /api/public/tickets/[id]
**说明**：删除工单（真删除）

**验证**：
- tenant_identifier匹配
- status = 'new'

**响应**：
- 成功：`204 No Content`
- 无权限：`403 Forbidden`

---

### GET /api/public/archived-property-tickets/[slug]
**说明**：获取已删除房产的历史工单（新增）⚠️

**Headers**：`X-Tenant-Identifier: {uuid}`

**用途**：房产删除后，租客仍可查看历史工单

**查询逻辑**：
```typescript
// 查询该slug + tenant_identifier的历史工单
const tickets = await db
  .select()
  .from(tickets)
  .where(
    and(
      eq(tickets.property_slug, slug),  // 通过slug查询（不是property_id）
      eq(tickets.tenant_identifier, tenantId),
      or(
        eq(tickets.status, 'closed'),
        eq(tickets.status, 'archived')
      )
    )
  )
  .orderBy(desc(tickets.closed_at));
```

**响应**：
```typescript
{
  tickets: Ticket[];  // 只返回CLOSED/ARCHIVED工单
  property_deleted: true;
  message: 'This property is no longer available'
}
```

**注意事项**：
- 不验证property是否存在
- 只返回历史工单（CLOSED/ARCHIVED）
- 只读，不允许编辑/删除/新建

---

## 身份识别机制

```typescript
// 首次提交时生成
const tenantIdentifier = crypto.randomUUID();
localStorage.setItem(`tenant_id_${propertySlug}`, tenantIdentifier);

// 后续请求携带
fetch('/api/...', {
  headers: {
    'X-Tenant-Identifier': localStorage.getItem(`tenant_id_${propertySlug}`)
  }
});
```

---

## 权限矩阵

| 操作 | status=new | status=action_required | status=closed |
|------|-----------|----------------------|---------------|
| **查看** | ✅ 显示详情 | ✅ 显示详情 | ✅ 显示详情 |
| **编辑** | ✅ [Edit] | ❌ [View Details] | ❌ [View Details] |
| **删除** | ✅ [Delete] | ❌ 无按钮 | ❌ 无按钮 |

---

## 状态标识

- 🔴 = Emergency (红色)
- 🟡 = Normal (黄色)
- ✅ = Closed (绿色)
- 📥 = New
- 🔄 = In Progress

---

## 边缘场景处理

### 1. 清除浏览器缓存
**场景**：租客清除浏览器localStorage

**处理**：视为新租客，看不到历史工单（因为缺少tenant_identifier）

---

### 2. 换设备访问
**场景**：租客在新设备上访问同一个slug

**处理**：同上，新设备=新身份，看不到其他设备提交的工单

---

### 3. 房东查看后失去编辑权限
**场景**：房东打开工单后，租客刷新页面

**处理**：
- status从'new'变为'action_required'
- 租客立刻失去编辑/删除权限
- 只显示[View Details]按钮

---

### 4. 租客删除工单
**场景**：租客在NEW状态下删除自己的工单

**处理**：
- 真删除（DELETE from database）
- 房东Dashboard看不到
- 租客列表也看不到
- 该tenant_identifier的其他工单不受影响

---

### 5. 房产已删除（404场景）⚠️

**场景**：房东删除房产后，租客访问旧的tenant link

**触发条件**：
```
访问 /report/[slug]
↓
数据库查询：SELECT * FROM properties WHERE slug = '[slug]'
↓
结果：null（房产不存在）
```

**UI显示**：

#### 5A. 首次访问（无localStorage）

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                            │
├─────────────────────────────────────────────┤
│                                             │
│                   🏠❌                       │
│                                             │
│          Property Not Found                 │
│                                             │
│  This property link is no longer active.    │
│                                             │
│  Possible reasons:                          │
│  • The landlord has removed this property   │
│  • The link may have been changed           │
│  • The link was entered incorrectly         │
│                                             │
│  Please contact your landlord directly      │
│  for assistance.                            │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

#### 5B. 再次访问（有localStorage，有历史工单）

```
┌─────────────────────────────────────────────┐
│  [Logo] StoopKeep                            │
├─────────────────────────────────────────────┤
│                                             │
│          ⚠️ Property Unavailable             │
│                                             │
│  This property is no longer available       │
│  in our system.                             │
│                                             │
│  Your previous maintenance requests (3):    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ Kitchen sink leak - Closed      │   │
│  │    Completed: Mar 15 • $150        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ AC repair - Closed              │   │
│  │    Completed: Mar 10 • $350        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ Toilet clog - Closed            │   │
│  │    Completed: Mar 5 • $80          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ℹ️ These are read-only records.           │
│  New requests cannot be submitted.          │
│                                             │
│  Please contact your landlord for          │
│  a new reporting link if needed.           │
│                                             │
└─────────────────────────────────────────────┘
```

**实现逻辑**：

```typescript
// app/report/[slug]/page.tsx
export default async function TenantReportPage({ params }) {
  const { slug } = params;
  
  // 查询房产
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.slug, slug))
    .limit(1);
  
  // 房产不存在
  if (!property) {
    return <PropertyNotFoundPage slug={slug} />;
  }
  
  // 正常渲染
  return <TenantReportForm property={property} />;
}
```

```typescript
// components/PropertyNotFoundPage.tsx
const PropertyNotFoundPage = ({ slug }) => {
  const [historicalTickets, setHistoricalTickets] = useState([]);
  
  useEffect(() => {
    // 尝试获取历史工单（使用缓存的tenant_identifier）
    const tenantId = localStorage.getItem(`tenant_id_${slug}`);
    
    if (tenantId) {
      // 调用特殊API获取已删除房产的历史工单
      fetch(`/api/public/archived-property-tickets/${slug}`, {
        headers: { 'X-Tenant-Identifier': tenantId }
      })
      .then(r => r.json())
      .then(data => setHistoricalTickets(data.tickets || []));
    }
  }, [slug]);
  
  return (
    <div>
      {historicalTickets.length > 0 ? (
        <HistoricalTicketsView tickets={historicalTickets} />
      ) : (
        <PropertyNotFoundEmptyState />
      )}
    </div>
  );
};
```

**HTTP状态码**：
- 返回 `404 Not Found`
- 但UI显示友好的错误页面（不是浏览器默认404）

**SEO处理**：
```html
<meta name="robots" content="noindex, nofollow">
```

**数据保留策略**：
- 房产删除时，关联的CLOSED/ARCHIVED工单**保留**（软删除标记）
- 允许租客查看历史记录
- 不允许提交新工单
- 不允许编辑现有工单

---

### 6. Slug冲突（极少见）

**场景**：两个房产生成了相同的slug（理论上不应该发生）

**预防**：后端生成slug时检查唯一性
```typescript
const generateUniqueSlug = async (address: string) => {
  let slug = slugify(address);
  let exists = await checkSlugExists(slug);
  
  while (exists) {
    slug = `${slugify(address)}-${randomString(4)}`;
    exists = await checkSlugExists(slug);
  }
  
  return slug;
};
```

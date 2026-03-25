# 07. 房产管理页面

**路由**: `/properties`  
**访问**: 需登录

---

## 导航入口

### 从哪里进入

| 入口 | 操作 | 说明 |
|------|------|------|
| **顶部导航** | 点击 [Properties] | 主要入口 |
| **Dashboard** | 点击 "Manage Properties" 链接 | 快速访问 |
| **首次登录** | 自动跳转 | 无房产时引导创建 |
| **URL直接访问** | `/properties` | 直接访问 |

### 如何返回

| 位置 | 操作 | 目标 |
|------|------|------|
| **Properties页面** | 点击 [Dashboard] 导航 | 返回Dashboard |
| **Add/Edit弹窗** | 点击 [Cancel] 或 [X] | 关闭弹窗，停留在Properties页面 |
| **删除确认** | 点击 [Cancel] | 关闭弹窗，停留在Properties页面 |

---

## 主界面（列表视图）

```
┌──────────────────────────────────────────────────┐
│  [Logo] StoopKeep                      [👤 John ▼]│
├──────────────────────────────────────────────────┤
│                                                  │
│  Properties                                      │
│  Manage your rental properties                   │
│                                                  │
│  [ + Add Property ]                              │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 🏠 123 Main St, Apt 2B                     │ │
│  │                                            │ │
│  │ Tenant Link:                               │ │
│  │ stoopfix.com/report/abc123                 │ │
│  │ [📋 Copy Link]                             │ │
│  │                                            │ │
│  │ 📊 Stats:                                  │ │
│  │    5 total tickets | 2 active              │ │
│  │                                            │ │
│  │ [View Tickets] [Edit] [Delete]             │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 🏠 456 Oak Ave, Studio                     │ │
│  │                                            │ │
│  │ Tenant Link:                               │ │
│  │ stoopfix.com/report/def456                 │ │
│  │ [📋 Copy Link]                             │ │
│  │                                            │ │
│  │ 📊 Stats:                                  │ │
│  │    12 total tickets | 0 active             │ │
│  │                                            │ │
│  │ [View Tickets] [Edit] [Delete]             │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

**顶部导航说明**：
- 与Dashboard保持一致：`[Logo] StoopKeep` + `[👤 John ▼]`
- Properties页面不需要二级导航

**功能说明**：
- **[View Tickets]**：跳转到 `/tickets?property={propertyId}` 筛选该房产的工单
- **[Edit]**：打开编辑弹窗
- **[Delete]**：打开删除确认弹窗
- **[📋 Copy Link]**：复制租客提交链接到剪贴板

---

## 空状态（首次使用）

```
┌──────────────────────────────────────────────────┐
│  [Logo] StoopKeep                      [👤 John ▼]│
├──────────────────────────────────────────────────┤
│                                                  │
│                                                  │
│                     🏠                           │
│                                                  │
│          No Properties Yet                       │
│                                                  │
│     Add your first property to start             │
│     tracking maintenance tickets                 │
│                                                  │
│          [ + Add Property ]                      │
│                                                  │
│                                                  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 创建房产弹窗

**触发**：点击 [+ Add Property]

```
┌────────────────────────────────────┐
│  Add New Property         [X]      │
├────────────────────────────────────┤
│                                    │
│  Property Address *                │
│  ┌──────────────────────────┐     │
│  │ 123 Main St              │     │
│  └──────────────────────────┘     │
│                                    │
│  Unit Number (Optional)            │
│  ┌──────────────────────────┐     │
│  │ Apt 2B                   │     │
│  └──────────────────────────┘     │
│                                    │
│  City *                            │
│  ┌──────────────────────────┐     │
│  │ San Francisco            │     │
│  └──────────────────────────┘     │
│                                    │
│  State *                           │
│  ┌──────────────────────────┐     │
│  │ CA                       │     │
│  └──────────────────────────┘     │
│                                    │
│  ZIP Code *                        │
│  ┌──────────────────────────┐     │
│  │ 94102                    │     │
│  └──────────────────────────┘     │
│                                    │
│  Notes (Optional)                  │
│  ┌──────────────────────────┐     │
│  │ 2BR/1BA, built 2010      │     │
│  │                          │     │
│  └──────────────────────────┘     │
│                                    │
│  [ Cancel ]  [ Create Property ]   │
│                                    │
└────────────────────────────────────┘
```

**验证规则**：
- `address` 必填
- `city` 必填
- `state` 必填
- `zip_code` 必填，格式：5位数字

**成功后**：
1. 关闭弹窗
2. 显示成功提示："Property created successfully!"
3. 刷新列表，新房产出现在顶部
4. 自动复制tenant link到剪贴板

---

## 编辑房产弹窗

**触发**：点击 [Edit]

```
┌────────────────────────────────────┐
│  Edit Property            [X]      │
├────────────────────────────────────┤
│                                    │
│  Property Address *                │
│  ┌──────────────────────────┐     │
│  │ 123 Main St              │     │
│  └──────────────────────────┘     │
│                                    │
│  Unit Number                       │
│  ┌──────────────────────────┐     │
│  │ Apt 2B                   │     │
│  └──────────────────────────┘     │
│                                    │
│  City *                            │
│  ┌──────────────────────────┐     │
│  │ San Francisco            │     │
│  └──────────────────────────┘     │
│                                    │
│  State *                           │
│  ┌──────────────────────────┐     │
│  │ CA                       │     │
│  └──────────────────────────┘     │
│                                    │
│  ZIP Code *                        │
│  ┌──────────────────────────┐     │
│  │ 94102                    │     │
│  └──────────────────────────┘     │
│                                    │
│  Notes                             │
│  ┌──────────────────────────┐     │
│  │ 2BR/1BA, built 2010      │     │
│  │ New HVAC installed 2023  │     │
│  └──────────────────────────┘     │
│                                    │
│  [ Cancel ]  [ Save Changes ]      │
│                                    │
└────────────────────────────────────┘
```

**预填充**：
- 所有字段预填充现有数据
- 用户可修改任意字段

**成功后**：
1. 关闭弹窗
2. 显示成功提示："Property updated successfully!"
3. 刷新列表，更新该房产的显示

**注意**：
- 编辑不会改变tenant link（slug保持不变）
- 有active工单的房产也可以编辑

---

## 删除房产弹窗

**触发**：点击 [Delete]

### 场景A：无工单或仅有closed工单

```
┌────────────────────────────────────┐
│  Delete Property                   │
├────────────────────────────────────┤
│                                    │
│  ⚠️ Are you sure?                  │
│                                    │
│  Delete "123 Main St, Apt 2B"?     │
│                                    │
│  This will permanently delete:     │
│  • Property information            │
│  • Tenant report link              │
│  • 5 closed tickets                │
│                                    │
│  This action cannot be undone.     │
│                                    │
│  [ Cancel ]  [ Delete ]            │
│                                    │
└────────────────────────────────────┘
```

### 场景B：有active工单（阻止删除）

```
┌────────────────────────────────────┐
│  Cannot Delete Property            │
├────────────────────────────────────┤
│                                    │
│  ⚠️ This property has 2 active     │
│     tickets.                       │
│                                    │
│  "123 Main St, Apt 2B"             │
│                                    │
│  Please close or archive all       │
│  active tickets before deleting    │
│  this property.                    │
│                                    │
│  [ View Active Tickets ]  [ OK ]   │
│                                    │
└────────────────────────────────────┘
```

**删除规则**：
- ✅ **允许删除**：无工单，或仅有CLOSED/ARCHIVED工单
- ❌ **禁止删除**：有NEW/ACTION_REQUIRED/PENDING_RECEIPT状态工单

**[View Active Tickets]操作**：
- 跳转到 `/tickets?property={propertyId}&filter=todo`
- 自动筛选该房产的active工单（To Do状态）
- 关闭删除弹窗

**成功删除后**：
1. 关闭弹窗
2. 显示成功提示："Property deleted successfully"
3. 从列表中移除该房产
4. 如果删除后无房产，显示空状态

**数据处理**：
- 房产记录从数据库删除（或软删除标记）
- 关联的CLOSED/ARCHIVED工单**保留**（供租客查看历史）
- Tenant link失效（`/report/[slug]` 返回404页面）
- 租客仍可访问历史工单（只读）

---

## 交互实现

### 1. 复制Tenant Link

```typescript
const handleCopyLink = (slug: string) => {
  const link = `${window.location.origin}/report/${slug}`;
  navigator.clipboard.writeText(link);
  
  toast.success('Link copied to clipboard!');
};
```

### 2. 创建房产

```typescript
const handleCreateProperty = async (formData: PropertyFormData) => {
  // 验证
  if (!formData.address || !formData.city || !formData.state || !formData.zip_code) {
    toast.error('Please fill in all required fields');
    return;
  }
  
  // 验证ZIP格式
  if (!/^\d{5}$/.test(formData.zip_code)) {
    toast.error('ZIP code must be 5 digits');
    return;
  }
  
  // 创建
  const response = await fetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  
  const property = await response.json();
  
  // 成功
  toast.success('Property created successfully!');
  closeModal();
  router.refresh();
  
  // 自动复制tenant link
  handleCopyLink(property.slug);
};
```

### 3. 编辑房产

```typescript
const handleEditProperty = async (propertyId: string, formData: PropertyFormData) => {
  const response = await fetch(`/api/properties/${propertyId}`, {
    method: 'PUT',
    body: JSON.stringify(formData)
  });
  
  if (response.ok) {
    toast.success('Property updated successfully!');
    closeModal();
    router.refresh();
  } else {
    toast.error('Failed to update property');
  }
};
```

### 4. 删除房产（含检查）

```typescript
const handleDeleteProperty = async (propertyId: string) => {
  // 检查是否有active工单
  const tickets = await fetch(`/api/properties/${propertyId}/tickets?status=active`)
    .then(r => r.json());
  
  if (tickets.length > 0) {
    // 阻止删除
    openDialog({
      title: 'Cannot Delete Property',
      message: `⚠️ This property has ${tickets.length} active tickets.\n\nPlease close or archive all active tickets before deleting this property.`,
      actions: [
        {
          label: 'View Active Tickets',
          onClick: () => {
            router.push(`/tickets?property=${propertyId}&filter=todo`);
            closeDialog();
          }
        },
        {
          label: 'OK',
          onClick: closeDialog
        }
      ]
    });
    return;
  }
  
  // 确认删除
  openConfirmDialog({
    title: 'Delete Property',
    message: `⚠️ Are you sure?\n\nDelete "${property.address}"?\n\nThis will permanently delete:\n• Property information\n• Tenant report link\n• All closed tickets\n\nThis action cannot be undone.`,
    confirmText: 'Delete',
    confirmVariant: 'danger',
    onConfirm: async () => {
      await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      });
      
      toast.success('Property deleted successfully');
      router.refresh();
    }
  });
};
```

### 5. View Tickets（跳转到Tickets List）

```typescript
const handleViewTickets = (propertyId: string) => {
  router.push(`/tickets?property=${propertyId}`);
};
```

**说明**：
- 跳转到 `/tickets` 页面（工单列表页）
- 通过URL参数 `?property={propertyId}` 筛选特定房产
- Tickets List页面会读取该参数并过滤工单

---

## 组件

### PropertyList
```typescript
interface PropertyListProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => void;
  onCopyLink: (slug: string) => void;
  onViewTickets: (propertyId: string) => void;
}
```

### PropertyCard
```typescript
interface PropertyCardProps {
  property: Property;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onViewTickets: () => void;
}
```

### PropertyFormModal
```typescript
interface PropertyFormModalProps {
  mode: 'create' | 'edit';
  property?: Property;  // edit模式时传入
  onSubmit: (formData: PropertyFormData) => Promise<void>;
  onCancel: () => void;
}

interface PropertyFormData {
  address: string;
  unit?: string;
  city: string;
  state: string;
  zip_code: string;
  notes?: string;
}
```

### CopyLinkButton
```typescript
interface CopyLinkButtonProps {
  slug: string;
  variant?: 'primary' | 'secondary';
}
```

---

## API

### GET /api/properties

**响应**：
```typescript
{
  properties: [
    {
      id: string;
      address: string;
      unit?: string;
      city: string;
      state: string;
      zip_code: string;
      slug: string;
      notes?: string;
      ticket_stats: {
        total: number;
        active: number;  // NEW + ACTION_REQUIRED + PENDING_RECEIPT
        closed: number;
      };
      created_at: string;
    }
  ]
}
```

### POST /api/properties

**请求**：
```typescript
{
  address: string;        // required
  unit?: string;
  city: string;           // required
  state: string;          // required
  zip_code: string;       // required, 5 digits
  notes?: string;
}
```

**响应**：
```typescript
{
  id: string;
  slug: string;           // 自动生成
  tenant_link: string;    // 完整URL
  ...其他字段
}
```

### PUT /api/properties/[id]

**请求**：
```typescript
{
  address?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
}
```

**响应**：
```typescript
{
  id: string;
  slug: string;  // 不变
  ...更新后的字段
}
```

### DELETE /api/properties/[id]

**前置检查**：
```typescript
// 检查是否有active工单
SELECT COUNT(*) FROM tickets 
WHERE property_id = $1 
AND status IN ('new', 'action_required', 'pending_receipt');

// 如果count > 0，返回403
{
  error: 'Cannot delete property with active tickets',
  active_ticket_count: 2
}
```

**响应**：
- 成功：`204 No Content`
- 失败：`403 Forbidden` + error信息

### GET /api/properties/[id]/tickets

**查询参数**：
```typescript
?status=active  // 过滤active工单
```

**响应**：
```typescript
{
  tickets: [...],
  count: number
}
```

---

## 边缘场景处理

### 1. Free Plan限制

**场景**：用户已有3个房产（Free限制）

**处理**：
```typescript
const handleAddProperty = () => {
  if (user.plan === 'free' && properties.length >= 3) {
    openDialog({
      title: 'Upgrade Required',
      message: 'Free plan allows up to 3 properties.\n\nUpgrade to Pro to add unlimited properties.',
      actions: [
        { label: 'View Plans', onClick: () => router.push('/pricing') },
        { label: 'Cancel', onClick: closeDialog }
      ]
    });
    return;
  }
  
  openCreatePropertyModal();
};
```

### 2. 首次使用引导

**场景**：新用户登录后无房产

**处理**：
```typescript
useEffect(() => {
  if (properties.length === 0 && !hasSeenOnboarding) {
    // 显示引导弹窗或空状态
    setShowOnboarding(true);
  }
}, [properties]);
```

### 3. Tenant Link已失效

**场景**：房产被删除，租客访问旧链接

**处理**：
```
/report/[slug] → 404 页面

"This property is no longer available.
Please contact your landlord for assistance."
```

### 4. Slug冲突

**场景**：生成的slug已存在

**处理**：
```typescript
// 后端生成slug时添加随机后缀
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

---

## 权限矩阵

| 操作 | Owner | 其他用户 |
|------|-------|---------|
| 查看列表 | ✅ 查看自己的 | ❌ 无权限 |
| 创建房产 | ✅ 受plan限制 | ❌ 无权限 |
| 编辑房产 | ✅ 自己的 | ❌ 无权限 |
| 删除房产 | ✅ 自己的（无active工单） | ❌ 无权限 |
| 复制链接 | ✅ 自己的 | ❌ 无权限 |

---

## 验证清单

- [ ] Properties页面显示正常
- [ ] 空状态显示正确
- [ ] 顶部导航[Properties]高亮
- [ ] [← Back to Dashboard]返回正常
- [ ] [+ Add Property]打开创建弹窗
- [ ] 创建表单验证正常（必填字段、ZIP格式）
- [ ] 创建成功后tenant link自动复制
- [ ] [📋 Copy Link]按钮正常
- [ ] 复制成功显示toast提示
- [ ] [View Tickets]跳转到Dashboard并筛选
- [ ] [Edit]按钮打开编辑弹窗
- [ ] 编辑表单预填充数据
- [ ] 编辑保存成功
- [ ] 编辑不改变slug
- [ ] [Delete]按钮触发检查
- [ ] 有active工单时阻止删除
- [ ] 无active工单时允许删除
- [ ] 删除确认弹窗显示正确信息
- [ ] 删除成功后更新列表
- [ ] Free plan限制3个房产
- [ ] 超过限制显示upgrade提示

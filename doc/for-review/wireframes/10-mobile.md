# 10. 移动端响应式设计

---

## 设计理念

**聚焦核心场景，桌面优先**

基于真实用户行为分析，我们只对以下2个高频移动端场景做深度适配：

1. **租客提交工单** - 90%租客在现场用手机拍照上传
2. **房东查看工单详情** - 房东收到通知后立即在手机上查看

其他页面（Dashboard、工单列表、报表导出、手动导入）采用基础响应式布局，优先保证桌面端体验。

---

## P0：必须适配的页面

### 1. 租客报修页面（移动端）

**路由**: `/report/[slug]`  
**使用场景**: 租客发现问题 → 拍照 → 提交工单

```
┌──────────────────────────┐
│ 🏠 StoopKeep              │
├──────────────────────────┤
│                          │
│ Report a Repair          │
│ 123 Main St, Apt 2B      │
│                          │
│ ─────────────────────    │
│                          │
│ What needs fixing? *     │
│ ┌──────────────────────┐ │
│ │ Kitchen sink is      │ │
│ │ leaking badly        │ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
│ 📸 Add Photos *          │
│ ┌────┐ ┌────┐ ┌────┐   │
│ │img1│ │img2│ │ +  │   │
│ └────┘ └────┘ └────┘   │
│ (Tap to take photo)      │
│                          │
│ ☑️ This is urgent        │
│                          │
│ Your Contact Info *      │
│ ┌──────────────────────┐ │
│ │ John Tenant          │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ john@email.com       │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ (555) 123-4567       │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │   Submit Report      │ │
│ └──────────────────────┘ │
│                          │
│ 🔒 Secure & Private      │
│                          │
└──────────────────────────┘
```

**移动端优化**：
- ✅ 单列布局，全宽输入框
- ✅ 大号按钮（最小44×44px触摸区域）
- ✅ 相机调用：直接打开手机相机拍照
- ✅ 文件上传：支持从相册选择多张
- ✅ Textarea自动扩展高度
- ✅ 表单验证实时提示（不需要等提交）
- ✅ 提交后全屏成功页面（不是小弹窗）

---

### 2. 工单详情页面（移动端）

**路由**: `/tickets/[id]`  
**使用场景**: 房东收到Email通知（新工单提醒）→ 点击链接 → 查看详情

**移动端只适配**: NEW/ACTION_REQUIRED 状态的工单（紧急通知场景）

---

#### NEW/ACTION_REQUIRED 工单（唯一移动端深度适配场景）

```
┌──────────────────────────┐
│ [← Back]      [⋮ Menu]   │
├──────────────────────────┤
│                          │
│ 🔴 NEW → ACTION REQUIRED │
│ (Opening marks as read)  │
│                          │
│ 📋 Tenant Submitted      │
│                          │
│ Kitchen Sink Leak        │
│ URGENT                   │
│                          │
│ Property                 │
│ 🏠 123 Main St, Apt 2B   │
│                          │
│ Reported by              │
│ 👤 John Tenant           │
│ 📧 john@email.com        │
│ 📞 (555) 123-4567        │
│                          │
│ ─────────────────────    │
│                          │
│ Description              │
│ Kitchen sink is leaking  │
│ badly under the counter. │
│ Water is dripping onto   │
│ the floor.               │
│                          │
│ ─────────────────────    │
│                          │
│ Photos (3)               │
│ ┌─────────────────────┐  │
│ │                     │  │
│ │    [Photo 1]        │  │
│ │                     │  │
│ └─────────────────────┘  │
│ ← → Swipe to next       │
│                          │
│ ─────────────────────    │
│                          │
│ 🤖 AI Analysis           │
│ Category: Plumbing       │
│ Severity: High           │
│ Suggestion: Call         │
│ licensed plumber         │
│                          │
│ ─────────────────────    │
│                          │
│ 📝 Landlord Notes        │
│ ┌──────────────────────┐ │
│ │ Tap to add notes...  │ │
│ │                      │ │
│ └──────────────────────┘ │
│ [Save] (if changed)      │
│                          │
│ ─────────────────────    │
│                          │
│ Submitted: 2h ago        │
│                          │
└──────────────────────────┘

[Fixed Bottom Bar]
┌──────────────────────────┐
│ [Mark Complete]  [⋮]     │
└──────────────────────────┘
```

**点击[Mark Complete]展开选项**：
```
┌─────────────────────────────┐
│ How to complete?            │
├─────────────────────────────┤
│ [Complete (No Receipt)]     │
│ [Close with Receipt]        │
│ [Mark as Invalid]           │
└─────────────────────────────┘
```

**[⋮] Menu选项**：
```
┌──────────────────────────┐
│ Mark Complete (No Receipt)│
│ Close with Receipt       │
│ Mark as Invalid          │
└──────────────────────────┘
```

---

**移动端优化**：
- ✅ 全屏页面（不是弹窗）
- ✅ 返回按钮（左上角）
- ✅ 照片全宽显示，左右滑动切换
- ✅ 照片点击放大查看（Lightbox）
- ✅ 电话号码可直接拨打（tel:链接）
- ✅ 邮箱可直接打开邮件（mailto:链接）
- ✅ Notes inline编辑，修改后显示[Save]
- ✅ 底部固定操作按钮（不随滚动消失）
- ✅ 打开NEW工单自动转ACTION_REQUIRED
- ✅ 信息分段清晰（视觉分隔线）

---

#### 其他状态工单的移动端处理

**PENDING_RECEIPT / CLOSED / ARCHIVED 工单**：

移动端访问时显示桌面端提示页面：

```
┌──────────────────────────┐
│ [← Back]                 │
├──────────────────────────┤
│                          │
│                          │
│        💻                │
│                          │
│  View on Desktop         │
│                          │
│  This ticket requires    │
│  desktop to manage:      │
│                          │
│  • Upload receipts       │
│  • Edit ticket details   │
│  • View full history     │
│                          │
│  Please use your computer│
│  to access this ticket.  │
│                          │
│                          │
└──────────────────────────┘
```

**说明**：
- PENDING_RECEIPT：需要上传收据，移动端体验差
- CLOSED：需要编辑详情，桌面端更方便
- ARCHIVED：低频查看场景，无需移动端优化

**技术实现**：
```typescript
// 移动端检测 + 状态检查
const TicketDetail = ({ ticket }) => {
  const isMobile = useIsMobile();
  
  // 移动端只支持NEW/ACTION_REQUIRED
  if (isMobile && !['new', 'action_required'].includes(ticket.status)) {
    return <DesktopOnlyMessage />;
  }
  
  return isMobile ? (
    <TicketDetailMobile ticket={ticket} />
  ) : (
    <TicketDetailModal ticket={ticket} />
  );
};
```

---

## 其他页面的处理方案

### 基础响应式（无需特殊设计）

以下页面采用标准响应式布局，确保能用但不做深度优化：

#### Dashboard (`/dashboard`)
- 卡片堆叠成单列
- 统计数字保持可读
- 按钮可点击（最小44px）
- 建议：桌面端使用体验更好

#### 工单列表 (`/tickets`)
- 表格变为卡片列表
- 筛选器收起（展开菜单）
- 可以查看，但批量操作建议电脑

#### 房产管理 (`/properties`)
- 基础响应式布局
- 可以查看，添加房产建议电脑

#### 登录注册 (`/login`, `/signup`)
- 居中表单
- 全宽输入框
- 标准移动端表单体验

---

### 不支持移动端的页面

以下页面在移动端访问时显示提示：

#### 税务报表页 (`/reports`)
```
┌──────────────────────────┐
│                          │
│    💻                    │
│                          │
│ Desktop Only Feature     │
│                          │
│ Tax reports are best     │
│ viewed on a computer.    │
│                          │
│ Please visit this page   │
│ on your desktop or       │
│ laptop.                  │
│                          │
└──────────────────────────┘
```

#### 手动导入 (`/import`)
- 显示"此功能建议在电脑上使用"
- 原因：CSV上传、批量编辑在手机上体验差

---

## 断点设置

```css
/* 移动端（深度适配） */
@media (max-width: 767px) {
  /* 租客报修页面 + 工单详情页面 */
  - 单列布局
  - 全宽输入框
  - 大号按钮（min-height: 44px）
  - 照片全宽显示
  - 弹窗改为全屏页面
}

/* 平板（基础响应式） */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 所有页面 */
  - 2列卡片布局
  - 导航栏收起
  - 表格变为卡片
}

/* 桌面端（主设计） */
@media (min-width: 1024px) {
  /* 所有页面 */
  - 完整桌面端设计
  - 弹窗模式
  - 多列布局
}
```

---

## 技术实现

### 移动端检测

```typescript
// 检测是否为移动设备
const isMobile = () => {
  return window.innerWidth < 768;
};

// 针对特定页面的移动端组件
const TicketDetail = () => {
  const mobile = isMobile();
  
  return mobile ? (
    <TicketDetailMobile />  // 全屏页面
  ) : (
    <TicketDetailModal />   // 弹窗
  );
};
```

### 响应式图片

```typescript
// 租客报修页面 - 图片上传
<input 
  type="file" 
  accept="image/*" 
  capture="environment"  // 移动端直接调用相机
  multiple
/>

// 工单详情 - 照片查看
<img 
  src={photo.url}
  loading="lazy"
  onClick={openLightbox}  // 移动端点击放大
  className="w-full rounded-lg"
/>
```

### 触摸优化

```css
/* 最小触摸区域 */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* 防止双击缩放 */
button {
  touch-action: manipulation;
}

/* 照片轮播 */
.photo-carousel {
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
}
```

---

## 设计资源

### 移动端Viewport

```html
<meta 
  name="viewport" 
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
/>
```

### 苹果Web App

```html
<!-- iOS全屏模式 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

<!-- 图标 -->
<link rel="apple-touch-icon" href="/icon-192x192.png">
```

---

## 总结

### ✅ 深度适配（P0）
- 租客报修页面：移动端优先设计
- 工单详情页面：全屏页面 + 触摸优化

### ✅ 基础响应式（P1）
- Dashboard、工单列表、房产管理、登录注册
- 能看能用，建议桌面端操作

### ❌ 不支持移动端（P2）
- 税务报表页面：显示"请使用电脑"
- 手动导入页面：桌面端专属功能

**设计原则**：**聚焦核心场景，资源投入产出比最大化**

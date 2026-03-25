# 01. 落地页（Landing Page）

**路由**: `/`  
**访问**: 公开

---

## 未登录状态

```
┌─────────────────────────────────────────────┐
│  Header                                     │
│  [Logo] StoopKeep        [Login] [Sign Up]  │
├─────────────────────────────────────────────┤
│                                             │
│           Hero Section                      │
│                                             │
│    🏠 Landlord Maintenance Made Easy       │
│                                             │
│    Track repairs, Save receipts,           │
│    Export for taxes — automatically        │
│                                             │
│           [Start Free Trial]                │
│                                             │
│    ✓ 3 free tickets  ✓ No credit card     │
├─────────────────────────────────────────────┤
│                                             │
│           How It Works                      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Step 1: Share Link with Tenant      │   │
│  │ ┌─────────────────────────────────┐ │   │
│  │ │                                 │ │   │
│  │ │     [Screenshot Placeholder]    │ │   │
│  │ │      Properties page with       │ │   │
│  │ │      "Copy Link" highlighted    │ │   │
│  │ │                                 │ │   │
│  │ └─────────────────────────────────┘ │   │
│  │ Generate a unique link for each     │   │
│  │ property. Tenants report without    │   │
│  │ creating an account.                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Step 2: Tenant Reports Issue        │   │
│  │ ┌─────────────────────────────────┐ │   │
│  │ │                                 │ │   │
│  │ │     [Screenshot Placeholder]    │ │   │
│  │ │    Tenant form with photo upload│ │   │
│  │ │                                 │ │   │
│  │ └─────────────────────────────────┘ │   │
│  │ AI analyzes description and photos, │   │
│  │ categorizes issue automatically.    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Step 3: Track & Export for Taxes   │   │
│  │ ┌─────────────────────────────────┐ │   │
│  │ │                                 │ │   │
│  │ │     [Screenshot Placeholder]    │ │   │
│  │ │   Dashboard + Excel preview     │ │   │
│  │ │                                 │ │   │
│  │ └─────────────────────────────────┘ │   │
│  │ Close tickets with costs, export    │   │
│  │ Schedule E ready spreadsheet.       │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│           Pricing                           │
│                                             │
│  ┌──────────┐    ┌──────────┐              │
│  │  Free    │    │  Pro     │              │
│  │  3 tickets│   │ Unlimited│              │
│  │  $0      │    │ $12/month│              │
│  │          │    │ $99/year │              │
│  │          │    │ Save $45!│              │
│  │ [Get Started] │ [See Plans] │           │
│  └──────────┘    └──────────┘              │
│                                             │
├─────────────────────────────────────────────┤
│  Footer                                     │
│  © 2025 StoopKeep | Privacy | Terms         │
└─────────────────────────────────────────────┘
```

---

## 已登录状态

```
┌─────────────────────────────────────────────┐
│  Header                                     │
│  [Logo] StoopKeep                       [👤 J]│
├─────────────────────────────────────────────┤
│                                             │
│           Hero Section                      │
│                                             │
│    🏠 Landlord Maintenance Made Easy       │
│                                             │
│    Track repairs, Save receipts,           │
│    Export for taxes — automatically        │
│                                             │
│           [Go to Dashboard]                 │
│                                             │
│    ✓ Currently on Free plan               │
├─────────────────────────────────────────────┤
│  (How It Works section - same)             │
├─────────────────────────────────────────────┤
│                                             │
│           Pricing                           │
│                                             │
│  ┌──────────┐    ┌──────────┐              │
│  │  Free    │    │  Pro     │              │
│  │  3 tickets│   │ Unlimited│              │
│  │  $0      │    │ $12/month│              │
│  │          │    │ $99/year │              │
│  │          │    │ Save $45!│              │
│  │ ✓ Current│    │ [Upgrade]│              │
│  └──────────┘    └──────────┘              │
│                                             │
└─────────────────────────────────────────────┘
```

**用户头像下拉菜单**（点击右上角头像）:
```
┌────────────────────┐
│ john@example.com   │
├────────────────────┤
│ Dashboard          │
│ Properties         │
│ Settings           │
├────────────────────┤
│ Logout             │
└────────────────────┘
```

**如果是Pro用户**:
```
│           Pricing                           │
│                                             │
│  ┌──────────┐    ┌──────────┐              │
│  │  Free    │    │  Pro     │              │
│  │  3 tickets│   │ Unlimited│              │
│  │  $0      │    │ $12/month│              │
│  │          │    │ $99/year │              │
│  │          │    │ Save $45!│              │
│  │          │    │ ✓ Current│              │
│  └──────────┘    └──────────┘              │
```

---

## 按钮跳转说明

| 按钮 | 位置 | 未登录 | 已登录(Free) | 已登录(Pro) | 说明 |
|------|------|--------|------------|-----------|------|
| **[Logo]** | Header | `/` | `/` | `/` | 回到首页 |
| **[Login]** | Header | `/login` | - | - | 未登录才显示 |
| **[Sign Up]** | Header | `/login` | - | - | 未登录才显示 |
| **[👤 J]** | Header | - | 下拉菜单 | 下拉菜单 | 已登录才显示 |
| **[Start Free Trial]** | Hero | `/login` | `/dashboard` | `/dashboard` | 主CTA |
| **[Get Started]** | Free卡片 | `/login` | - | - | 未登录才显示 |
| **[See Plans]** | Pro卡片 | `/pricing` | - | - | 未登录才显示 |
| **✓ Current** | Free卡片 | - | 静态文字 | - | Free用户显示 |
| **[Upgrade]** | Pro卡片 | - | `/pricing` | - | Free用户显示 |
| **✓ Current** | Pro卡片 | - | - | 静态文字 | Pro用户显示 |
| **Privacy** | Footer | `/privacy` | `/privacy` | `/privacy` | 隐私政策 |
| **Terms** | Footer | `/terms` | `/terms` | `/terms` | 服务条款 |

---

## 状态逻辑说明

| 用户状态 | Header显示 | Hero CTA | Pricing区域显示 |
|---------|-----------|----------|---------------|
| **未登录** | [Login] [Sign Up] | [Start Free Trial] → `/login` | Free: [Get Started]<br>Pro: [See Plans] |
| **Free用户** | [👤 J] 头像 | [Go to Dashboard] | Free: ✓ Current<br>Pro: [Upgrade] |
| **Pro用户** | [👤 J] 头像 | [Go to Dashboard] | Free: 无按钮<br>Pro: ✓ Current |

---

## 组件

- `Hero` - 主标题和CTA
- `FeatureSection` - 功能介绍（How It Works）
- `PricingCards` - 定价卡片
- `UserDropdown` - 用户头像下拉菜单

---

## API

- `GET /api/auth/session` - 检查登录状态（Supabase自动处理）

---

## 优化说明

1. ✅ **移除冗余**：已登录用户Header只显示头像，不重复显示Dashboard链接
2. ✅ **动态Pricing**：根据`subscription_status`动态显示按钮状态
3. ✅ **清晰反馈**：用户始终知道自己当前的套餐（✓ Current标识）
4. ✅ **防误操作**：Pro用户无法"降级"回Free（无按钮）
5. ✅ **How It Works展示**：3个带截图占位符的步骤卡片

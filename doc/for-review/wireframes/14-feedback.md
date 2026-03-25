# 14. 用户反馈功能

**入口**: 
- 主页：Footer链接或右下角悬浮按钮
- Dashboard：侧边栏菜单或右上角下拉菜单  
**访问**: 陌生人可访问（主页），登录用户（Dashboard）

---

## 设计理念

反馈功能是产品迭代的关键信息源：
- **陌生人反馈**：访客无需注册即可提交bug、建议
- **用户反馈**：登录用户可查看自己的反馈历史和状态
- **管理员视图**：创始人可快速查看、分类、处理反馈
- **低成本**：直接存Supabase，无需第三方工具

---

## 1. 主页反馈入口（陌生人）

### 入口方式

**方案A：Footer链接**（推荐）
```
┌────────────────────────────────────────┐
│                                        │
│  Landing Page Content...               │
│                                        │
├────────────────────────────────────────┤
│  Footer                                │
│  About  •  Blog  •  [Give Feedback]   │ ← 点击打开Modal
└────────────────────────────────────────┘
```

**方案B：右下角悬浮按钮**（可选）
```
┌────────────────────────────────────────┐
│                                        │
│  Landing Page Content...               │
│                                        │
│                                        │
│                              ┌───────┐ │
│                              │ 💬    │ │ ← 悬浮按钮
│                              │Feedback│
│                              └───────┘ │
└────────────────────────────────────────┘
```

---

### 反馈弹窗（Modal）- 陌生人版本

```
┌──────────────────────────────────────────────┐
│  Give Us Feedback                  [X]       │
├──────────────────────────────────────────────┤
│                                              │
│  We'd love to hear from you!                 │
│                                              │
│  Feedback Type *                             │
│  ┌────────────────────────────┐             │
│  │ 🐛 Bug Report           ▼  │             │
│  └────────────────────────────┘             │
│  › 🐛 Bug Report                             │
│  › 💡 Feature Request                        │
│  › ❓ Question                               │
│  › 💬 General Feedback                       │
│                                              │
│  Your Email *                                │
│  ┌────────────────────────────┐             │
│  │ you@example.com            │             │
│  └────────────────────────────┘             │
│                                              │
│  Name (optional)                             │
│  ┌────────────────────────────┐             │
│  │ John Doe                   │             │
│  └────────────────────────────┘             │
│                                              │
│  Message * (at least 20 characters)          │
│  ┌────────────────────────────────────────┐ │
│  │ I noticed that when I try to...        │ │
│  │                                        │ │
│  │                                        │ │
│  │                                        │ │
│  └────────────────────────────────────────┘ │
│  Character count: 156 / min 20              │
│                                              │
│  Screenshots (optional, max 5)               │
│  [Choose Files] or [Drag & Drop]            │
│  📎 screenshot1.png (2.3 MB) [x]            │
│  📎 screenshot2.png (1.8 MB) [x]            │
│                                              │
│  [ Cancel ]              [ Submit Feedback ] │
│                                              │
└──────────────────────────────────────────────┘
```

**提交成功提示**：
```
┌──────────────────────────────────────────────┐
│  ✅ Thank You!                     [X]       │
├──────────────────────────────────────────────┤
│                                              │
│  Your feedback has been submitted.           │
│  We'll review it and get back to you if      │
│  needed at: you@example.com                  │
│                                              │
│  [ Close ]                                   │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 2. Dashboard反馈入口（已登录用户）

### 入口方式

**方案A：侧边栏菜单**（推荐）
```
┌─────────────┬──────────────────────────────┐
│ Dashboard   │                              │
│ Properties  │                              │
│ Reports     │                              │
│ ───────────│                              │
│ [Give Feedback] ← 侧边栏底部              │
└─────────────┴──────────────────────────────┘
```

**方案B：用户菜单下拉**（备选）
```
┌────────────────────────────────────────────┐
│  StoopKeep              [👤 John Doe ▼]    │
│                          ┌──────────────┐  │
│                          │ My Account   │  │
│                          │ Settings     │  │
│                          │ Give Feedback│ ← 点击
│                          │ Logout       │  │
│                          └──────────────┘  │
└────────────────────────────────────────────┘
```

---

### 反馈弹窗 - 用户版本（简化版）

```
┌──────────────────────────────────────────────┐
│  Give Us Feedback                  [X]       │
├──────────────────────────────────────────────┤
│                                              │
│  Hi John! We'd love to hear from you.        │
│                                              │
│  Feedback Type *                             │
│  ┌────────────────────────────┐             │
│  │ 💡 Feature Request      ▼  │             │
│  └────────────────────────────┘             │
│                                              │
│  Message * (at least 20 characters)          │
│  ┌────────────────────────────────────────┐ │
│  │ It would be great to have...           │ │
│  │                                        │ │
│  │                                        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Screenshots (optional, max 5)               │
│  [Choose Files] or [Drag & Drop]            │
│                                              │
│  💡 Tip: We'll reply to john@doe.com        │
│                                              │
│  [ Cancel ]              [ Submit Feedback ] │
│                                              │
│  [View My Past Feedback]                    │ ← 查看历史反馈
│                                              │
└──────────────────────────────────────────────┘
```

**差异点**：
- ✅ 无需填写邮箱（自动使用登录邮箱）
- ✅ 可以查看历史反馈
- ✅ 显示用户名问候

---

### 用户反馈历史页面

```
┌──────────────────────────────────────────────┐
│  My Feedback                         [X]     │
├──────────────────────────────────────────────┤
│                                              │
│  All (8)  •  New (2)  •  In Progress (3)     │
│            •  Resolved (3)                   │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 💡 Feature Request  •  NEW             │ │
│  │ Batch edit for multiple tickets         │ │
│  │ Submitted 2 days ago                    │ │
│  │ [View Details]                          │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 🐛 Bug Report  •  IN PROGRESS          │ │
│  │ Receipt upload fails on Safari          │ │
│  │ Submitted 1 week ago                    │ │
│  │ 💬 Admin: "Working on a fix..."        │ │
│  │ [View Details]                          │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 💬 General  •  ✅ RESOLVED             │ │
│  │ How do I export last 3 years?           │ │
│  │ Submitted 2 weeks ago                   │ │
│  │ 💬 Admin: "Check the Reports page..."  │ │
│  │ [View Details]                          │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [ + Submit New Feedback ]                   │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 3. 管理员反馈后台（Founder视图）

### 路由：`/admin/feedback`（仅管理员可访问）

```
┌──────────────────────────────────────────────────────────┐
│  Feedback Management                      [Admin Panel]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Status: [All ▼]  Type: [All ▼]  [Search...]           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🐛 Bug Report  •  NEW  •  3 hours ago             │ │
│  │ From: user@example.com (Visitor)                   │ │
│  │ Receipt upload fails on Safari browser             │ │
│  │                                                    │ │
│  │ Message:                                           │ │
│  │ "When I try to upload a receipt on Safari, I get  │ │
│  │  an error message saying 'File type not supported'│ │
│  │  even though it's a PNG file..."                  │ │
│  │                                                    │ │
│  │ Screenshots: [View 2 attachments]                  │ │
│  │ Page: https://stoopkeep.com/dashboard/tickets/123 │ │
│  │ Browser: Safari 17.3 / macOS 14.2                 │ │
│  │                                                    │ │
│  │ Admin Notes:                                       │ │
│  │ ┌────────────────────────────────────────┐        │ │
│  │ │ [Type notes here...]                   │        │ │
│  │ └────────────────────────────────────────┘        │ │
│  │                                                    │ │
│  │ Status: [In Progress ▼]  [Update]                 │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 💡 Feature Request  •  IN PROGRESS  •  2 days ago │ │
│  │ From: john@doe.com (User ID: abc123)               │ │
│  │ Batch edit for multiple tickets                    │ │
│  │ [Expand]                                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Page 1 of 12  [< Previous] [Next >]                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**快速统计**（顶部）：
```
┌────────────────────────────────────────────────────────┐
│  NEW (8)  •  IN PROGRESS (12)  •  RESOLVED (45)        │
│                                                        │
│  This Week: 15 new  •  This Month: 63 new              │
└────────────────────────────────────────────────────────┘
```

---

## 4. 字段说明

### 必填字段

| 字段 | 陌生人 | 用户 | 说明 |
|------|--------|------|------|
| **Email** | ✅ | ❌ | 陌生人必填，用户自动填充 |
| **Feedback Type** | ✅ | ✅ | 必选（bug/feature_request/question/general） |
| **Message** | ✅ | ✅ | 最少20字符 |

### 可选字段

| 字段 | 说明 | 限制 |
|------|------|------|
| **Name** | 姓名（方便称呼） | 最多100字符 |
| **Screenshots** | 截图 | 最多5张，每张<5MB |

---

## 5. 反馈类型说明

| 类型 | 图标 | 说明 | 用户场景 |
|------|------|------|---------|
| **Bug Report** | 🐛 | Bug报告 | "上传收据失败"、"页面显示错误" |
| **Feature Request** | 💡 | 功能建议 | "希望能批量编辑"、"支持导出PDF" |
| **Question** | ❓ | 问题咨询 | "如何导出3年报表"、"如何删除房产" |
| **General** | 💬 | 其他反馈 | "产品很棒"、"文档不清晰" |

---

## 6. 状态流转

```
NEW (新提交)
  ↓
IN_PROGRESS (处理中)
  ↓
RESOLVED (已解决) ← 可以添加解决方案备注
  ↓
CLOSED (关闭) ← 可选，如果不需要进一步跟进
```

---

## 7. 实现优先级

### MVP（立即实现）
1. ✅ 陌生人反馈（主页Footer链接）
2. ✅ 用户反馈（Dashboard侧边栏）
3. ✅ 管理员后台（简单列表+状态更新）

### V2（可选）
4. ⏸️ 用户查看历史反馈
5. ⏸️ 邮件通知（新反馈自动发邮件给管理员）
6. ⏸️ 反馈投票（用户可以给别人的建议点赞）

---

## 8. 技术实现要点

### 前端组件
```typescript
// components/FeedbackModal.tsx
- FeedbackForm（表单）
- FileUploader（截图上传）
- SuccessMessage（提交成功提示）

// pages/admin/feedback.tsx
- FeedbackList（反馈列表）
- FeedbackDetail（反馈详情）
- StatusUpdater（状态更新）
```

### API调用
```typescript
// 陌生人提交
POST /api/public/feedback

// 用户提交
POST /api/feedback

// 用户查看历史
GET /api/feedback

// 管理员查看所有
GET /api/admin/feedback?status=new&page=1

// 管理员更新状态
PUT /api/admin/feedback/{id}
```

### 数据库查询优化
```sql
-- 管理员Dashboard快速统计
SELECT 
  feedback_type,
  status,
  COUNT(*) as count
FROM feedback
GROUP BY feedback_type, status;

-- 本周新反馈数量
SELECT COUNT(*) 
FROM feedback 
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## 9. UI状态管理

### 反馈类型颜色编码
```css
Bug Report:        Red (#EF4444)
Feature Request:   Blue (#3B82F6)
Question:          Yellow (#F59E0B)
General:           Gray (#6B7280)
```

### 状态颜色编码
```css
NEW:               Orange (#F97316)
IN_PROGRESS:       Blue (#3B82F6)
RESOLVED:          Green (#10B981)
CLOSED:            Gray (#6B7280)
```

---

## 10. 邮件通知（可选V2功能）

**新反馈提醒邮件**（发给管理员）：
```
Subject: 🐛 New Bug Report from user@example.com

From: user@example.com
Type: Bug Report
Page: /dashboard/tickets/123

Message:
"When I try to upload a receipt on Safari..."

View in Admin Panel:
https://stoopkeep.com/admin/feedback/{id}

[Mark as In Progress] [Mark as Resolved]
```

**反馈已处理邮件**（发给用户）：
```
Subject: Your feedback has been resolved

Hi John,

Thank you for your feedback about "Batch edit for tickets".

We've implemented your suggestion in our latest update!

Admin Response:
"This feature is now available on the tickets page..."

Try it now: https://stoopkeep.com/dashboard

- The StoopKeep Team
```

---

## 总结

### 核心价值
- **低成本**：无需Intercom/Zendesk等第三方工具（$50-100/月）
- **直接反馈**：用户可以直接提交bug和建议
- **产品迭代**：创始人可以快速收集和优先排序功能需求
- **用户粘性**：用户看到自己的建议被采纳，增加忠诚度

### 实施建议
1. **MVP先做陌生人反馈**（主页入口）
2. **Dashboard加用户反馈**（侧边栏入口）
3. **简单管理后台**（Supabase Dashboard或自建页面）
4. **可选：邮件通知**（Resend.com免费3000封/月）

---

**下一步**: 实现 `POST /api/public/feedback` API 和前端Modal组件

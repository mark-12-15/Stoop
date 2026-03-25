# 页面线框图设计

**设计原则**:
- 移动优先（Mobile First）
- 简洁直观（Minimal UI）
- 快速响应（1秒内加载）

---

## 📑 页面索引

### 公开页面（无需登录）

- [01. 落地页](./01-landing-page.md) - Landing Page
- [02. 租客提交工单](./02-tenant-report.md) - 租客报修表单及编辑流程
- [03. 登录页面](./03-login.md) - OAuth + Magic Link登录

### 房东端（需登录）

- [04. Dashboard主页](./04-dashboard.md) - 统计卡片 + 最近活动
- [05. 工单详情弹窗](./05-ticket-detail.md) - 工单查看和操作
- [07. 房产管理页面](./07-properties.md) - 房产列表和管理
- [09. 定价页面](./09-pricing.md) - 套餐对比和升级
- [11. 工单管理页面](./11-tickets-list.md) - 工单列表 + 筛选（纯管理，无导出）
- [12. 手动添加工单](./12-manual-import.md) - 手动添加 + 批量导入 + 编辑功能
- [13. 税务报表页面](./13-reports.md) - Schedule E + Last 3 Years导出

### 响应式设计

- [10. 移动端适配](./10-mobile.md) - 移动端响应式设计

---

## 🔗 相关文档

- [用户流程图](../user-flows.md) - 完整用户操作流程
- [组件规格](../component-specs.md) - 组件Props和API映射
- [状态机设计](../../technical/state-machine.md) - 工单状态流转
- [API设计](../../technical/api-design.md) - 后端接口规格

---

## 📝 使用说明

每个页面文档包含：
- **路由**: 页面URL
- **访问权限**: 公开/需登录
- **页面结构**: ASCII线框图
- **交互逻辑**: 按钮行为和跳转
- **组件列表**: 使用的React组件
- **API调用**: 相关API端点

开发时请按页面顺序进行，每个文件都是独立完整的设计规格。

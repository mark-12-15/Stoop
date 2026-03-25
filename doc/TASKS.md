# Development Tasks

**规则**: 
- AI每次只领取1个任务
- 完成后打勾 ✅，人类验收通过后删除该行
- 所有任务完成 = 可以上线

---

## 🔧 环境搭建

- [ ] **本地环境搭建** - 安装依赖、配置.env.local、启动开发服务器
- [ ] **数据库初始化** - 在Supabase执行所有建表SQL（参考for-review/database.md）
- [ ] **Cloudflare R2配置** - 创建bucket、生成API keys
- [ ] **Gemini API配置** - 获取API key、测试调用
- [ ] **线上环境部署** - Vercel部署、配置环境变量、连接域名

---

## 📄 页面开发

### 租客端
- [ ] **01-landing-page** - 主页（参考wireframes/01-landing-page.md）
- [ ] **02-tenant-report** - 租客提交工单页（参考wireframes/02-tenant-report.md）

### 房东端（需登录）
- [ ] **03-login** - 登录页（参考wireframes/03-login.md）
- [ ] **04-dashboard** - Dashboard概览（参考wireframes/04-dashboard.md）
- [ ] **05-ticket-detail** - 工单详情页（参考wireframes/05-ticket-detail.md）
- [ ] **07-properties** - 房产管理页（参考wireframes/07-properties.md）
- [ ] **09-pricing** - 定价页（参考wireframes/09-pricing.md）
- [ ] **11-tickets-list** - 工单列表页（参考wireframes/11-tickets-list.md）
- [ ] **12-manual-import** - 手动添加费用页（参考wireframes/12-manual-import.md）
- [ ] **13-reports** - 导出报表页（参考wireframes/13-reports.md）

### 增强功能
- [ ] **10-mobile** - 移动端响应式适配（参考wireframes/10-mobile.md）
- [ ] **14-feedback** - 用户反馈功能（参考wireframes/14-feedback.md）
- [ ] **15-admin-dashboard** - Admin后台（参考wireframes/15-admin-dashboard.md）

---

## 📝 说明

**开发顺序建议**：
1. 先完成环境搭建
2. 再开发租客端（02-tenant-report）
3. 然后开发房东端核心页面（03/04/05/07/11）
4. 最后完成扩展功能（12/13/14/15）

**验收标准**：
- ✅ 页面UI符合wireframe设计
- ✅ 功能正常工作
- ✅ 数据正确写入数据库
- ✅ 人类手动测试通过

**任务完成 = 所有checkbox打勾 + 人类验收通过 + 删除该行**

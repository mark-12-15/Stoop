# Development Tasks

**规则**: 
- AI每次只领取1个任务
- 完成后打勾 ✅，人类验收通过后删除该行
- 所有任务完成 = 可以上线

---

## 🔧 环境搭建

- [ ] **本地环境搭建**
  - [x] 1.1 配置Podman兼容Docker（DOCKER_HOST→/tmp/podman.sock软链接）
  - [x] 1.2 安装Supabase CLI（v2.75.0）
  - [x] 1.3 初始化Supabase项目（`supabase init`）
  - [x] 1.4 启动本地Supabase服务（`supabase start`，禁用edge_runtime+analytics）
  - [x] 1.5 执行数据库迁移SQL（创建所有表）
  - [x] 1.6 配置Supabase Auth（Google OAuth已启用，邮件测试通过）
  - [x] 1.7 Lemon Squeezy本地Mock（NEXT_PUBLIC_LEMON_SQUEEZY_MOCK=true）
  - [x] 1.8 创建.env.local文件（所有环境变量）
  - [x] 1.9 安装Node.js依赖（`npm install`）
  - [x] 1.10 启动Next.js开发服务器（`npm run dev`）
  - [x] 1.11 验证：访问http://localhost:3000 → 200 OK
  - [ ] 1.12 验证：Inbucket邮件测试（http://localhost:54324）
  
- [ ] **线上环境部署** - Vercel部署、配置环境变量、连接域名
  - [ ] 2.1 创建Supabase云服务项目
  - [ ] 2.2 创建Cloudflare R2 bucket
  - [ ] 2.3 配置Lemon Squeezy生产环境
  - [ ] 2.4 Vercel连接GitHub仓库
  - [ ] 2.5 配置Vercel环境变量
  - [ ] 2.6 首次部署测试
  - [ ] 2.7 配置自定义域名
  - [ ] 2.8 配置Apple OAuth（需要Apple Developer账号 + 域名HTTPS就绪后操作）
  - [ ] 2.9 必须有合规的底部链接（Footer) - Terms of Service（服务条款) Privacy Policy（隐私政策） RefundPolicy（退款政策） 提供有效的联系方式

---

## 📄 页面开发

### 租客端
- [x] **01-landing-page** - 主页（参考wireframes/01-landing-page.md）
- [x] **02-tenant-report** - 租客提交工单页（参考wireframes/02-tenant-report.md）

### 房东端（需登录）
- [x] **03-login** - 登录页（参考wireframes/03-login.md）
- [ ] **04-dashboard** - Dashboard概览（参考wireframes/04-dashboard.md）
- [ ] **05-ticket-detail** - 工单详情页（参考wireframes/05-ticket-detail.md）
- [x] **07-properties** - 房产管理页（参考wireframes/07-properties.md）
- [x] **09-pricing** - 定价页（参考wireframes/09-pricing.md）
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

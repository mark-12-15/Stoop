# 数据库设计

**数据库**: PostgreSQL (Supabase)  
**版本**: 15+

---

## 表结构概览

```
users (房东)
  ↓ 1:N
properties (房产)
  ↓ 1:N
tickets (工单)
```

---

## 完整 SQL Schema

```sql
-- ============================================
-- 1. 用户表（房东）
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ==================== 基础身份信息 ====================
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT, -- OAuth登录时自动获取
  
  -- OAuth 登录来源追踪
  auth_provider VARCHAR(50) DEFAULT 'email' CHECK (
    auth_provider IN ('email', 'google', 'apple')
  ),
  auth_provider_id VARCHAR(255), -- OAuth提供商的唯一ID(Google的sub等)
  is_email_verified BOOLEAN DEFAULT false,
  
  -- 用户偏好
  preferred_timezone VARCHAR(50) DEFAULT 'America/New_York',
  
  -- ==================== 订阅管理 ====================
  lemon_squeezy_customer_id VARCHAR(255), -- LS的customer_id
  lemon_squeezy_subscription_id VARCHAR(255), -- LS的subscription_id
  
  subscription_status VARCHAR(50) DEFAULT 'trial' CHECK (
    subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'expired', 'inactive')
  ),
  subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (
    subscription_plan IN ('free', 'monthly', 'annual')
  ),
  subscription_start_date TIMESTAMP WITH TIME ZONE, -- 首次付费时间
  subscription_end_date TIMESTAMP WITH TIME ZONE, -- 到期时间
  
  -- ==================== 试用策略：只限3个工单（无时间限制）====================
  trial_tickets_used INT DEFAULT 0, -- 已使用的试用工单数
  trial_tickets_limit INT DEFAULT 3, -- 试用期工单上限（用完即需升级）
  
  -- ==================== 使用限制（动态） ====================
  max_properties INT DEFAULT 3, -- 免费版最多3个房产，付费版20
  
  -- 月度工单限制（仅付费月付用户）
  tickets_used_this_month INT DEFAULT 0,
  tickets_limit_per_month INT, -- NULL表示无限制，数字表示有限制
  current_billing_cycle_start DATE DEFAULT CURRENT_DATE,
  
  -- ==================== 用户行为追踪 ====================
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_export_at TIMESTAMP WITH TIME ZONE, -- 最后一次导出Schedule E的时间
  total_tickets_created INT DEFAULT 0, -- 历史总工单数（用于分析用户活跃度）
  
  -- ==================== 时间戳 ====================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_users_lemon_squeezy_customer_id ON users(lemon_squeezy_customer_id);
CREATE INDEX idx_users_last_login_inactive ON users(last_login_at) WHERE subscription_status IN ('trial', 'inactive');

-- ============================================
-- 2. 房产表（Units）
-- ============================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 基础信息
  address TEXT NOT NULL,
  unit_number VARCHAR(50),
  slug VARCHAR(100) UNIQUE NOT NULL, -- 用于生成专属链接
  
  -- 附加信息
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_is_active ON properties(is_active);

-- 自动生成 slug 的触发器
CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        COALESCE(NEW.unit_number, '') || '-' || 
        SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8),
        '[^a-z0-9-]', '', 'g'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_slug
BEFORE INSERT ON properties
FOR EACH ROW
EXECUTE FUNCTION generate_property_slug();

-- ============================================
-- 3. 工单表（Tickets）
-- ============================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  property_slug VARCHAR(255), -- 冗余字段：用于房产删除后查询历史工单
  
  -- ==================== 工单来源 ====================
  source VARCHAR(20) DEFAULT 'tenant_submitted' CHECK (
    source IN ('tenant_submitted', 'landlord_manual')
  ), -- tenant_submitted: 租客提交，landlord_manual: 房东手动导入
  
  -- ==================== 费用类型（支持所有租赁费用）====================
  expense_category VARCHAR(50) DEFAULT 'repair_maintenance' CHECK (
    expense_category IN (
      'repair_maintenance',      -- 维修保养（默认）
      'insurance',               -- 保险
      'property_tax',            -- 房产税
      'mortgage_interest',       -- 房贷利息
      'utilities',               -- 水电煤气
      'management_fees',         -- 物业管理费
      'hoa_fees',               -- 业主协会费
      'cleaning',               -- 清洁
      'legal_professional',     -- 法律专业服务
      'advertising',            -- 招租广告
      'supplies',               -- 用品材料
      'travel_auto',            -- 差旅车辆
      'other'                   -- 其他
    )
  ), -- 租客提交的工单自动为repair_maintenance，手动导入时可选择其他类型
  
  -- ==================== 租客提交的原始数据（仅tenant_submitted有值）====================
  tenant_name VARCHAR(255),
  tenant_email VARCHAR(255),
  tenant_phone VARCHAR(50),
  tenant_identifier UUID, -- 租客设备标识（localStorage生成，用于识别同一租客的多个工单）
  tenant_raw_text TEXT, -- landlord_manual时为NULL
  tenant_photo_urls TEXT[],
  is_emergency BOOLEAN DEFAULT false,
  
  -- ==================== AI 分析结果 ====================
  ai_category VARCHAR(50) CHECK (
    ai_category IN ('plumbing', 'electrical', 'appliance', 'hvac', 'structural', 'pest', 'locksmith', 'other')
  ),
  ai_severity VARCHAR(20) CHECK (
    ai_severity IN ('high', 'medium', 'low')
  ),
  ai_summary TEXT,
  ai_suggested_action TEXT,
  ai_processed_at TIMESTAMP WITH TIME ZONE,
  
  -- ==================== 状态流转（5个状态）====================
  status VARCHAR(50) DEFAULT 'new' CHECK (
    status IN ('new', 'action_required', 'pending_receipt', 'closed', 'archived')
  ),
  
  -- 状态时间戳
  viewed_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  -- ==================== 财务数据 ====================
  final_cost DECIMAL(10, 2),
  receipt_photo_urls TEXT[],
  receipt_vendor_name VARCHAR(255),
  receipt_ai_confidence DECIMAL(3, 2), -- AI识别置信度 0-1
  receipt_ai_recognized BOOLEAN DEFAULT false, -- 是否使用AI识别
  
  -- ==================== 房东备注和描述 ====================
  landlord_notes TEXT,
  description TEXT, -- landlord_manual时使用，tenant_submitted时可为NULL（用tenant_raw_text）
  
  -- ==================== 关闭原因 ====================
  closed_reason VARCHAR(20) CHECK (
    closed_reason IN ('completed', 'invalid')
  ), -- completed: 正常完成, invalid: 无效工单（如误报、不是维修问题等）
  
  -- ==================== 时间戳 ====================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_tickets_property_id ON tickets(property_id);
CREATE INDEX idx_tickets_property_slug ON tickets(property_slug); -- 用于已删除房产的历史工单查询
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_source ON tickets(source);
CREATE INDEX idx_tickets_expense_category ON tickets(expense_category); -- 按费用类型筛选
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_ai_category ON tickets(ai_category);
CREATE INDEX idx_tickets_tenant_identifier ON tickets(tenant_identifier); -- 租客查询自己的工单

-- 复合索引
CREATE INDEX idx_tickets_property_status ON tickets(property_id, status);
CREATE INDEX idx_tickets_property_source ON tickets(property_id, source); -- 房东查看手动导入的工单
CREATE INDEX idx_tickets_property_expense ON tickets(property_id, expense_category); -- 按费用类型查询
CREATE INDEX idx_tickets_property_tenant ON tickets(property_id, tenant_identifier); -- 租客在某房产的工单列表
CREATE INDEX idx_tickets_slug_tenant ON tickets(property_slug, tenant_identifier); -- 已删除房产的历史工单查询
CREATE INDEX idx_tickets_closed_at_cost ON tickets(closed_at, final_cost) WHERE status = 'closed';
CREATE INDEX idx_tickets_export ON tickets(property_id, expense_category, closed_at, final_cost) WHERE status = 'closed'; -- Schedule E导出优化

-- 性能优化索引（用于Last 3 Years查询）
CREATE INDEX idx_tickets_closed_at_desc ON tickets(closed_at DESC) WHERE status = 'closed';
-- 用于: SELECT * FROM tickets WHERE status = 'closed' AND closed_at >= (NOW() - INTERVAL '3 years')

-- 年份筛选优化（如果性能有问题才需要）
CREATE INDEX idx_tickets_closed_year ON tickets(EXTRACT(YEAR FROM closed_at), closed_at) WHERE status = 'closed';
-- 用于: SELECT * FROM tickets WHERE EXTRACT(YEAR FROM closed_at) = 2024

-- ============================================
-- 4. 用户反馈表（User Feedback）
-- ============================================
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- ==================== 提交者信息 ====================
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- 已登录用户，如果用户注销，反馈保留
  email VARCHAR(255), -- 陌生人必填，已登录用户可选（自动填充）
  user_name VARCHAR(255), -- 可选，方便称呼
  
  -- ==================== 反馈内容 ====================
  message TEXT NOT NULL, -- 反馈内容（必填，最少20字符）
  screenshot_urls TEXT[], -- 可选截图（最多5张）
  
  -- ==================== 上下文信息 ====================
  feedback_type VARCHAR(20) DEFAULT 'general' CHECK (
    feedback_type IN ('bug', 'feature_request', 'question', 'general')
  ), -- bug报告、功能建议、问题咨询、其他
  page_url TEXT, -- 用户提交时所在的页面URL
  user_agent TEXT, -- 浏览器信息（用于bug排查）
  
  -- ==================== 处理状态 ====================
  status VARCHAR(20) DEFAULT 'new' CHECK (
    status IN ('new', 'in_progress', 'resolved', 'closed')
  ),
  admin_notes TEXT, -- 管理员处理备注
  resolved_at TIMESTAMP WITH TIME ZONE, -- 解决时间
  
  -- ==================== 时间戳 ====================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

-- 复合索引
CREATE INDEX idx_feedback_status_created ON feedback(status, created_at DESC); -- 管理后台按状态筛选

-- ============================================
-- 5. 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到所有表
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. 行级安全策略（RLS）
-- ============================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Users 表：只能查看和修改自己的数据
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Properties 表：房东只能管理自己的房产
CREATE POLICY "Landlords can view own properties"
  ON properties FOR SELECT
  USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "Landlords can update own properties"
  ON properties FOR UPDATE
  USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can delete own properties"
  ON properties FOR DELETE
  USING (landlord_id = auth.uid());

-- Tickets 表：房东只能看自己房产的工单
CREATE POLICY "Landlords can view own tickets"
  ON tickets FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update own tickets"
  ON tickets FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can delete own tickets"
  ON tickets FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

-- 租客端：允许匿名插入工单（通过 API 验证 slug）
CREATE POLICY "Anyone can insert tickets"
  ON tickets FOR INSERT
  WITH CHECK (true);
-- 注意：实际验证在 API 层面通过 property slug 进行

-- ============================================
-- 6. 视图：方便查询
-- ============================================

-- 带房产信息的工单视图
CREATE VIEW tickets_with_property AS
SELECT 
  t.*,
  p.address,
  p.unit_number,
  p.landlord_id
FROM tickets t
JOIN properties p ON t.property_id = p.id;

-- 年度税务报表视图（只包含已关闭的工单）
CREATE VIEW annual_tax_report AS
SELECT 
  EXTRACT(YEAR FROM t.closed_at) AS tax_year,
  p.landlord_id,
  p.address,
  p.unit_number,
  t.id AS ticket_id,
  t.ai_summary AS description,
  t.ai_category,
  t.final_cost,
  t.closed_at AS repair_date,
  t.receipt_photo_urls
FROM tickets t
JOIN properties p ON t.property_id = p.id
WHERE t.status = 'closed' AND t.final_cost IS NOT NULL
ORDER BY t.closed_at DESC;

-- ============================================
-- 7. 初始数据（可选）
-- ============================================

-- 创建一个测试用户（仅开发环境）
-- INSERT INTO users (id, email, full_name, subscription_status)
-- VALUES (
--   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--   'test@example.com',
--   'Test Landlord',
--   'active'
-- );
```

---

## 字段说明

### tickets 表关键字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `tenant_raw_text` | TEXT | 租客原始描述（必填） | "Kitchen sink is leaking under the cabinet" |
| `tenant_photo_urls` | TEXT[] | 租客照片数组 | `["/storage/photo1.jpg", "/storage/photo2.jpg"]` |
| `ai_category` | VARCHAR | AI分类 | `plumbing` |
| `ai_severity` | VARCHAR | AI紧急度 | `medium` |
| `ai_summary` | TEXT | AI一句话总结 | "Kitchen sink pipe leaking slowly, non-emergency" |
| `status` | VARCHAR | 当前状态 | `action_required` |
| `final_cost` | DECIMAL | 实际花费（房东确认） | `150.00` |
| `receipt_photo_urls` | TEXT[] | 收据照片数组 | `["/storage/receipt1.jpg"]` |
| `receipt_vendor_name` | VARCHAR | AI提取的商家名称 | "ABC Plumbing Co." |

### 状态值定义（简化版）

| 状态 | 说明 | 触发方式 |
|------|------|----------|
| `new` | 新提交 | 租客提交表单（自动） |
| `action_required` | 待处理 | AI分析完成（自动） |
| `closed` | 已归档 | 房东填写费用（手动） |
| `archived` | 已存档 | 超过2年的历史记录（自动） |

### 状态流转逻辑

```
租客提交 → new [自动] → action_required [房东填写费用] → closed [2年后自动] → archived
```

**关键简化**:
- 去掉 `scheduled`、`waiting_receipt` 等中间状态
- 房东只需一步操作：查看工单 → 处理维修 → 填写费用并归档
- AI识别金额直接预填到 `final_cost`，不单独存储

---

## 数据迁移脚本

### 第一次部署

```bash
# 1. 连接到 Supabase
psql "postgres://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres"

# 2. 执行完整 Schema
\i /path/to/database-schema.sql

# 3. 验证表创建
\dt

# 4. 验证 RLS 策略
SELECT tablename, policyname FROM pg_policies;
```

### 后续迁移

如果需要修改表结构，创建版本化的迁移文件：

```sql
-- migrations/001_add_tenant_email.sql
ALTER TABLE tickets ADD COLUMN tenant_email VARCHAR(255);
CREATE INDEX idx_tickets_tenant_email ON tickets(tenant_email);
```

---

## 性能优化建议

1. **定期清理**：将超过 2 年的 `closed` 工单移动到 `archived` 状态
2. **分区表**：如果工单量 > 100万，考虑按年份分区
3. **缓存**：房东的统计数据（总工单数、总花费）可以缓存到 Redis

---

## 备份策略

- Supabase 自动每日备份
- 重要数据（收据照片）同时备份到 AWS S3
- 每周导出一次 SQL dump 到本地

---

**下一步**: 查看 `api-design.md` 了解如何通过 API 操作这些数据

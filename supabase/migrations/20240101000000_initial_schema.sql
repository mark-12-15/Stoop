-- ============================================
-- 1. 用户表（房东）
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  auth_provider VARCHAR(50) DEFAULT 'email' CHECK (
    auth_provider IN ('email', 'google', 'apple')
  ),
  auth_provider_id VARCHAR(255),
  is_email_verified BOOLEAN DEFAULT false,
  preferred_timezone VARCHAR(50) DEFAULT 'America/New_York',
  lemon_squeezy_customer_id VARCHAR(255),
  lemon_squeezy_subscription_id VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'trial' CHECK (
    subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'expired', 'inactive')
  ),
  subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (
    subscription_plan IN ('free', 'monthly', 'annual')
  ),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  trial_tickets_used INT DEFAULT 0,
  trial_tickets_limit INT DEFAULT 3,
  max_properties INT DEFAULT 3,
  tickets_used_this_month INT DEFAULT 0,
  tickets_limit_per_month INT,
  current_billing_cycle_start DATE DEFAULT CURRENT_DATE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_export_at TIMESTAMP WITH TIME ZONE,
  total_tickets_created INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_users_lemon_squeezy_customer_id ON users(lemon_squeezy_customer_id);
CREATE INDEX idx_users_last_login_inactive ON users(last_login_at) WHERE subscription_status IN ('trial', 'inactive');

-- ============================================
-- 2. 房产表
-- ============================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  unit_number VARCHAR(50),
  slug VARCHAR(100) UNIQUE NOT NULL,
  notes TEXT,
  -- active: 正常运营 | frozen: 降级自动冻结 | inactive: 软删除
  status VARCHAR(20) DEFAULT 'active' CHECK (
    status IN ('active', 'frozen', 'inactive')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_landlord_status ON properties(landlord_id, status);

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
-- 3. 工单表
-- ============================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  property_slug VARCHAR(255),
  source VARCHAR(20) DEFAULT 'tenant_submitted' CHECK (
    source IN ('tenant_submitted', 'landlord_manual')
  ),
  expense_category VARCHAR(50) DEFAULT 'repair_maintenance' CHECK (
    expense_category IN (
      'repair_maintenance', 'insurance', 'property_tax', 'mortgage_interest',
      'utilities', 'management_fees', 'hoa_fees', 'cleaning',
      'legal_professional', 'advertising', 'supplies', 'travel_auto', 'other'
    )
  ),
  tenant_name VARCHAR(255),
  tenant_email VARCHAR(255),
  tenant_phone VARCHAR(50),
  tenant_identifier UUID,
  tenant_raw_text TEXT,
  tenant_photo_urls TEXT[],
  is_emergency BOOLEAN DEFAULT false,
  ai_category VARCHAR(50) CHECK (
    ai_category IN ('plumbing', 'electrical', 'appliance', 'hvac', 'structural', 'pest', 'locksmith', 'other')
  ),
  ai_severity VARCHAR(20) CHECK (
    ai_severity IN ('high', 'medium', 'low')
  ),
  ai_summary TEXT,
  ai_suggested_action TEXT,
  ai_processed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'new' CHECK (
    status IN ('new', 'action_required', 'pending_receipt', 'closed', 'archived')
  ),
  viewed_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  final_cost DECIMAL(10, 2),
  receipt_photo_urls TEXT[],
  receipt_vendor_name VARCHAR(255),
  receipt_ai_confidence DECIMAL(3, 2),
  receipt_ai_recognized BOOLEAN DEFAULT false,
  landlord_notes TEXT,
  description TEXT,
  closed_reason VARCHAR(20) CHECK (
    closed_reason IN ('completed', 'invalid')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tickets_property_id ON tickets(property_id);
CREATE INDEX idx_tickets_property_slug ON tickets(property_slug);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_source ON tickets(source);
CREATE INDEX idx_tickets_expense_category ON tickets(expense_category);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_ai_category ON tickets(ai_category);
CREATE INDEX idx_tickets_tenant_identifier ON tickets(tenant_identifier);
CREATE INDEX idx_tickets_property_status ON tickets(property_id, status);
CREATE INDEX idx_tickets_property_source ON tickets(property_id, source);
CREATE INDEX idx_tickets_property_expense ON tickets(property_id, expense_category);
CREATE INDEX idx_tickets_property_tenant ON tickets(property_id, tenant_identifier);
CREATE INDEX idx_tickets_slug_tenant ON tickets(property_slug, tenant_identifier);
CREATE INDEX idx_tickets_closed_at_cost ON tickets(closed_at, final_cost) WHERE status = 'closed';
CREATE INDEX idx_tickets_export ON tickets(property_id, expense_category, closed_at, final_cost) WHERE status = 'closed';
CREATE INDEX idx_tickets_closed_at_desc ON tickets(closed_at DESC) WHERE status = 'closed';

-- ============================================
-- 4. 用户反馈表
-- ============================================
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  user_name VARCHAR(255),
  message TEXT NOT NULL,
  screenshot_urls TEXT[],
  feedback_type VARCHAR(20) DEFAULT 'general' CHECK (
    feedback_type IN ('bug', 'feature_request', 'question', 'general')
  ),
  page_url TEXT,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (
    status IN ('new', 'in_progress', 'resolved', 'closed')
  ),
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_status_created ON feedback(status, created_at DESC);

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

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON feedback
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. RLS 策略
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Landlords can view own properties"
  ON properties FOR SELECT USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can insert own properties"
  ON properties FOR INSERT WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "Landlords can update own properties"
  ON properties FOR UPDATE USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can delete own properties"
  ON properties FOR DELETE USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can view own tickets"
  ON tickets FOR SELECT
  USING (property_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));

CREATE POLICY "Landlords can update own tickets"
  ON tickets FOR UPDATE
  USING (property_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));

CREATE POLICY "Landlords can delete own tickets"
  ON tickets FOR DELETE
  USING (property_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));

CREATE POLICY "Anyone can insert tickets"
  ON tickets FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. 视图
-- ============================================
CREATE VIEW tickets_with_property AS
SELECT
  t.*,
  p.address,
  p.unit_number,
  p.landlord_id
FROM tickets t
JOIN properties p ON t.property_id = p.id;

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

-- Migration: replace is_active + is_frozen with unified status field
-- active:   正常运营 | frozen: 降级自动冻结 | inactive: 软删除

-- Add new status column
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'frozen', 'inactive'));

-- Migrate existing data
UPDATE properties SET status = 'inactive' WHERE is_active = false;
UPDATE properties SET status = 'frozen'   WHERE is_active = true AND is_frozen = true;
UPDATE properties SET status = 'active'   WHERE is_active = true AND is_frozen = false;

-- Drop old columns
ALTER TABLE properties DROP COLUMN IF EXISTS is_active;
ALTER TABLE properties DROP COLUMN IF EXISTS is_frozen;

-- Replace old indexes
DROP INDEX IF EXISTS idx_properties_is_active;
DROP INDEX IF EXISTS idx_properties_frozen;

CREATE INDEX IF NOT EXISTS idx_properties_status
  ON properties(status);

CREATE INDEX IF NOT EXISTS idx_properties_landlord_status
  ON properties(landlord_id, status);

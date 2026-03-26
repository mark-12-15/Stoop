-- Add location fields to properties table
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS city    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state   VARCHAR(50),
  ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

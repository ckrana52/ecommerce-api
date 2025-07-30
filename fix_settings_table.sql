-- Fix settings table structure
-- Change value column from DOUBLE to TEXT to support string values

ALTER TABLE settings MODIFY COLUMN `value` TEXT;

-- Verify the change
DESCRIBE settings; 
-- Fix column mapping issues between form and database

-- 1. Make max_bonus_amount nullable to prevent constraint violations
ALTER TABLE promotions ALTER COLUMN max_bonus_amount DROP NOT NULL;

-- 2. If we have data in max_deposit_amount, copy it to max_bonus_amount for compatibility
UPDATE promotions 
SET max_bonus_amount = max_deposit_amount 
WHERE max_bonus_amount IS NULL AND max_deposit_amount IS NOT NULL;

-- 3. Add a trigger to keep both columns in sync
CREATE OR REPLACE FUNCTION sync_bonus_amount_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- When max_deposit_amount is set, also set max_bonus_amount
  IF NEW.max_deposit_amount IS NOT NULL THEN
    NEW.max_bonus_amount = NEW.max_deposit_amount;
  END IF;
  
  -- When max_bonus_amount is set, also set max_deposit_amount  
  IF NEW.max_bonus_amount IS NOT NULL THEN
    NEW.max_deposit_amount = NEW.max_bonus_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_bonus_columns ON promotions;
CREATE TRIGGER sync_bonus_columns
  BEFORE INSERT OR UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION sync_bonus_amount_columns(); 
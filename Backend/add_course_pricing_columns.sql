-- Migration: Add pricing columns to courses table
-- Run this if your courses table already exists without these columns

-- Add price_usd column
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,2) DEFAULT 0.00 CHECK (price_usd >= 0);

-- Add currency column
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';

-- Add is_paid column
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT true;

-- Update existing records to have default values
UPDATE courses 
SET price_usd = 0.00, currency = 'USD', is_paid = false 
WHERE price_usd IS NULL;

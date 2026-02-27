-- Migration: Add missing tables and columns
-- Run this on your existing Supabase database

-- ============================================
-- 1. Add missing columns to courses table
-- ============================================
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,2) DEFAULT 0.00 CHECK (price_usd >= 0);

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT true;

-- Update existing records
UPDATE courses 
SET price_usd = 0.00, currency = 'USD', is_paid = false 
WHERE price_usd IS NULL;

-- ============================================
-- 2. Create bookmarks table
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, course_id)
);

-- ============================================
-- 3. Create newsletters table
-- ============================================
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- 4. Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_course_id ON bookmarks(course_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);

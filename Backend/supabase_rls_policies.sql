-- ============================================
-- SUPABASE RLS & POLICIES FOR EDUVERS
-- This file handles security and access control
-- ============================================

-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;



DROP POLICY IF EXISTS "Select all users by admin only" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow public read access to courses" ON courses;
DROP POLICY IF EXISTS "Instructors can manage courses" ON courses;
DROP POLICY IF EXISTS "Allow public insert to contact_us" ON contact_us;
DROP POLICY IF EXISTS "Admins can view contact_us" ON contact_us;
DROP POLICY IF EXISTS "Delete User BY admin only " ON users;


-- 2. POLICIES FOR 'users' TABLE
-- ============================================

-- Allow users to view their own profile only
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile only
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);


CREATE POLICY "Select all users by admin only" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('teacher')
        )
    );
    

CREATE POLICY "Delete User BY admin only " ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('teacher')
        )
    );

-- 3. POLICIES FOR 'courses' TABLE
-- ============================================

-- Allow public read access to courses
CREATE POLICY "Allow public read access to courses" ON courses
    FOR SELECT USING (true);

-- Only admins/instructors (if defined in user_type) can insert/update/delete 
-- (Assuming user_type Check)
CREATE POLICY "Instructors can manage courses" ON courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('teacher')
        )
    );

-- 4. POLICIES FOR 'contact_us' TABLE
-- ============================================

-- Allow anyone to submit a contact form (Insert)
CREATE POLICY "Allow public insert to contact_us" ON contact_us
    FOR INSERT WITH CHECK (true);

-- Only admins can view contact messages
CREATE POLICY "Admins can view contact_us" ON contact_us
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'teacher'
        )
    );

-- ==============================================================================
-- SKILLSFY PRODUCTION SECURITY LOCKDOWN SCRIPT (V4.0)
-- Run this script in your Supabase SQL Editor to enforce Row Level Security (RLS)
-- This blocks external hackers and anonymous users from inspecting sensitive tables.
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL SENSITIVE TABLES
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blogs ENABLE ROW LEVEL SECURITY;

-- 2. DROP PERMISSIVE LEGACY POLICIES IF ANY EXIST
DROP POLICY IF EXISTS "Public can view students" ON students;
DROP POLICY IF EXISTS "Public can modify students" ON students;
DROP POLICY IF EXISTS "Public can view payments" ON payments;
DROP POLICY IF EXISTS "Public can view workshop regs" ON workshop_registrations;
DROP POLICY IF EXISTS "Public can view enquiries" ON enquiries;

-- 3. COURSES POLICIES (Public read-only, changes through server/service role)
CREATE POLICY "Public can view courses"
  ON courses FOR SELECT
  TO public
  USING (true);

-- 4. BLOGS POLICIES (Public read-only for published articles)
CREATE POLICY "Public can view blogs"
  ON blogs FOR SELECT
  TO public
  USING (true);

-- 5. ENQUIRIES POLICIES (Public can submit leads/newsletter, cannot read other people's emails)
CREATE POLICY "Public can submit enquiries"
  ON enquiries FOR INSERT
  TO public
  WITH CHECK (true);

-- 6. WORKSHOP REGISTRATIONS POLICIES (Public can register for masterclasses, cannot read attendee list)
CREATE POLICY "Public can submit workshop registrations"
  ON workshop_registrations FOR INSERT
  TO public
  WITH CHECK (true);

-- 7. STUDENTS & PAYMENTS LOCKDOWN
-- By default with RLS enabled and NO public policies defined for SELECT/UPDATE/DELETE:
-- - The public / anonymous role gets ZERO access (401/403 or empty array).
-- - Vercel Serverless Functions (/api/admin-data, /api/auth-login) and Supabase Service Role maintain full access.
-- ==============================================================================

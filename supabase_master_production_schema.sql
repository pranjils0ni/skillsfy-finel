-- ==============================================================================
-- SKILLSFY PLATFORM — INFALLIBLE MASTER PRODUCTION SCHEMA MIGRATION (V3.1)
-- Safe to run multiple times (Idempotent & Self-Migrating)
-- ==============================================================================

-- 1. COURSES TABLE & COLUMN MIGRATION
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist on courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'AI & Web Development';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price_inr NUMERIC NOT NULL DEFAULT 149;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price_original_inr NUMERIC DEFAULT 1999;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_seats INT NOT NULL DEFAULT 150;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration VARCHAR(100) DEFAULT '3 Hours Live Masterclass';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS event_date VARCHAR(100) DEFAULT '30 August 2026 (7:00 PM IST)';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'Hinglish';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Insert or Seed Default Courses/Workshops
INSERT INTO courses (slug, title, category, price_inr, price_original_inr, total_seats, duration, event_date, status)
VALUES 
  ('workshop-30-aug', 'AI Web Dev Live Masterclass (30 Aug 2026)', 'AI & Web Development', 149, 1999, 150, '3 Hours Live Masterclass', '30 August 2026 (7:00 PM IST)', 'active'),
  ('standard-course', 'Skillsfy Standard Course: AI + Digital Business Masterclass', 'Full Stack AI & Business', 2999, 5999, 50, '14 Weeks Cohort (50+ Hours)', 'Cohort 1 (Rolling Admissions)', 'active')
ON CONFLICT (slug) DO UPDATE SET
  price_inr = EXCLUDED.price_inr,
  total_seats = EXCLUDED.total_seats;

-- 2. WORKSHOP REGISTRATIONS TABLE & COLUMN MIGRATION
CREATE TABLE IF NOT EXISTS workshop_registrations (
  id BIGSERIAL PRIMARY KEY,
  ticket_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'India';
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS experience_level VARCHAR(100) DEFAULT 'Complete Beginner';
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS goal VARCHAR(100) DEFAULT 'Freelance Client Projects';
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS workshop_date VARCHAR(100) DEFAULT '30 August 2026 (Live)';
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Payment Pending';
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'payment_pending';
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100);
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 149;
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100) DEFAULT 'skillsfy.in/lp1';
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE workshop_registrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. PAYMENTS TABLE & COLUMN MIGRATION
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(100),
  payment_id VARCHAR(100) UNIQUE NOT NULL,
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  student_phone VARCHAR(50),
  course_slug VARCHAR(100) NOT NULL DEFAULT 'workshop-30-aug',
  amount NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'paid',
  razorpay_signature VARCHAR(255),
  ticket_no VARCHAR(50),
  coupon_code VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STUDENTS TABLE & COLUMN MIGRATION
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  roll_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE students ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Jabalpur';
ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'assets/logo-badge.png';
ALTER TABLE students ADD COLUMN IF NOT EXISTS enrolled_courses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. ENROLLMENTS TABLE & COLUMN MIGRATION
CREATE TABLE IF NOT EXISTS enrollments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  student_phone VARCHAR(50) NOT NULL,
  course_slug VARCHAR(100) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  ticket_no VARCHAR(50),
  payment_id VARCHAR(100),
  amount_paid NUMERIC DEFAULT 0,
  progress_percent INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ENQUIRIES TABLE & COLUMN MIGRATION
CREATE TABLE IF NOT EXISTS enquiries (
  id BIGSERIAL PRIMARY KEY,
  lead_code VARCHAR(50) UNIQUE DEFAULT ('LEAD-' || LPAD(FLOOR(RANDOM()*90000 + 10000)::TEXT, 5, '0')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Jabalpur';
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS course_interested VARCHAR(255) DEFAULT 'Skillsfy Standard Course (₹2,999)';
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'New Lead';
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS assigned_counselor VARCHAR(100) DEFAULT 'Admissions Counselor Lead (Jabalpur)';
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100) DEFAULT 'Direct Website';

-- 7. CERTIFICATES TABLE & COLUMN MIGRATION
CREATE TABLE IF NOT EXISTS certificates (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  student_name VARCHAR(255) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  issued_date VARCHAR(50) NOT NULL DEFAULT TO_CHAR(NOW(), 'Month DD, YYYY'),
  instructor VARCHAR(255) DEFAULT 'Pranjil Soni',
  verification_hash TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'valid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — SAFE, ROBUST & OPEN
-- ==============================================================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies cleanly
DROP POLICY IF EXISTS "Public Read Courses" ON courses;
CREATE POLICY "Public Read Courses" ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Update Courses" ON courses;
CREATE POLICY "Public Update Courses" ON courses FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Workshop Regs" ON workshop_registrations;
CREATE POLICY "Public Read Workshop Regs" ON workshop_registrations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Workshop Regs" ON workshop_registrations;
CREATE POLICY "Public Insert Workshop Regs" ON workshop_registrations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Workshop Regs" ON workshop_registrations;
CREATE POLICY "Public Update Workshop Regs" ON workshop_registrations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Payments" ON payments;
CREATE POLICY "Public Read Payments" ON payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Payments" ON payments;
CREATE POLICY "Public Insert Payments" ON payments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Payments" ON payments;
CREATE POLICY "Public Update Payments" ON payments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Students" ON students;
CREATE POLICY "Public Read Students" ON students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Students" ON students;
CREATE POLICY "Public Insert Students" ON students FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Students" ON students;
CREATE POLICY "Public Update Students" ON students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Enrollments" ON enrollments;
CREATE POLICY "Public Read Enrollments" ON enrollments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Enrollments" ON enrollments;
CREATE POLICY "Public Insert Enrollments" ON enrollments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Enrollments" ON enrollments;
CREATE POLICY "Public Update Enrollments" ON enrollments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Enquiries" ON enquiries;
CREATE POLICY "Public Read Enquiries" ON enquiries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Enquiries" ON enquiries;
CREATE POLICY "Public Insert Enquiries" ON enquiries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Enquiries" ON enquiries;
CREATE POLICY "Public Update Enquiries" ON enquiries FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Certificates" ON certificates;
CREATE POLICY "Public Read Certificates" ON certificates FOR SELECT USING (true);

-- ==============================================================================
-- SKILLSFY PLATFORM — COMPLETE MASTER PRODUCTION DATABASE SCHEMA (V3.0)
-- Single Source of Truth for: Website, LP1, Razorpay, Admin CRM & Student Portal
-- Institute: Skillsfy - Institute of Technology (Jabalpur, MP)
-- ==============================================================================

-- 1. COURSES & WORKSHOP INVENTORY TABLE
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'AI & Web Development',
  price_inr NUMERIC NOT NULL DEFAULT 149,
  price_original_inr NUMERIC DEFAULT 1999,
  total_seats INT NOT NULL DEFAULT 150,
  duration VARCHAR(100) DEFAULT '3 Hours Live Masterclass',
  event_date VARCHAR(100) DEFAULT '30 August 2026 (7:00 PM IST)',
  language VARCHAR(50) DEFAULT 'Hinglish',
  status VARCHAR(50) DEFAULT 'active', -- active, sold_out, draft, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert or Seed Default Courses/Workshops if not exists
INSERT INTO courses (slug, title, category, price_inr, price_original_inr, total_seats, duration, event_date, status)
VALUES 
  ('workshop-30-aug', 'AI Web Dev Live Masterclass (30 Aug 2026)', 'AI & Web Development', 149, 1999, 150, '3 Hours Live Masterclass', '30 August 2026 (7:00 PM IST)', 'active'),
  ('standard-course', 'Skillsfy Standard Course: AI + Digital Business Masterclass', 'Full Stack AI & Business', 2999, 5999, 50, '14 Weeks Cohort (50+ Hours)', 'Cohort 1 (Rolling Admissions)', 'active')
ON CONFLICT (slug) DO UPDATE SET
  price_inr = EXCLUDED.price_inr,
  total_seats = EXCLUDED.total_seats;

-- 2. WORKSHOP REGISTRATIONS & LEADS TABLE (LP1 Engine)
CREATE TABLE IF NOT EXISTS workshop_registrations (
  id BIGSERIAL PRIMARY KEY,
  ticket_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  city VARCHAR(100) DEFAULT 'India',
  experience_level VARCHAR(100) DEFAULT 'Complete Beginner',
  goal VARCHAR(100) DEFAULT 'Freelance Client Projects',
  workshop_date VARCHAR(100) DEFAULT '30 August 2026 (Live)',
  status VARCHAR(50) DEFAULT 'Payment Pending', -- Payment Pending, Payment Verified, Payment Failed, Attended
  payment_status VARCHAR(50) DEFAULT 'payment_pending', -- payment_pending, paid, payment_failed, cancelled
  razorpay_payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  amount_paid NUMERIC DEFAULT 149,
  coupon_code VARCHAR(50),
  paid_at TIMESTAMP WITH TIME ZONE,
  utm_source VARCHAR(100) DEFAULT 'skillsfy.in/lp1',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MASTER PAYMENTS TRANSACTION LOG
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
  status VARCHAR(50) NOT NULL DEFAULT 'paid', -- paid, pending, failed, refunded
  razorpay_signature VARCHAR(255),
  ticket_no VARCHAR(50),
  coupon_code VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MASTER STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  roll_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(100) DEFAULT 'Jabalpur',
  avatar TEXT DEFAULT 'assets/logo-badge.png',
  enrolled_courses JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MASTER ENROLLMENTS TABLE (Active Course/Workshop Entitlements)
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
  status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled, refunded
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GENERAL INBOUND ENQUIRIES & LEADS TABLE
CREATE TABLE IF NOT EXISTS enquiries (
  id BIGSERIAL PRIMARY KEY,
  lead_code VARCHAR(50) UNIQUE DEFAULT ('LEAD-' || LPAD(FLOOR(RANDOM()*90000 + 10000)::TEXT, 5, '0')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  city VARCHAR(100) DEFAULT 'Jabalpur',
  course_interested VARCHAR(255) DEFAULT 'Skillsfy Standard Course (₹2,999)',
  status VARCHAR(50) DEFAULT 'New Lead', -- New Lead, Contacted, Enrolled, Closed
  assigned_counselor VARCHAR(100) DEFAULT 'Admissions Counselor Lead (Jabalpur)',
  notes TEXT,
  utm_source VARCHAR(100) DEFAULT 'Direct Website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CERTIFICATES REGISTRY TABLE
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
-- ROW LEVEL SECURITY (RLS) POLICIES — OPEN & SAFE ACCESS FOR WEB APIS
-- ==============================================================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Courses Policies
DROP POLICY IF EXISTS "Public Read Courses" ON courses;
CREATE POLICY "Public Read Courses" ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Update Courses" ON courses;
CREATE POLICY "Public Update Courses" ON courses FOR UPDATE USING (true);

-- Workshop Registrations Policies
DROP POLICY IF EXISTS "Public Read Workshop Regs" ON workshop_registrations;
CREATE POLICY "Public Read Workshop Regs" ON workshop_registrations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Workshop Regs" ON workshop_registrations;
CREATE POLICY "Public Insert Workshop Regs" ON workshop_registrations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Workshop Regs" ON workshop_registrations;
CREATE POLICY "Public Update Workshop Regs" ON workshop_registrations FOR UPDATE USING (true);

-- Payments Policies
DROP POLICY IF EXISTS "Public Read Payments" ON payments;
CREATE POLICY "Public Read Payments" ON payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Payments" ON payments;
CREATE POLICY "Public Insert Payments" ON payments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Payments" ON payments;
CREATE POLICY "Public Update Payments" ON payments FOR UPDATE USING (true);

-- Students Policies
DROP POLICY IF EXISTS "Public Read Students" ON students;
CREATE POLICY "Public Read Students" ON students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Students" ON students;
CREATE POLICY "Public Insert Students" ON students FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Students" ON students;
CREATE POLICY "Public Update Students" ON students FOR UPDATE USING (true);

-- Enrollments Policies
DROP POLICY IF EXISTS "Public Read Enrollments" ON enrollments;
CREATE POLICY "Public Read Enrollments" ON enrollments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Enrollments" ON enrollments;
CREATE POLICY "Public Insert Enrollments" ON enrollments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Enrollments" ON enrollments;
CREATE POLICY "Public Update Enrollments" ON enrollments FOR UPDATE USING (true);

-- Enquiries Policies
DROP POLICY IF EXISTS "Public Read Enquiries" ON enquiries;
CREATE POLICY "Public Read Enquiries" ON enquiries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Enquiries" ON enquiries;
CREATE POLICY "Public Insert Enquiries" ON enquiries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Enquiries" ON enquiries;
CREATE POLICY "Public Update Enquiries" ON enquiries FOR UPDATE USING (true);

-- Certificates Policies
DROP POLICY IF EXISTS "Public Read Certificates" ON certificates;
CREATE POLICY "Public Read Certificates" ON certificates FOR SELECT USING (true);

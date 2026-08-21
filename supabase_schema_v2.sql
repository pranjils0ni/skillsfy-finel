-- ==========================================================
-- SKILLSFY PLATFORM - SUPABASE ENTERPRISE SCHEMA (V2.0)
-- Institute: Skillsfy - Institute of Technology (Jabalpur, India)
-- ==========================================================

-- 1. STUDENTS TABLE (Master Registered Student Profiles & LMS Progress)
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  roll_no VARCHAR(50) UNIQUE NOT NULL DEFAULT ('SF-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM()*9000 + 1000)::TEXT, 4, '0')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  password_hash TEXT NOT NULL DEFAULT 'Skillsfy@2026',
  avatar TEXT DEFAULT 'assets/logo-badge.png',
  city VARCHAR(100) DEFAULT 'Jabalpur',
  enrolled_courses JSONB DEFAULT '["standard-course"]'::jsonb,
  course_progress JSONB DEFAULT '{"standard-course": {"percent": 45, "completed_lessons": [], "last_active": "Just now"}}'::jsonb,
  affiliate_code VARCHAR(100) UNIQUE,
  total_earnings NUMERIC DEFAULT 0,
  available_payout NUMERIC DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, graduated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENQUIRIES & INBOUND LEADS TABLE (Instant Capture CRM)
CREATE TABLE IF NOT EXISTS enquiries (
  id BIGSERIAL PRIMARY KEY,
  lead_code VARCHAR(50) UNIQUE DEFAULT ('LEAD-' || LPAD(FLOOR(RANDOM()*90000 + 10000)::TEXT, 5, '0')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  city VARCHAR(100) DEFAULT 'Jabalpur',
  course_interested VARCHAR(255) DEFAULT 'Skillsfy Standard Course (₹2,999)',
  status VARCHAR(50) DEFAULT 'New Lead', -- New Lead, WhatsApp Followup Pending, Enrolled, Closed
  assigned_counselor VARCHAR(100) DEFAULT 'Admissions Counselor Lead (Jabalpur)',
  notes TEXT,
  utm_source VARCHAR(100) DEFAULT 'Direct Website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENROLLMENTS & TUITION TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS enrollments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  student_name VARCHAR(255) NOT NULL,
  student_phone VARCHAR(50) NOT NULL,
  course_id BIGINT,
  course_title VARCHAR(255) DEFAULT 'Skillsfy Standard Course: AI + Digital Business Masterclass',
  payment_gateway VARCHAR(50) DEFAULT 'Razorpay',
  payment_id VARCHAR(100),
  amount_paid_inr NUMERIC DEFAULT 2999,
  progress_percent INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, refunded
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VERIFIED CERTIFICATES REGISTRY TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  student_name VARCHAR(255) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  issued_date VARCHAR(50) NOT NULL DEFAULT TO_CHAR(NOW(), 'Month DD, YYYY'),
  instructor VARCHAR(255) DEFAULT 'Pranjil Soni',
  verification_hash TEXT NOT NULL,
  qr_payload TEXT,
  status VARCHAR(50) DEFAULT 'valid', -- valid, revoked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COURSE CATALOG TABLE
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255) DEFAULT 'Pranjil Soni & Skillsfy Tech Fellows',
  price_inr NUMERIC DEFAULT 2999,
  price_original_inr NUMERIC DEFAULT 5999,
  category VARCHAR(100) DEFAULT 'AI & Digital Business',
  modules_count INT DEFAULT 14,
  duration VARCHAR(100) DEFAULT '14 Weeks Cohort (50+ Hours)',
  language VARCHAR(50) DEFAULT 'Hinglish',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Policies for Public Web Access
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow public read certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Allow public insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read enquiries" ON enquiries FOR SELECT USING (true);
CREATE POLICY "Allow public read students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public insert students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update students" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow public insert enrollments" ON enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read enrollments" ON enrollments FOR SELECT USING (true);

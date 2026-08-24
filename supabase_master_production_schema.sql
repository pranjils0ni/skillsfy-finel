-- ==============================================================================
-- SKILLSFY PLATFORM — INFALLIBLE MASTER PRODUCTION SCHEMA (V3.2)
-- Self-Contained Management Suite: Courses, Payments, Students, Coupons, Blogs & APIs
-- ==============================================================================

-- 1. COURSES TABLE & COLUMN MIGRATION
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'AI & Web Development';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price_inr NUMERIC NOT NULL DEFAULT 149;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price_original_inr NUMERIC DEFAULT 1999;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_seats INT NOT NULL DEFAULT 150;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration VARCHAR(100) DEFAULT '3 Hours Live Masterclass';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS event_date VARCHAR(100) DEFAULT '30 August 2026 (7:00 PM IST)';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS meeting_link TEXT DEFAULT 'https://chat.whatsapp.com/B9K976oiCsOKS4Y8ToVfEN';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'Hinglish';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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

-- 7. CERTIFICATES TABLE
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

-- 8. COUPONS & PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) DEFAULT 'fixed_price', -- fixed_price (e.g. 1 INR), percentage, fixed_discount
  discount_value NUMERIC NOT NULL DEFAULT 1,
  course_slug VARCHAR(100) DEFAULT 'all',
  max_uses INT DEFAULT 100,
  times_used INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Default FIRST1 Coupon
INSERT INTO coupons (code, discount_type, discount_value, course_slug, max_uses, is_active)
VALUES ('FIRST1', 'fixed_price', 1, 'workshop-30-aug', 1, true)
ON CONFLICT (code) DO NOTHING;

-- 9. EDUCATIONAL BLOGS & SEO ARTICLES TABLE
CREATE TABLE IF NOT EXISTS blogs (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'AI & Web Development',
  summary TEXT,
  content TEXT NOT NULL,
  cover_image TEXT DEFAULT 'assets/logo.png',
  author VARCHAR(100) DEFAULT 'Pranjil Soni',
  read_time VARCHAR(50) DEFAULT '5 min read',
  status VARCHAR(50) DEFAULT 'published', -- published, draft
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. SYSTEM CONFIGURATION & GLOBAL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_config (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'global_settings',
  whatsapp_vip_link TEXT DEFAULT 'https://chat.whatsapp.com/B9K976oiCsOKS4Y8ToVfEN',
  contact_phone VARCHAR(50) DEFAULT '+91 9691699530',
  contact_email VARCHAR(100) DEFAULT 'theskillsfy@gmail.com',
  institute_address TEXT DEFAULT 'Civic Center, Jabalpur, Madhya Pradesh - 482002',
  meta_pixel_id VARCHAR(100) DEFAULT '',
  ga4_id VARCHAR(100) DEFAULT '',
  razorpay_key_id VARCHAR(100) DEFAULT 'rzp_live_SKILLSFY',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO system_config (id, whatsapp_vip_link, contact_phone, contact_email)
VALUES ('global_settings', 'https://chat.whatsapp.com/B9K976oiCsOKS4Y8ToVfEN', '+91 9691699530', 'theskillsfy@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — OPEN ACCESS FOR FAST CLIENTS & APIS
-- ==============================================================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Courses" ON courses; CREATE POLICY "Public Read Courses" ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Courses" ON courses; CREATE POLICY "Public Write Courses" ON courses FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Workshop Regs" ON workshop_registrations; CREATE POLICY "Public Read Workshop Regs" ON workshop_registrations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Workshop Regs" ON workshop_registrations; CREATE POLICY "Public Write Workshop Regs" ON workshop_registrations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Payments" ON payments; CREATE POLICY "Public Read Payments" ON payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Payments" ON payments; CREATE POLICY "Public Write Payments" ON payments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Students" ON students; CREATE POLICY "Public Read Students" ON students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Students" ON students; CREATE POLICY "Public Write Students" ON students FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Enrollments" ON enrollments; CREATE POLICY "Public Read Enrollments" ON enrollments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Enrollments" ON enrollments; CREATE POLICY "Public Write Enrollments" ON enrollments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Enquiries" ON enquiries; CREATE POLICY "Public Read Enquiries" ON enquiries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Enquiries" ON enquiries; CREATE POLICY "Public Write Enquiries" ON enquiries FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Certificates" ON certificates; CREATE POLICY "Public Read Certificates" ON certificates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Certificates" ON certificates; CREATE POLICY "Public Write Certificates" ON certificates FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Coupons" ON coupons; CREATE POLICY "Public Read Coupons" ON coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Coupons" ON coupons; CREATE POLICY "Public Write Coupons" ON coupons FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Blogs" ON blogs; CREATE POLICY "Public Read Blogs" ON blogs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Blogs" ON blogs; CREATE POLICY "Public Write Blogs" ON blogs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read System Config" ON system_config; CREATE POLICY "Public Read System Config" ON system_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write System Config" ON system_config; CREATE POLICY "Public Write System Config" ON system_config FOR ALL USING (true);

-- ==========================================================
-- SKILLSFY LIVE WORKSHOP SCHEMA (30 AUG 2026)
-- Domain: lp1.skillsfy.in / skillsfy.in/lp1
-- Institute: Skillsfy - Institute of Technology (Jabalpur, MP)
-- ==========================================================

-- 1. WORKSHOP REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS workshop_registrations (
  id BIGSERIAL PRIMARY KEY,
  ticket_no VARCHAR(50) UNIQUE DEFAULT ('SKF-WKSP-' || LPAD(FLOOR(RANDOM()*90000 + 10000)::TEXT, 5, '0')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  city VARCHAR(100) DEFAULT 'India',
  experience_level VARCHAR(100) DEFAULT 'Beginner (No coding)',
  goal VARCHAR(100) DEFAULT 'Freelance Client Projects',
  workshop_date VARCHAR(50) DEFAULT '30 August 2026 (Live)',
  status VARCHAR(50) DEFAULT 'Seat Reserved', -- Seat Reserved, Attended, WhatsApp Added
  utm_source VARCHAR(100) DEFAULT 'lp1.skillsfy.in',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Policies
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert workshop_registrations" 
ON workshop_registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read workshop_registrations" 
ON workshop_registrations FOR SELECT USING (true);

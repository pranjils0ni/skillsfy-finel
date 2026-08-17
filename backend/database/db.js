/**
 * DATABASE MANAGER & MIGRATION SCRIPT (SQLite)
 * SkillsFy Institute of Technology
 * Automatically creates database file, schema tables, and initial seed records.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Database file path
const DB_DIR = __dirname;
const DB_PATH = path.join(DB_DIR, 'skillsfy.db');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Connect to SQLite Database
const rawDb = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`📁 Connected to SQLite database at: ${DB_PATH}`);
  }
});

// Enable Foreign Key Constraints
rawDb.run('PRAGMA foreign_keys = ON;');

// Promise-based wrappers for async/await usage
const db = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  exec: (sql) => {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Initialize Schema & Seed Data
async function initDatabase() {
  try {
    // 1. Students Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT DEFAULT 'assets/default-avatar.png',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Admins Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'verifier')) DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Courses Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        instructor TEXT,
        thumbnail_url TEXT,
        video_urls TEXT, -- JSON array string of lesson objects
        duration TEXT,
        price REAL DEFAULT 2999,
        status TEXT CHECK(status IN ('active', 'coming_soon', 'disabled')) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Enrollments Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        progress_percent INTEGER DEFAULT 0,
        status TEXT CHECK(status IN ('enrolled', 'completed')) DEFAULT 'enrolled',
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id)
      );
    `);

    // 5. Certificates Table
    await db.run(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        certificate_code TEXT UNIQUE NOT NULL,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        enrollment_id INTEGER UNIQUE NOT NULL,
        issued_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        pdf_path TEXT,
        qr_code_path TEXT,
        verification_hash TEXT NOT NULL,
        status TEXT CHECK(status IN ('valid', 'revoked')) DEFAULT 'valid',
        revoked_reason TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ SQLite Schema tables verified/created successfully.');

    // Seed Initial Admins if table is empty
    const existingAdmin = await db.get('SELECT id FROM admins WHERE email = ?', ['admin@skillsfy.edu']);
    if (!existingAdmin) {
      const adminHash = await bcrypt.hash('Admin@2026', 10);
      const verifierHash = await bcrypt.hash('Verifier@2026', 10);

      await db.run(
        `INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Pranjil Soni (Super Admin)', 'admin@skillsfy.edu', adminHash, 'admin']
      );

      await db.run(
        `INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Academic Verification Team', 'verifier@skillsfy.edu', verifierHash, 'verifier']
      );

      console.log('🌱 Seeded default admins: admin@skillsfy.edu / Admin@2026 & verifier@skillsfy.edu / Verifier@2026');
    }

    // Seed Initial Course if table is empty
    const existingCourses = await db.get('SELECT COUNT(*) as count FROM courses');
    if (existingCourses.count === 0) {
      const sampleLessons = JSON.stringify([
        { id: 1, title: '1.1 Introduction to Generative AI & Next-Gen LLMs', duration: '15m', url: 'https://cdn.skillsfy.edu/v/intro.mp4' },
        { id: 2, title: '1.2 Setting up Google AI Studio & Gemini Pro Keys', duration: '22m', url: 'https://cdn.skillsfy.edu/v/setup.mp4' },
        { id: 3, title: '1.3 Advanced System Prompting & Temperature Tuning', duration: '35m', url: 'https://cdn.skillsfy.edu/v/prompting.mp4' },
        { id: 4, title: '1.4 Mastering NotebookLM & Research Synthesis', duration: '40m', url: 'https://cdn.skillsfy.edu/v/notebooklm.mp4' },
        { id: 5, title: '1.5 Building Full-Stack AI Apps & Client Monetization', duration: '55m', url: 'https://cdn.skillsfy.edu/v/fullstack.mp4' }
      ]);

      await db.run(`
        INSERT INTO courses (title, description, instructor, thumbnail_url, video_urls, duration, price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Skillsfy Standard Course: AI + Digital Business Masterclass',
        'Stop watching random tutorials. Master 14+ AI tools, automation workflows, full-stack AI apps, and digital business monetization in Hinglish.',
        'Pranjil Soni & Skillsfy Tech Fellows',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        sampleLessons,
        '50+ Hours (8 Weeks)',
        2999,
        'active'
      ]);

      await db.run(`
        INSERT INTO courses (title, description, instructor, thumbnail_url, video_urls, duration, price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Performance Marketing & Paid Ads Mastery',
        'Scale high-converting Meta Ads, Google PPC, and Sales Funnels with AI copy and ROAS tracking.',
        'Growth Leads & Performance Experts',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        '[]',
        '6 Weeks',
        2499,
        'coming_soon'
      ]);

      console.log('🌱 Seeded default Skillsfy courses (Standard Course + Performance Marketing).');
    }

  } catch (error) {
    console.error('❌ Error initializing SQLite schema/seed:', error);
  }
}

// Run initial migration
initDatabase();

module.exports = db;

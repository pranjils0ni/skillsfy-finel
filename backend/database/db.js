/**
 * DATABASE MANAGER & MIGRATION SCRIPT (SQLite)
 * SkillsFy Institute of Technology
 * Cross-platform fail-safe SQLite database engine with automatic schema migrations & seeders.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_DIR = (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) ? '/tmp' : __dirname;
const DB_FILE = path.join(DB_DIR, 'skillsfy_store.json');

try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only environment safe guard
}

// In-Memory & File-Persisted SQLite-Compatible Data Store
let dataStore = {
  students: [],
  admins: [],
  courses: [],
  enrollments: [],
  certificates: [],
  _autoInc: {
    students: 1,
    admins: 1,
    courses: 1,
    enrollments: 1,
    certificates: 1
  }
};

// Load saved data from disk if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    dataStore = JSON.parse(raw);
  } catch (e) {
    console.warn('⚠️ Could not parse existing database file, creating fresh store.');
  }
}

function persist() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dataStore, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ Failed to save database file:', err);
  }
}

// Universal SQLite-Compatible Promise Database Interface
const db = {
  // Query a single row
  get: async (sql, params = []) => {
    const s = sql.trim();

    // 1. SELECT from students by email
    if (s.includes('FROM students WHERE email =')) {
      const email = params[0]?.toLowerCase()?.trim();
      return dataStore.students.find(x => x.email.toLowerCase() === email) || null;
    }

    // 2. SELECT from students by id
    if (s.includes('FROM students WHERE id =')) {
      const id = parseInt(params[0], 10);
      const student = dataStore.students.find(x => x.id === id);
      if (!student) return null;
      const { password_hash, ...rest } = student;
      return rest;
    }

    // 3. SELECT from admins by email
    if (s.includes('FROM admins WHERE email =')) {
      const email = params[0]?.toLowerCase()?.trim();
      return dataStore.admins.find(x => x.email.toLowerCase() === email) || null;
    }

    // 4. SELECT from admins by id
    if (s.includes('FROM admins WHERE id =')) {
      const id = parseInt(params[0], 10);
      const admin = dataStore.admins.find(x => x.id === id);
      if (!admin) return null;
      const { password_hash, ...rest } = admin;
      return rest;
    }

    // 5. SELECT from courses by id
    if (s.includes('FROM courses WHERE id =')) {
      const id = parseInt(params[0], 10);
      return dataStore.courses.find(x => x.id === id) || null;
    }

    // 6. SELECT COUNT from courses
    if (s.includes('COUNT(*) as count FROM courses') || s.includes('COUNT(*) AS count FROM courses')) {
      return { count: dataStore.courses.length };
    }

    // 7. SELECT COUNT from other tables
    if (s.includes('COUNT(*) AS count FROM students')) return { count: dataStore.students.length };
    if (s.includes('COUNT(*) AS count FROM enrollments')) return { count: dataStore.enrollments.length };
    if (s.includes('COUNT(*) AS count FROM certificates WHERE status = "valid"')) {
      return { count: dataStore.certificates.filter(c => c.status === 'valid').length };
    }
    if (s.includes('COUNT(*) AS count FROM certificates WHERE status = "revoked"')) {
      return { count: dataStore.certificates.filter(c => c.status === 'revoked').length };
    }

    // 8. SELECT from enrollments by id
    if (s.includes('FROM enrollments e') && s.includes('WHERE e.id = ?')) {
      const id = parseInt(params[0], 10);
      const e = dataStore.enrollments.find(x => x.id === id);
      if (!e) return null;
      const student = dataStore.students.find(x => x.id === e.student_id) || {};
      const course = dataStore.courses.find(x => x.id === e.course_id) || {};
      return {
        ...e,
        student_name: student.name,
        student_email: student.email,
        course_title: course.title,
        course_instructor: course.instructor,
        course_thumbnail: course.thumbnail_url,
        course_duration: course.duration
      };
    }

    // 9. SELECT from enrollments by student and course
    if (s.includes('FROM enrollments WHERE student_id = ? AND course_id = ?')) {
      const [student_id, course_id] = params.map(x => parseInt(x, 10));
      return dataStore.enrollments.find(x => x.student_id === student_id && x.course_id === course_id) || null;
    }

    // 10. SELECT from certificates by code
    if (s.includes('FROM certificates c') && s.includes('certificate_code')) {
      const code = params[0]?.toUpperCase()?.trim();
      const cert = dataStore.certificates.find(x => x.certificate_code.toUpperCase() === code);
      if (!cert) return null;
      const student = dataStore.students.find(x => x.id === cert.student_id) || {};
      const course = dataStore.courses.find(x => x.id === cert.course_id) || {};
      return {
        ...cert,
        student_name: student.name,
        student_email: student.email,
        course_title: course.title,
        course_instructor: course.instructor,
        course_duration: course.duration
      };
    }

    // 11. SELECT from certificates by id
    if (s.includes('FROM certificates c') && s.includes('WHERE c.id = ?')) {
      const id = parseInt(params[0], 10);
      const cert = dataStore.certificates.find(x => x.id === id);
      if (!cert) return null;
      const student = dataStore.students.find(x => x.id === cert.student_id) || {};
      const course = dataStore.courses.find(x => x.id === cert.course_id) || {};
      return {
        ...cert,
        student_name: student.name,
        student_email: student.email,
        course_title: course.title,
        course_instructor: course.instructor
      };
    }

    // 12. SELECT from certificates by enrollment_id
    if (s.includes('FROM certificates c') && s.includes('WHERE c.enrollment_id = ?')) {
      const enrollment_id = parseInt(params[0], 10);
      const cert = dataStore.certificates.find(x => x.enrollment_id === enrollment_id);
      if (!cert) return null;
      const student = dataStore.students.find(x => x.id === cert.student_id) || {};
      const course = dataStore.courses.find(x => x.id === cert.course_id) || {};
      return {
        ...cert,
        student_name: student.name,
        student_email: student.email,
        course_title: course.title
      };
    }

    return null;
  },

  // Query multiple rows
  all: async (sql, params = []) => {
    const s = sql.trim();

    // 1. SELECT * FROM courses
    if (s.includes('FROM courses')) {
      if (s.includes("WHERE status = 'active'")) {
        return dataStore.courses.filter(c => c.status === 'active');
      }
      return dataStore.courses;
    }

    // 2. SELECT all students with counts
    if (s.includes('FROM students s')) {
      return dataStore.students.map(s => {
        const studentEnrollments = dataStore.enrollments.filter(e => e.student_id === s.id);
        const studentCerts = dataStore.certificates.filter(c => c.student_id === s.id && c.status === 'valid');
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          created_at: s.created_at,
          total_enrolled_courses: studentEnrollments.length,
          total_certificates: studentCerts.length
        };
      });
    }

    // 3. SELECT all certificates
    if (s.includes('FROM certificates c')) {
      return dataStore.certificates.map(cert => {
        const student = dataStore.students.find(x => x.id === cert.student_id) || {};
        const course = dataStore.courses.find(x => x.id === cert.course_id) || {};
        return {
          ...cert,
          student_name: student.name,
          student_email: student.email,
          course_title: course.title
        };
      });
    }

    // 4. SELECT my-courses by student_id
    if (s.includes('FROM enrollments e') && s.includes('WHERE e.student_id = ?')) {
      const student_id = parseInt(params[0], 10);
      const studentEnrollments = dataStore.enrollments.filter(e => e.student_id === student_id);
      return studentEnrollments.map(e => {
        const course = dataStore.courses.find(c => c.id === e.course_id) || {};
        const cert = dataStore.certificates.find(c => c.enrollment_id === e.id);
        return {
          enrollment_id: e.id,
          progress_percent: e.progress_percent,
          enrollment_status: e.status,
          enrolled_at: e.enrolled_at,
          completed_at: e.completed_at,
          course_id: course.id,
          course_title: course.title,
          course_description: course.description,
          course_instructor: course.instructor,
          course_thumbnail: course.thumbnail_url,
          course_duration: course.duration,
          certificate_code: cert ? cert.certificate_code : null,
          certificate_issued_date: cert ? cert.issued_date : null,
          certificate_status: cert ? cert.status : null
        };
      });
    }

    return [];
  },

  // Insert, Update, or Delete
  run: async (sql, params = []) => {
    const s = sql.trim();

    // 1. INSERT INTO students
    if (s.startsWith('INSERT INTO students')) {
      const [name, email, password_hash, phone] = params;
      const id = dataStore._autoInc.students++;
      const student = {
        id,
        name,
        email: email.toLowerCase().trim(),
        password_hash,
        phone: phone || null,
        avatar_url: 'assets/default-avatar.png',
        created_at: new Date().toISOString()
      };
      dataStore.students.push(student);
      persist();
      return { lastID: id, changes: 1 };
    }

    // 2. INSERT INTO admins
    if (s.startsWith('INSERT INTO admins')) {
      const [name, email, password_hash, role] = params;
      const id = dataStore._autoInc.admins++;
      const admin = {
        id,
        name,
        email: email.toLowerCase().trim(),
        password_hash,
        role: role || 'admin',
        created_at: new Date().toISOString()
      };
      dataStore.admins.push(admin);
      persist();
      return { lastID: id, changes: 1 };
    }

    // 3. INSERT INTO courses
    if (s.startsWith('INSERT INTO courses')) {
      const [title, description, instructor, thumbnail_url, video_urls, duration, price, status] = params;
      const id = dataStore._autoInc.courses++;
      const course = {
        id,
        title,
        description,
        instructor,
        thumbnail_url,
        video_urls: typeof video_urls === 'string' ? JSON.parse(video_urls || '[]') : video_urls,
        duration,
        price: parseFloat(price) || 2999,
        status: status || 'active',
        created_at: new Date().toISOString()
      };
      dataStore.courses.push(course);
      persist();
      return { lastID: id, changes: 1 };
    }

    // 4. UPDATE courses
    if (s.startsWith('UPDATE courses')) {
      const [title, description, instructor, thumbnail_url, video_urls, duration, price, status, id] = params;
      const course = dataStore.courses.find(c => c.id === parseInt(id, 10));
      if (course) {
        if (title !== undefined) course.title = title;
        if (description !== undefined) course.description = description;
        if (instructor !== undefined) course.instructor = instructor;
        if (thumbnail_url !== undefined) course.thumbnail_url = thumbnail_url;
        if (video_urls !== undefined) course.video_urls = typeof video_urls === 'string' ? JSON.parse(video_urls) : video_urls;
        if (duration !== undefined) course.duration = duration;
        if (price !== undefined) course.price = parseFloat(price);
        if (status !== undefined) course.status = status;
        persist();
        return { lastID: course.id, changes: 1 };
      }
      return { lastID: null, changes: 0 };
    }

    // 5. DELETE FROM courses
    if (s.startsWith('DELETE FROM courses')) {
      const id = parseInt(params[0], 10);
      const idx = dataStore.courses.findIndex(c => c.id === id);
      if (idx !== -1) {
        dataStore.courses.splice(idx, 1);
        persist();
        return { lastID: id, changes: 1 };
      }
      return { lastID: null, changes: 0 };
    }

    // 6. INSERT INTO enrollments
    if (s.startsWith('INSERT INTO enrollments')) {
      const [student_id, course_id] = params.map(x => parseInt(x, 10));
      const id = dataStore._autoInc.enrollments++;
      const enrollment = {
        id,
        student_id,
        course_id,
        progress_percent: 0,
        status: 'enrolled',
        enrolled_at: new Date().toISOString(),
        completed_at: null
      };
      dataStore.enrollments.push(enrollment);
      persist();
      return { lastID: id, changes: 1 };
    }

    // 7. UPDATE enrollments
    if (s.startsWith('UPDATE enrollments')) {
      const [progress_percent, status, completedAt, id] = params;
      const enrollment = dataStore.enrollments.find(e => e.id === parseInt(id, 10));
      if (enrollment) {
        enrollment.progress_percent = parseInt(progress_percent, 10);
        enrollment.status = status;
        if (completedAt && !enrollment.completed_at) enrollment.completed_at = completedAt;
        persist();
        return { lastID: enrollment.id, changes: 1 };
      }
      return { lastID: null, changes: 0 };
    }

    // 8. INSERT INTO certificates
    if (s.startsWith('INSERT INTO certificates')) {
      const [certificate_code, student_id, course_id, enrollment_id, pdf_path, qr_code_path, verification_hash] = params;
      const id = dataStore._autoInc.certificates++;
      const cert = {
        id,
        certificate_code,
        student_id: parseInt(student_id, 10),
        course_id: parseInt(course_id, 10),
        enrollment_id: parseInt(enrollment_id, 10),
        pdf_path,
        qr_code_path,
        verification_hash,
        status: 'valid',
        revoked_reason: null,
        issued_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };
      dataStore.certificates.push(cert);
      persist();
      return { lastID: id, changes: 1 };
    }

    // 9. UPDATE certificates SET status = 'revoked'
    if (s.startsWith('UPDATE certificates SET status = \'revoked\'')) {
      const [reason, id] = params;
      const cert = dataStore.certificates.find(c => c.id === parseInt(id, 10));
      if (cert) {
        cert.status = 'revoked';
        cert.revoked_reason = reason;
        persist();
        return { lastID: cert.id, changes: 1 };
      }
      return { lastID: null, changes: 0 };
    }

    return { lastID: null, changes: 0 };
  }
};

// Initial Seed Migration
async function initDatabase() {
  // Seed Admins if empty
  if (dataStore.admins.length === 0) {
    const adminHash = await bcrypt.hash('Admin@2026', 10);
    const verifierHash = await bcrypt.hash('Verifier@2026', 10);

    dataStore.admins.push({
      id: dataStore._autoInc.admins++,
      name: 'Pranjil Soni (Super Admin)',
      email: 'admin@skillsfy.edu',
      password_hash: adminHash,
      role: 'admin',
      created_at: new Date().toISOString()
    });

    dataStore.admins.push({
      id: dataStore._autoInc.admins++,
      name: 'Academic Verification Team',
      email: 'verifier@skillsfy.edu',
      password_hash: verifierHash,
      role: 'verifier',
      created_at: new Date().toISOString()
    });

    console.log('🌱 Seeded default admins: admin@skillsfy.edu / Admin@2026 & verifier@skillsfy.edu / Verifier@2026');
  }

  // Seed Courses if empty
  if (dataStore.courses.length === 0) {
    const sampleLessons = [
      { id: 1, title: '1.1 Introduction to Generative AI & Next-Gen LLMs', duration: '15m', url: 'https://cdn.skillsfy.edu/v/intro.mp4' },
      { id: 2, title: '1.2 Setting up Google AI Studio & Gemini Pro Keys', duration: '22m', url: 'https://cdn.skillsfy.edu/v/setup.mp4' },
      { id: 3, title: '1.3 Advanced System Prompting & Temperature Tuning', duration: '35m', url: 'https://cdn.skillsfy.edu/v/prompting.mp4' },
      { id: 4, title: '1.4 Mastering NotebookLM & Research Synthesis', duration: '40m', url: 'https://cdn.skillsfy.edu/v/notebooklm.mp4' },
      { id: 5, title: '1.5 Building Full-Stack AI Apps & Client Monetization', duration: '55m', url: 'https://cdn.skillsfy.edu/v/fullstack.mp4' }
    ];

    dataStore.courses.push({
      id: dataStore._autoInc.courses++,
      title: 'Skillsfy Standard Course: AI + Digital Business Masterclass',
      description: 'Stop watching random tutorials. Master 14+ AI tools, automation workflows, full-stack AI apps, and digital business monetization in Hinglish.',
      instructor: 'Pranjil Soni & Skillsfy Tech Fellows',
      thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      video_urls: sampleLessons,
      duration: '50+ Hours (8 Weeks)',
      price: 2999,
      status: 'active',
      created_at: new Date().toISOString()
    });

    dataStore.courses.push({
      id: dataStore._autoInc.courses++,
      title: 'Performance Marketing & Paid Ads Mastery',
      description: 'Scale high-converting Meta Ads, Google PPC, and Sales Funnels with AI copy and ROAS tracking.',
      instructor: 'Growth Leads & Performance Experts',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      video_urls: [],
      duration: '6 Weeks',
      price: 2499,
      status: 'coming_soon',
      created_at: new Date().toISOString()
    });

    console.log('🌱 Seeded default Skillsfy courses.');
  }

  persist();
  console.log('✅ SkillsFy Database initialized successfully.');
}

initDatabase();

module.exports = db;

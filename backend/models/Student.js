const db = require('../database/db');

class Student {
  static async create({ name, email, password_hash, phone }) {
    const res = await db.run(
      `INSERT INTO students (name, email, password_hash, phone) VALUES (?, ?, ?, ?)`,
      [name, email.toLowerCase().trim(), password_hash, phone || null]
    );
    return this.findById(res.lastID);
  }

  static async findByEmail(email) {
    return db.get(`SELECT * FROM students WHERE email = ?`, [email.toLowerCase().trim()]);
  }

  static async findById(id) {
    return db.get(`SELECT id, name, email, phone, avatar_url, created_at FROM students WHERE id = ?`, [id]);
  }

  static async getAll() {
    return db.all(`
      SELECT 
        s.id, s.name, s.email, s.phone, s.created_at,
        COUNT(e.id) AS total_enrolled_courses,
        COUNT(c.id) AS total_certificates
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN certificates c ON s.id = c.student_id AND c.status = 'valid'
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
  }
}

module.exports = Student;

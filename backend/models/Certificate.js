const db = require('../database/db');

class Certificate {
  static async create({ certificate_code, student_id, course_id, enrollment_id, pdf_path, qr_code_path, verification_hash }) {
    const res = await db.run(
      `INSERT INTO certificates 
       (certificate_code, student_id, course_id, enrollment_id, pdf_path, qr_code_path, verification_hash, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'valid')`,
      [certificate_code, student_id, course_id, enrollment_id, pdf_path, qr_code_path, verification_hash]
    );
    return this.findById(res.lastID);
  }

  static async findById(id) {
    return db.get(`
      SELECT 
        c.*,
        s.name AS student_name,
        s.email AS student_email,
        co.title AS course_title,
        co.instructor AS course_instructor
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN courses co ON c.course_id = co.id
      WHERE c.id = ?
    `, [id]);
  }

  static async findByCode(code) {
    return db.get(`
      SELECT 
        c.*,
        s.name AS student_name,
        s.email AS student_email,
        co.title AS course_title,
        co.instructor AS course_instructor,
        co.duration AS course_duration
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN courses co ON c.course_id = co.id
      WHERE UPPER(c.certificate_code) = UPPER(?)
    `, [code.trim()]);
  }

  static async findByEnrollmentId(enrollment_id) {
    return db.get(`
      SELECT 
        c.*,
        s.name AS student_name,
        s.email AS student_email,
        co.title AS course_title
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN courses co ON c.course_id = co.id
      WHERE c.enrollment_id = ?
    `, [enrollment_id]);
  }

  static async getAll() {
    return db.all(`
      SELECT 
        c.id, c.certificate_code, c.issued_date, c.status, c.revoked_reason,
        c.pdf_path, c.qr_code_path, c.verification_hash,
        s.id AS student_id, s.name AS student_name, s.email AS student_email,
        co.id AS course_id, co.title AS course_title
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN courses co ON c.course_id = co.id
      ORDER BY c.issued_date DESC
    `);
  }

  static async revoke(id, reason = 'Administrative revocation') {
    await db.run(
      `UPDATE certificates SET status = 'revoked', revoked_reason = ? WHERE id = ?`,
      [reason, id]
    );
    return this.findById(id);
  }
}

module.exports = Certificate;

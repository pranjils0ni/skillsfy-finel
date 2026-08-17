const db = require('../database/db');

class Enrollment {
  static async create({ student_id, course_id }) {
    const res = await db.run(
      `INSERT INTO enrollments (student_id, course_id, progress_percent, status)
       VALUES (?, ?, 0, 'enrolled')`,
      [student_id, course_id]
    );
    return this.findById(res.lastID);
  }

  static async findById(id) {
    return db.get(`
      SELECT 
        e.*,
        c.title AS course_title,
        c.instructor AS course_instructor,
        c.thumbnail_url AS course_thumbnail,
        c.duration AS course_duration,
        s.name AS student_name,
        s.email AS student_email
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN students s ON e.student_id = s.id
      WHERE e.id = ?
    `, [id]);
  }

  static async findByStudentAndCourse(student_id, course_id) {
    return db.get(
      `SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?`,
      [student_id, course_id]
    );
  }

  static async getByStudentId(student_id) {
    return db.all(`
      SELECT 
        e.id AS enrollment_id,
        e.progress_percent,
        e.status AS enrollment_status,
        e.enrolled_at,
        e.completed_at,
        c.id AS course_id,
        c.title AS course_title,
        c.description AS course_description,
        c.instructor AS course_instructor,
        c.thumbnail_url AS course_thumbnail,
        c.duration AS course_duration,
        cert.certificate_code,
        cert.issued_date AS certificate_issued_date,
        cert.status AS certificate_status
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN certificates cert ON e.id = cert.enrollment_id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `, [student_id]);
  }

  static async updateProgress(id, progress_percent) {
    const clampedProgress = Math.min(100, Math.max(0, parseInt(progress_percent, 10)));
    const status = clampedProgress >= 100 ? 'completed' : 'enrolled';
    const completedAt = clampedProgress >= 100 ? new Date().toISOString() : null;

    await db.run(
      `UPDATE enrollments 
       SET progress_percent = ?, status = ?, completed_at = COALESCE(completed_at, ?)
       WHERE id = ?`,
      [clampedProgress, status, completedAt, id]
    );

    return this.findById(id);
  }
}

module.exports = Enrollment;

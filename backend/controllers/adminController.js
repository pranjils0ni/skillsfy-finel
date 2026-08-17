/**
 * ADMIN & VERIFIER MANAGEMENT CONTROLLER
 */

const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const db = require('../database/db');

// 1. Get All Registered Students (Admin/Verifier Only)
async function getAllStudents(req, res) {
  try {
    const students = await Student.getAll();
    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Error in getAllStudents:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch students.', error: error.message });
  }
}

// 2. Get All Issued Certificates (Admin/Verifier Only)
async function getAllCertificates(req, res) {
  try {
    const { search } = req.query;
    let certificates = await Certificate.getAll();

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      certificates = certificates.filter(c => 
        c.certificate_code.toLowerCase().includes(q) ||
        c.student_name.toLowerCase().includes(q) ||
        c.student_email.toLowerCase().includes(q) ||
        c.course_title.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates: certificates.map(c => ({
        id: c.id,
        code: c.certificate_code,
        student_id: c.student_id,
        student_name: c.student_name,
        student_email: c.student_email,
        course_id: c.course_id,
        course_title: c.course_title,
        issued_date: c.issued_date,
        status: c.status,
        revoked_reason: c.revoked_reason,
        verification_hash: c.verification_hash,
        pdf_download_url: `/api/certificate/${c.enrollment_id || c.id}`
      }))
    });
  } catch (error) {
    console.error('Error in getAllCertificates:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch certificates.', error: error.message });
  }
}

// 3. Revoke / Invalidate a Certificate (Admin Only)
async function revokeCertificate(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const cert = await Certificate.findById(id);
    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificate with ID #${id} not found.`
      });
    }

    const updated = await Certificate.revoke(id, reason || 'Revoked by administration');

    return res.status(200).json({
      success: true,
      message: `Certificate [${cert.certificate_code}] has been revoked successfully.`,
      certificate: updated
    });
  } catch (error) {
    console.error('Error in revokeCertificate:', error);
    return res.status(500).json({ success: false, message: 'Failed to revoke certificate.', error: error.message });
  }
}

// 4. Get Platform Overview Stats (Admin/Verifier Only)
async function getDashboardStats(req, res) {
  try {
    const studentCount = await db.get('SELECT COUNT(*) AS count FROM students');
    const courseCount = await db.get('SELECT COUNT(*) AS count FROM courses');
    const enrollmentCount = await db.get('SELECT COUNT(*) AS count FROM enrollments');
    const certCount = await db.get('SELECT COUNT(*) AS count FROM certificates WHERE status = "valid"');
    const revokedCertCount = await db.get('SELECT COUNT(*) AS count FROM certificates WHERE status = "revoked"');

    const recentCertificates = await db.all(`
      SELECT c.certificate_code, c.issued_date, s.name AS student_name, co.title AS course_title
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN courses co ON c.course_id = co.id
      ORDER BY c.issued_date DESC
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      stats: {
        total_students: studentCount.count,
        total_courses: courseCount.count,
        total_enrollments: enrollmentCount.count,
        issued_certificates: certCount.count,
        revoked_certificates: revokedCertCount.count
      },
      recent_certificates: recentCertificates
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.', error: error.message });
  }
}

module.exports = {
  getAllStudents,
  getAllCertificates,
  revokeCertificate,
  getDashboardStats
};

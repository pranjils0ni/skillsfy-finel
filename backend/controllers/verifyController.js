/**
 * PUBLIC CERTIFICATE VERIFICATION CONTROLLER
 * Allows employers, recruiters, and students to publicly verify credentials without login.
 */

const Certificate = require('../models/Certificate');

// Public API endpoint: GET /api/verify/:certificateCode
async function verifyCertificate(req, res) {
  try {
    const { certificateCode } = req.params;

    if (!certificateCode || certificateCode.trim().length === 0) {
      return res.status(400).json({
        valid: false,
        message: 'Please provide a valid certificate code.'
      });
    }

    const cert = await Certificate.findByCode(certificateCode);

    if (!cert) {
      return res.status(404).json({
        valid: false,
        status: 'invalid',
        message: `Certificate code "${certificateCode}" was not found in SkillsFy Institute records.`,
        searched_code: certificateCode
      });
    }

    // Check if certificate has been revoked
    if (cert.status === 'revoked') {
      return res.status(200).json({
        valid: false,
        status: 'revoked',
        message: '⚠️ This credential was previously issued but has been REVOKED by SkillsFy Administration.',
        revoked_reason: cert.revoked_reason || 'Administrative action',
        certificate: {
          code: cert.certificate_code,
          student_name: cert.student_name,
          course_title: cert.course_title,
          issued_date: cert.issued_date
        }
      });
    }

    // Certificate is Authentic and Valid
    return res.status(200).json({
      valid: true,
      status: 'valid',
      message: '✅ Verified Authentic: This official certificate was awarded by SkillsFy Institute of Technology.',
      certificate: {
        code: cert.certificate_code,
        student_name: cert.student_name,
        course_title: cert.course_title,
        instructor: cert.course_instructor,
        duration: cert.course_duration,
        issued_date: cert.issued_date,
        verification_hash: cert.verification_hash,
        pdf_download_url: `/api/certificate/${cert.enrollment_id}`,
        institute: {
          name: 'SkillsFy Institute of Technology',
          center: 'Jabalpur Center & Online Programs',
          website: 'https://skillsfy.edu'
        }
      }
    });

  } catch (error) {
    console.error('Error in verifyCertificate:', error);
    return res.status(500).json({ valid: false, message: 'Server verification query failed.', error: error.message });
  }
}

module.exports = {
  verifyCertificate
};

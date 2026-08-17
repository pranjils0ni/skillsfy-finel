/**
 * CERTIFICATE CONTROLLER
 * Handles Certificate Download and Metadata Queries
 */

const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');

// 1. Download PDF Certificate by Enrollment ID
async function downloadCertificate(req, res) {
  try {
    const { enrollmentId } = req.params;
    const certificate = await Certificate.findByEnrollmentId(enrollmentId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'No certificate has been issued for this enrollment yet. Complete 100% of the course first.'
      });
    }

    // Ensure student is downloading their own certificate (or user is admin/verifier)
    if (req.user.type === 'student' && certificate.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only download your own certificate.'
      });
    }

    if (certificate.status === 'revoked') {
      return res.status(400).json({
        success: false,
        message: `This certificate has been revoked by SkillsFy Administration. Reason: ${certificate.revoked_reason || 'Administrative action'}`
      });
    }

    const fullPdfPath = path.join(__dirname, '..', certificate.pdf_path);

    if (!fs.existsSync(fullPdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate PDF file not found on server disk.'
      });
    }

    const downloadName = `Skillsfy_Certificate_${certificate.certificate_code}.pdf`;
    return res.download(fullPdfPath, downloadName);

  } catch (error) {
    console.error('Error in downloadCertificate:', error);
    return res.status(500).json({ success: false, message: 'Failed to download certificate.', error: error.message });
  }
}

// 2. Get Certificate JSON Metadata by Enrollment ID
async function getCertificateByEnrollment(req, res) {
  try {
    const { enrollmentId } = req.params;
    const certificate = await Certificate.findByEnrollmentId(enrollmentId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'No certificate found for this enrollment.'
      });
    }

    return res.status(200).json({
      success: true,
      certificate
    });
  } catch (error) {
    console.error('Error in getCertificateByEnrollment:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch certificate details.', error: error.message });
  }
}

module.exports = {
  downloadCertificate,
  getCertificateByEnrollment
};

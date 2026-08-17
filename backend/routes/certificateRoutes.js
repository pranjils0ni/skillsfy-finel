/**
 * CERTIFICATE DOWNLOAD & METADATA ROUTES
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const certificateController = require('../controllers/certificateController');

// 1. Download Certificate PDF: GET /api/certificate/:enrollmentId
router.get('/:enrollmentId', verifyToken, certificateController.downloadCertificate);

// 2. Get Certificate Details: GET /api/certificate/:enrollmentId/details
router.get('/:enrollmentId/details', verifyToken, certificateController.getCertificateByEnrollment);

module.exports = router;

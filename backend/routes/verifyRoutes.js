/**
 * PUBLIC CERTIFICATE VERIFICATION ROUTES
 */

const express = require('express');
const router = express.Router();
const { verifyLimiter } = require('../middleware/rateLimiter');
const verifyController = require('../controllers/verifyController');

// Public Verification Endpoint: GET /api/verify/:certificateCode
router.get('/:certificateCode', verifyLimiter, verifyController.verifyCertificate);

module.exports = router;

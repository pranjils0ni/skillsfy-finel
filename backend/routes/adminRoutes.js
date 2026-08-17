/**
 * ADMIN & VERIFIER DASHBOARD MANAGEMENT ROUTES
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin, requireAdminOrVerifier } = require('../middleware/role');
const adminController = require('../controllers/adminController');

// 1. Get All Students (Admin & Verifier)
router.get('/students', verifyToken, requireAdminOrVerifier, adminController.getAllStudents);

// 2. Get All Certificates (Admin & Verifier)
router.get('/certificates', verifyToken, requireAdminOrVerifier, adminController.getAllCertificates);

// 3. Revoke Certificate (Admin only)
router.put(
  '/certificates/:id/revoke',
  verifyToken,
  requireAdmin,
  [
    body('reason').optional().trim().isLength({ max: 255 }).withMessage('Reason must be under 255 characters.')
  ],
  validate,
  adminController.revokeCertificate
);

// 4. Get Platform Overview Stats (Admin & Verifier)
router.get('/stats', verifyToken, requireAdminOrVerifier, adminController.getDashboardStats);

module.exports = router;

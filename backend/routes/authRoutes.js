/**
 * AUTHENTICATION ROUTES
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

// 1. Student Registration
router.post(
  '/signup',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Full name is required.').isLength({ min: 2, max: 100 }),
    body('email').trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('phone').optional().trim()
  ],
  validate,
  authController.studentSignup
);

// 2. Student Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validate,
  authController.studentLogin
);

// 3. Admin / Verifier Login
router.post(
  '/admin/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Please provide a valid administrative email address.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validate,
  authController.adminLogin
);

// 4. Get Current Authenticated Profile
router.get('/me', verifyToken, authController.getMe);

module.exports = router;

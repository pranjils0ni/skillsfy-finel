/**
 * COURSE MANAGEMENT ROUTES
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const courseController = require('../controllers/courseController');

// Optional auth token parser for listing (so admins see disabled courses, public sees only active)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    try {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const jwt = require('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'skillsfy_super_secure_jwt_secret_key_2026_x9821';
        req.user = jwt.verify(parts[1], secret);
      }
    } catch (e) {
      // ignore invalid optional token
    }
  }
  next();
}

// 1. Get all courses (Public)
router.get('/', optionalAuth, courseController.getAllCourses);

// 2. Get single course (Public)
router.get('/:id', courseController.getCourseById);

// 3. Create course (Admin only)
router.post(
  '/',
  verifyToken,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Course title is required.').isLength({ max: 200 }),
    body('description').optional().trim(),
    body('instructor').optional().trim(),
    body('price').optional().isNumeric().withMessage('Price must be a number.'),
    body('status').optional().isIn(['active', 'coming_soon', 'disabled']).withMessage('Status must be active, coming_soon, or disabled.')
  ],
  validate,
  courseController.createCourse
);

// 4. Update course (Admin only)
router.put(
  '/:id',
  verifyToken,
  requireAdmin,
  [
    body('title').optional().trim().notEmpty().withMessage('Course title cannot be empty.'),
    body('price').optional().isNumeric().withMessage('Price must be a number.'),
    body('status').optional().isIn(['active', 'coming_soon', 'disabled']).withMessage('Status must be active, coming_soon, or disabled.')
  ],
  validate,
  courseController.updateCourse
);

// 5. Delete course (Admin only)
router.delete('/:id', verifyToken, requireAdmin, courseController.deleteCourse);

module.exports = router;

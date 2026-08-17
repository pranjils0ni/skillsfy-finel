/**
 * ENROLLMENT & PROGRESS ROUTES
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { verifyToken } = require('../middleware/auth');
const { requireStudent } = require('../middleware/role');
const enrollmentController = require('../controllers/enrollmentController');

// 1. Enroll in a Course: POST /api/enroll/:courseId (Student only)
router.post('/enroll/:courseId', verifyToken, requireStudent, enrollmentController.enrollInCourse);

// 2. Update Lesson Progress: PUT /api/progress/:enrollmentId
router.put(
  '/progress/:enrollmentId',
  verifyToken,
  [
    body('progress_percent')
      .notEmpty().withMessage('progress_percent is required.')
      .isInt({ min: 0, max: 100 }).withMessage('progress_percent must be an integer between 0 and 100.')
  ],
  validate,
  enrollmentController.updateProgress
);

// 3. Get Student Enrolled Courses: GET /api/my-courses (Student only)
router.get('/my-courses', verifyToken, requireStudent, enrollmentController.getMyCourses);

module.exports = router;

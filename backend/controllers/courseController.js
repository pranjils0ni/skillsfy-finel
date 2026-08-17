/**
 * COURSE MANAGEMENT CONTROLLER
 */

const Course = require('../models/Course');

// 1. Get All Courses (Public)
async function getAllCourses(req, res) {
  try {
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'verifier');
    // Non-admins only see active courses
    const courses = await Course.getAll(!isAdmin);

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses.', error: error.message });
  }
}

// 2. Get Single Course by ID (Public)
async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID #${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Error in getCourseById:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch course detail.', error: error.message });
  }
}

// 3. Create Course (Admin Only)
async function createCourse(req, res) {
  try {
    const { title, description, instructor, thumbnail_url, video_urls, duration, price, status } = req.body;

    const course = await Course.create({
      title,
      description,
      instructor,
      thumbnail_url,
      video_urls,
      duration,
      price,
      status: status || 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'New course created successfully!',
      course
    });
  } catch (error) {
    console.error('Error in createCourse:', error);
    return res.status(500).json({ success: false, message: 'Failed to create course.', error: error.message });
  }
}

// 4. Update Course (Admin Only)
async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const { title, description, instructor, thumbnail_url, video_urls, duration, price, status } = req.body;

    const updated = await Course.update(id, {
      title,
      description,
      instructor,
      thumbnail_url,
      video_urls,
      duration,
      price,
      status
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Course with ID #${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully!',
      course: updated
    });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    return res.status(500).json({ success: false, message: 'Failed to update course.', error: error.message });
  }
}

// 5. Delete Course (Admin Only)
async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Course.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Course with ID #${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Course with ID #${id} deleted successfully.`
    });
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete course.', error: error.message });
  }
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};

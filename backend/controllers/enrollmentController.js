/**
 * ENROLLMENT & LEARNING PROGRESS CONTROLLER
 * Handles Course Enrollment, Progress Tracking, and Auto-Certificate Triggering
 */

const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');
const CertificateService = require('../services/certificateService');

// 1. Enroll in a Course (Student Only)
async function enrollInCourse(req, res) {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID #${courseId} does not exist.`
      });
    }

    if (course.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `This course is currently marked as '${course.status}' and not open for new enrollments.`
      });
    }

    // Check if already enrolled
    const existing = await Enrollment.findByStudentAndCourse(studentId, courseId);
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'You are already enrolled in this program.',
        enrollment: existing
      });
    }

    // Create new enrollment
    const enrollment = await Enrollment.create({
      student_id: studentId,
      course_id: courseId
    });

    return res.status(201).json({
      success: true,
      message: `Congratulations! You are now successfully enrolled in "${course.title}".`,
      enrollment: {
        id: enrollment.id,
        course_id: course.id,
        course_title: course.title,
        progress_percent: enrollment.progress_percent,
        status: enrollment.status,
        enrolled_at: enrollment.enrolled_at
      }
    });

  } catch (error) {
    console.error('Error in enrollInCourse:', error);
    return res.status(500).json({ success: false, message: 'Enrollment failed.', error: error.message });
  }
}

// 2. Update Progress (Student Only) & Auto-Trigger Certificate at 100%
async function updateProgress(req, res) {
  try {
    const studentId = req.user.id;
    const { enrollmentId } = req.params;
    const { progress_percent } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: `Enrollment record #${enrollmentId} not found.`
      });
    }

    // Ensure student owns this enrollment (or admin is updating)
    if (req.user.type === 'student' && enrollment.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own learning progress.'
      });
    }

    // Update progress in database
    const updatedEnrollment = await Enrollment.updateProgress(enrollmentId, progress_percent);

    let generatedCertificate = null;

    // Auto-generate certificate if progress hits 100%
    if (updatedEnrollment.progress_percent >= 100 && updatedEnrollment.status === 'completed') {
      try {
        generatedCertificate = await CertificateService.issueCertificateForEnrollment(updatedEnrollment);
      } catch (certError) {
        console.error('⚠️ Certificate auto-generation error:', certError);
      }
    }

    return res.status(200).json({
      success: true,
      message: updatedEnrollment.progress_percent >= 100 
        ? '🎉 Congratulations! You have completed 100% of the course. Your verified certificate has been issued!'
        : `Progress updated to ${updatedEnrollment.progress_percent}%`,
      enrollment: updatedEnrollment,
      certificate: generatedCertificate ? {
        certificate_code: generatedCertificate.certificate_code,
        issued_date: generatedCertificate.issued_date,
        pdf_download_url: `/api/certificate/${updatedEnrollment.id}`,
        verify_url: `/api/verify/${generatedCertificate.certificate_code}`
      } : null
    });

  } catch (error) {
    console.error('Error in updateProgress:', error);
    return res.status(500).json({ success: false, message: 'Failed to update progress.', error: error.message });
  }
}

// 3. Get Student's Enrolled Courses (Student Only)
async function getMyCourses(req, res) {
  try {
    const studentId = req.user.id;
    const enrollments = await Enrollment.getByStudentId(studentId);

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      my_courses: enrollments.map(e => ({
        enrollment_id: e.enrollment_id,
        course: {
          id: e.course_id,
          title: e.course_title,
          description: e.course_description,
          instructor: e.course_instructor,
          thumbnail_url: e.course_thumbnail,
          duration: e.course_duration
        },
        progress_percent: e.progress_percent,
        status: e.enrollment_status,
        enrolled_at: e.enrolled_at,
        completed_at: e.completed_at,
        certificate: e.certificate_code ? {
          code: e.certificate_code,
          issued_date: e.certificate_issued_date,
          status: e.certificate_status,
          download_url: `/api/certificate/${e.enrollment_id}`
        } : null
      }))
    });

  } catch (error) {
    console.error('Error in getMyCourses:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses.', error: error.message });
  }
}

module.exports = {
  enrollInCourse,
  updateProgress,
  getMyCourses
};

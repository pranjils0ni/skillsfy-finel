/**
 * AUTHENTICATION CONTROLLER
 * Handles Student Registration, Student Login, and Admin/Verifier Login
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'skillsfy_super_secure_jwt_secret_key_2026_x9821';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

// 1. Student Signup
async function studentSignup(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email already registered
    const existing = await Student.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please login instead.'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create student
    const student = await Student.create({
      name,
      email,
      password_hash,
      phone
    });

    // Generate JWT token
    const token = generateToken({
      id: student.id,
      email: student.email,
      name: student.name,
      type: 'student',
      role: 'student'
    });

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully! Welcome to SkillsFy.',
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        created_at: student.created_at
      }
    });

  } catch (error) {
    console.error('Error in studentSignup:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
      error: error.message
    });
  }
}

// 2. Student Login
async function studentLogin(req, res) {
  try {
    const { email, password } = req.body;

    const student = await Student.findByEmail(email);
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Compare bcrypt password hash
    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken({
      id: student.id,
      email: student.email,
      name: student.name,
      type: 'student',
      role: 'student'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        avatar_url: student.avatar_url,
        created_at: student.created_at
      }
    });

  } catch (error) {
    console.error('Error in studentLogin:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
      error: error.message
    });
  }
}

// 3. Admin / Verifier Login
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      type: 'admin',
      role: admin.role // 'admin' or 'verifier'
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${admin.name} (${admin.role.toUpperCase()})!`,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        created_at: admin.created_at
      }
    });

  } catch (error) {
    console.error('Error in adminLogin:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during admin authentication.',
      error: error.message
    });
  }
}

// 4. Get Current User Profile (Student or Admin)
async function getMe(req, res) {
  try {
    if (req.user.type === 'student') {
      const student = await Student.findById(req.user.id);
      return res.json({ success: true, user: { ...student, type: 'student' } });
    } else {
      const admin = await Admin.findById(req.user.id);
      return res.json({ success: true, user: { ...admin, type: 'admin' } });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  studentSignup,
  studentLogin,
  adminLogin,
  getMe
};

/**
 * JWT AUTHENTICATION MIDDLEWARE
 * Verifies Bearer token in Authorization header
 */

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing Authorization header (Format: Bearer <token>)'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid Authorization format. Must be "Bearer <token>"'
    });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'skillsfy_super_secure_jwt_secret_key_2026_x9821';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, email, role, type: 'student' | 'admin' }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired JWT token. Please login again.',
      error: err.name
    });
  }
}

module.exports = { verifyToken };

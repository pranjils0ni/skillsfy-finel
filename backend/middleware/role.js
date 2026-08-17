/**
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 */

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role check.'
      });
    }

    const userRole = req.user.role || (req.user.type === 'student' ? 'student' : null);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] permissions. Current role: '${userRole}'`
      });
    }

    next();
  };
}

const requireAdmin = requireRole('admin');
const requireAdminOrVerifier = requireRole('admin', 'verifier');
const requireStudent = requireRole('student');

module.exports = {
  requireRole,
  requireAdmin,
  requireAdminOrVerifier,
  requireStudent
};

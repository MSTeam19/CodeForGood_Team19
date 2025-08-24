const { verifyUserToken } = require('../lib/utils');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyUserToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

// Middleware to check if user has Staff role
const requireStaffRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.roles || !req.user.roles.includes('Staff')) {
    return res.status(403).json({ error: 'Staff role required' });
  }

  next();
};

// Combined middleware for authenticated staff users
const authenticateStaff = [authenticateToken, requireStaffRole];

module.exports = {
  authenticateToken,
  requireStaffRole,
  authenticateStaff
};

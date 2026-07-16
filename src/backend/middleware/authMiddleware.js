const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campustrack_secret_key_123';

const authenticateToken = (req, res, next) => {
  // Try to get token from header or cookie
  let token = null;

  // Check header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Check cookie (since HTML forms/navigation are easier with cookie authentication)
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies['token'];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  JWT_SECRET
};

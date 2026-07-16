const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const register = async (req, res) => {
  const { full_name, email, password } = req.body;

  // Simple input validation
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'All fields (full_name, email, password) are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // Regex validation for email (AAU domains preferred but regular emails accepted for flexibility)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered. Please login.' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const result = await dbRun(
      'INSERT INTO users (full_name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, 'user', 1]
    );

    return res.status(201).json({
      message: 'Registration successful! Please login to continue.',
      userId: result.lastID
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Retrieve user by email
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if user is suspended/banned
    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
    }

    // Verify password via bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token (expires in 24 hours as per SRS)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send JWT token in cookie for web pages to authenticate automatically
    res.cookie('token', token, {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: false, // set to false so client JS can read it if needed, or secure enough for local demo
      path: '/'
    });

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully.' });
};

const me = async (req, res) => {
  // Returns logged in user profile details
  try {
    const user = await dbGet('SELECT id, full_name, email, role, is_active FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  register,
  login,
  logout,
  me
};

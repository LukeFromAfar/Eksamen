const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const jwtUtils = {
  // Generate JWT token for a user
  generateToken: (user) => {
    return jwt.sign(
      { 
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  // Verify JWT token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
};

module.exports = jwtUtils;

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const jwtUtils = {
  // Generate JWT token for a user
  generateToken: (user) => {
    return jwt.sign(
      { 
        userId: user._id, // Changed from 'id' to 'userId' for consistency
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
  },

  // Set secure HTTP-only cookie
  setTokenCookie: (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
  },

  // Clear authentication cookie
  clearTokenCookie: (res) => {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    });
  }
};

module.exports = jwtUtils;

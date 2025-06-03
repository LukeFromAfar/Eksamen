const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Simple in-memory token blacklist (use Redis in production)
const tokenBlacklist = new Set();

const jwtUtils = {
  // Generate JWT token for a user
  generateToken: (user) => {
    const payload = {
      userId: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      iat: Math.floor(Date.now() / 1000) // Issued at time
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'eksamen-api',
      audience: 'eksamen-users'
    });
  },

  // Verify JWT token
  verifyToken: (token) => {
    try {
      // Check if token is blacklisted
      if (tokenBlacklist.has(token)) {
        throw new Error('Token has been revoked');
      }
      
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'eksamen-api',
        audience: 'eksamen-users'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error(error.message || 'Token verification failed');
      }
    }
  },

  // Blacklist a token (for logout)
  blacklistToken: (token) => {
    tokenBlacklist.add(token);
    
    // Clean up expired tokens periodically (simple cleanup)
    if (tokenBlacklist.size > 1000) {
      // In production, implement proper cleanup with expiration times
      tokenBlacklist.clear();
    }
  },

  // Set secure HTTP-only cookie
  setTokenCookie: (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // Set to false since we're not using HTTPS
      sameSite: 'lax', // More permissive for cross-origin requests in development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      ...(isProduction && { domain: process.env.COOKIE_DOMAIN })
    });
  },

  // Clear authentication cookie
  clearTokenCookie: (res) => {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
      secure: false,
      sameSite: 'lax'
    });
  }
};

module.exports = jwtUtils;

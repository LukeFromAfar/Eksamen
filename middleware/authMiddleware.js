const User = require('../models/UserSchema');
const jwtUtils = require('../utils/jwtUtils');

const authMiddleware = {
  verifyToken: async (req, res, next) => {
    try {
      // Get token from cookie first, then fallback to Authorization header
      let token = req.cookies.jwt;
      
      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.slice(7);
          // Validate token format (basic check)
          if (token.split('.').length !== 3) {
            return res.status(401).json({ 
              success: false,
              message: 'Invalid token format' 
            });
          }
        }
      }
      
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: 'Access denied. No token provided.' 
        });
      }
      
      // Verify token
      const decoded = jwtUtils.verifyToken(token);
      
      const tokenAge = Date.now() / 1000 - decoded.iat;
      const maxTokenAge = 7 * 24 * 60 * 60; // 7 days in seconds
      
      if (tokenAge > maxTokenAge) {
        return res.status(401).json({ 
          success: false,
          message: 'Token is too old. Please login again.' 
        });
      }
      
      // Find user from token data using userId field
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token. User not found.' 
        });
      }
      
      // Add user and token to request object
      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      
      // Specific error responses
      if (error.message.includes('expired')) {
        return res.status(401).json({ 
          success: false,
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.message.includes('revoked')) {
        return res.status(401).json({ 
          success: false,
          message: 'Token has been revoked. Please login again.',
          code: 'TOKEN_REVOKED'
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication failed',
          code: 'AUTH_FAILED'
        });
      }
    }
  },
  
  // Middleware to verify if the user is authorized to modify the requested account
  authorizeUser: (req, res, next) => {
    try {
      const requestedUsername = req.params.username;
      const currentUsername = req.user.username;
      const isAdmin = req.user.isAdmin;
      
      // Prevent username parameter pollution
      if (Array.isArray(requestedUsername)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid username parameter' 
        });
      }
      
      // Check if user is updating their own account or is an admin
      if (currentUsername !== requestedUsername && !isAdmin) {
        return res.status(403).json({ 
          success: false,
          message: 'You are not authorized to modify this account',
          code: 'INSUFFICIENT_PRIVILEGES'
        });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Authorization error'
      });
    }
  },
  
  // Middleware to verify if the user is an admin
  requireAdmin: (req, res, next) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Admin privileges required.',
          code: 'ADMIN_REQUIRED'
        });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Authorization error'
      });
    }
  }
};

module.exports = authMiddleware;

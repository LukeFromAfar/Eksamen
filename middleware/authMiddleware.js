const User = require('../models/UserSchema');
const jwtUtils = require('../utils/jwtUtils');

const authMiddleware = {
  // Middleware to verify JWT token from cookies or headers
  verifyToken: async (req, res, next) => {
    try {
      // Get token from cookie first, then fallback to Authorization header
      let token = req.cookies.jwt;
      
      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.slice(7);
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
      
      // Find user from token data using userId field
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token. User not found.' 
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ 
        success: false,
        message: 'Authentication failed',
        error: error.message 
      });
    }
  },
  
  // Middleware to verify if the user is authorized to modify the requested account
  authorizeUser: (req, res, next) => {
    try {
      // Check if user is updating their own account or is an admin
      if (req.user.username !== req.params.username && !req.user.isAdmin) {
        return res.status(403).json({ 
          success: false,
          message: 'You are not authorized to modify this account' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Authorization error',
        error: error.message 
      });
    }
  },
  
  // Middleware to verify if the user is an admin
  requireAdmin: (req, res, next) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Admin privileges required.' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Authorization error',
        error: error.message 
      });
    }
  }
};

module.exports = authMiddleware;

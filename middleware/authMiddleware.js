const User = require('../models/UserSchema');
const jwtUtils = require('../utils/jwtUtils');

const authMiddleware = {
  // Middleware to verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
      }
      
      // Verify token
      const decoded = jwtUtils.verifyToken(token);
      
      // Find user from token data
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid token, user not found' });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
  },
  
  // Middleware to verify if the user is authorized to modify the requested account
  authorizeUser: async (req, res, next) => {
    try {
      // Check if user is updating their own account or is an admin
      if (req.user.username !== req.params.username && !req.user.isAdmin) {
        return res.status(403).json({ message: 'You are not authorized to update this account' });
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ message: 'Authorization error', error: error.message });
    }
  },
  
  // Middleware to verify if the user is an admin
  authorizeAdmin: async (req, res, next) => {
    try {
      // Check if user is an admin
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin privileges required' });
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ message: 'Authorization error', error: error.message });
    }
  }
};

module.exports = authMiddleware;

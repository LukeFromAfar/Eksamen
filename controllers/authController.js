const User = require('../models/UserSchema');
const jwtUtils = require('../utils/jwtUtils');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = jwtUtils.generateToken(user);
      
      // Set secure cookie
      jwtUtils.setTokenCookie(res, token);

      res.json({
        success: true,
        message: 'Login successful',
        // token, // Available via HTTP-only cookie for security
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  },

  logout: (req, res) => {
    // If user is authenticated, blacklist their token
    if (req.token) {
      jwtUtils.blacklistToken(req.token);
    }
    
    jwtUtils.clearTokenCookie(res);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  },

  checkAuth: (req, res) => {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        createdAt: req.user.createdAt
      }
    });
  },

  refreshToken: async (req, res) => {
    try {
      const token = req.cookies.token;
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No refresh token provided'
        });
      }

      // Verify the token
      const decoded = jwtUtils.verifyToken(token);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new token
      const newToken = jwtUtils.generateToken(user);
      
      // Set new secure cookie
      jwtUtils.setTokenCookie(res, newToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }
};

module.exports = authController;

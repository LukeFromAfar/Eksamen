const User = require('../models/UserSchema');
const jwtUtils = require('../utils/jwtUtils');

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Create new user
      const user = new User({ username, email, password });
      await user.save();

      // Generate token
      const token = jwtUtils.generateToken(user);
      
      // Set secure cookie
      jwtUtils.setTokenCookie(res, token);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token, // For Postman testing
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

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
        token, // For Postman testing
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
  }
};

module.exports = authController;

const User = require('../models/UserSchema');
const isEmail = require('is-email');

const userController = {
  createUser: async (req, res) => {
    try {
      // Validate request body exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Request body is required'
        });
      }

      const { username, email } = req.body;

      // Validate required fields
      if (!username || !email) {
        return res.status(400).json({
          success: false,
          message: 'Username and email are required'
        });
      }

      // Sanitize inputs
      const sanitizedUsername = username.trim();
      const sanitizedEmail = email.trim().toLowerCase();

      // Additional validation
      if (sanitizedUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters'
        });
      }

      if (!isEmail(sanitizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: sanitizedEmail }, { username: sanitizedUsername }]
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Create new user
      const user = new User({ 
        username: sanitizedUsername, 
        email: sanitizedEmail 
      });
      
      await user.save();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  getUserByUsername: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user'
      });
    }
  },
  
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      
      res.json({
        success: true,
        users: users.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users'
      });
    }
  },
  
  updateUser: async (req, res) => {
    try {
      const { username, email } = req.body;
      const updatedFields = {};

      if (username) {
        updatedFields.username = username;
      }

      if (email) {
        updatedFields.email = email;
      }

      const user = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating user'
      });
    }
  },
  
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user'
      });
    }
  }
};

module.exports = userController;
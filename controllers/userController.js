const mongoose = require('mongoose');
const User = require('../models/UserSchema');
const jwtUtils = require('../utils/jwtUtils');

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
      jwtUtils.setTokenCookie(res, token);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        // token, // Available via HTTP-only cookie for security
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
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

  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('username');
      const usernames = users.map(user => user.username);
      res.json({
        success: true,
        usernames
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users'
      });
    }
  },

  getUserByUsername: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username }).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user'
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { username } = req.params;
      const updates = { ...req.body }; // Create a copy to safely modify

      // Check if user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user can update (admin or self)
      if (!req.user.isAdmin && req.user.username !== username) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own profile.'
        });
      }

      // Prevent non-admins from updating admin status
      if (!req.user.isAdmin && updates.hasOwnProperty('isAdmin')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only admins can modify admin status.'
        });
      }

      // Restrict updates to only username, email, and password for non-admins
      if (!req.user.isAdmin) {
        const allowedFields = ['username', 'email', 'password'];
        const updateKeys = Object.keys(updates);
        const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
        
        if (invalidFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `You can only update: ${allowedFields.join(', ')}`
          });
        }
      }

      // Update user
      const updatedUser = await User.findOneAndUpdate(
        { username },
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { username } = req.params;

      const user = await User.findOneAndDelete({ username });
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
  },

  getUsers: (req, res) => {
    res.json({ message: 'Users endpoint' });
  }
};

module.exports = userController;
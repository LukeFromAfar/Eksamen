const mongoose = require('mongoose');
const User = require('../models/UserSchema');

const userController = {
  createUser: async (req, res) => {
    try {
      const { username, email, password, isAdmin } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this username or email already exists' 
        });
      }
      
      // Create new user
      const newUser = new User({ 
        username, 
        email, 
        password,
        isAdmin: isAdmin || false // Default to non-admin
      });
      await newUser.save();
      
      // Don't return password in response
      const userResponse = newUser.toObject();
      delete userResponse.password;
      
      res.status(201).json({
        message: 'User created successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
  },
  
  getUserByUsername: async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username }).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Failed to get user', error: error.message });
    }
  },
  
  getAllUsers: async (req, res) => {
    try {
      // Only return usernames as per requirements
      const users = await User.find().select('username');
      res.status(200).json(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({ message: 'Failed to get users', error: error.message });
    }
  },
  
  updateUser: async (req, res) => {
    try {
      const { username } = req.params;
      const updates = req.body;
      
      // Don't allow updates to username as it's used as identifier
      if (updates.username) {
        delete updates.username;
      }
      
      // Don't allow changing admin status through regular update
      if (updates.isAdmin && !req.user.isAdmin) {
        delete updates.isAdmin;
      }
      
      const user = await User.findOne({ username });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user fields
      Object.keys(updates).forEach(key => {
        user[key] = updates[key];
      });
      
      await user.save();
      
      // Don't return password in response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(200).json({
        message: 'User updated successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  },
  
  deleteUser: async (req, res) => {
    try {
      const { username } = req.params;
      const deletedUser = await User.findOneAndDelete({ username });
      
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
  }
};

module.exports = userController;
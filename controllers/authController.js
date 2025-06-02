const User = require('../models/UserSchema');
const jwtUtils = require('../utils/jwtUtils');

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Find user
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwtUtils.generateToken(user);
      
      // Return user info (without password) and token
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(200).json({
        message: 'Login successful',
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },
  
  // For testing token validity
  checkAuth: async (req, res) => {
    res.status(200).json({ 
      message: 'Token is valid', 
      user: req.user 
    });
  }
};

module.exports = authController;

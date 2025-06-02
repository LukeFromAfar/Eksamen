const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a user (registration - public)
router.post('/', userController.createUser);

// Get user by username (protected)
router.get('/:username', authMiddleware.verifyToken, userController.getUserByUsername);

// Get all users (usernames only - protected)
router.get('/', authMiddleware.verifyToken, userController.getAllUsers);

// Update user - only self or admin can update (protected)
router.put('/:username', 
  authMiddleware.verifyToken,
  authMiddleware.authorizeUser, 
  userController.updateUser
);

// Delete user - only admin can delete (protected)
router.delete('/:username', 
  authMiddleware.verifyToken,
  authMiddleware.authorizeAdmin, 
  userController.deleteUser
);

module.exports = router;
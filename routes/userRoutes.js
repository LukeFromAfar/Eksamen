const express = require('express');
const { verifyToken, requireAdmin, authorizeUser } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Create user (public access)
router.post('/', userController.createUser);

// Get all users (authenticated users)
router.get('/', verifyToken, userController.getAllUsers);

// Get user by username (authenticated users)
router.get('/:username', verifyToken, userController.getUserByUsername);

// Update user (admin or the user themselves)
router.put('/:username', verifyToken, authorizeUser, userController.updateUser);

// Delete user (admin only)
router.delete('/:username', verifyToken, requireAdmin, userController.deleteUser);

module.exports = router;
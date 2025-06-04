const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public routes
// Create a user
router.post('/createUser', userController.createUser);

// Get user by username
router.get('/:username', userController.getUserByUsername);

// User management routes (no authentication required)
router.get('/users', userController.getAllUsers);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;

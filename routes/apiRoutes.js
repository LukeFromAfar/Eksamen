const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Get user by username at /api/:username (without the /users/ segment)
router.get('/:username', verifyToken, userController.getUserByUsername);

// Create user at /api/createUser (without the /users/ segment)
router.post('/createUser', userController.createUser);

module.exports = router;

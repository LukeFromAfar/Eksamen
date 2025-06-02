const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Login route
router.post('/login', authController.login);

// Test auth route (protected)
router.get('/me', authMiddleware.verifyToken, authController.checkAuth);

module.exports = router;

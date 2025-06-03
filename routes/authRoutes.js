const express = require('express');
const { validateLogin } = require('../middleware/validationMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const { login, logout, refreshToken, checkAuth } = require('../controllers/authController');

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/logout', verifyToken, logout);
router.post('/refresh-token', refreshToken);
router.get('/check', verifyToken, checkAuth);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Verify email
router.get('/verify/:token', authController.verifyEmail);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;

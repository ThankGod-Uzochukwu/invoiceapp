const express = require('express');
const router = express.Router();
const {
  registerHandler,
  loginHandler,
  getCurrentUserHandler,
  logoutHandler
} = require('../controllers/authController');
const { validate } = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema } = require('../middleware/authValidation');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerSchema), registerHandler);

/**
 * @route   POST /auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', validate(loginSchema), loginHandler);

/**
 * @route   GET /auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUserHandler);

/**
 * @route   POST /auth/logout
 * @desc    Logout current user (delete session)
 * @access  Private
 */
router.post('/logout', authenticate, logoutHandler);

module.exports = router;

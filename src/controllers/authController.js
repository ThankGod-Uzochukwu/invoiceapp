const { ID } = require('node-appwrite');
const { users } = require('../services/appwriteClient');

/**
 * Register a new user
 */
async function registerHandler(req, res) {
  try {
    const { email, password, name } = req.body;

    console.log('📝 Registering new user:', email);

    // Create user account in Appwrite using Users service (server-side)
    const user = await users.create(
      ID.unique(),
      email,
      undefined, // phone (optional)
      password,
      name
    );

    console.log('✅ User registered successfully:', user.$id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.$id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    
    // Handle specific Appwrite errors
    if (error.code === 409) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
}

/**
 * Login user and return JWT token
 */
async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;

    console.log('🔐 User login attempt:', email);

    // Create a temporary client for this user session
    const { Client, Account } = require('node-appwrite');
    const userClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT);
    
    const userAccount = new Account(userClient);

    // Create email session (correct method name for node-appwrite)
    const session = await userAccount.createEmailSession(email, password);
    
    console.log('✅ Session created:', session.$id);

    // Generate JWT token
    const jwt = await userAccount.createJWT();

    console.log('✅ JWT token generated');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: jwt.jwt,
        sessionId: session.$id,
        userId: session.userId
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);

    // Handle specific Appwrite errors
    if (error.code === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
}

/**
 * Get current user profile
 */
async function getCurrentUserHandler(req, res) {
  try {
    // req.user is set by authenticate middleware
    const userId = req.user.$id;

    console.log('👤 Fetching user profile:', userId);

    res.status(200).json({
      success: true,
      data: {
        userId: req.user.$id,
        email: req.user.email,
        name: req.user.name,
        emailVerification: req.user.emailVerification,
        prefs: req.user.prefs
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
      message: error.message
    });
  }
}

/**
 * Logout user (delete current session)
 */
async function logoutHandler(req, res) {
  try {
    console.log('🚪 User logout:', req.user.$id);

    // Create a temporary client with the user's JWT
    const { Client, Account } = require('node-appwrite');
    const userClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT)
      .setJWT(req.headers.authorization.replace('Bearer ', ''));
    
    const userAccount = new Account(userClient);

    // Delete current session
    await userAccount.deleteSession('current');

    console.log('✅ Session deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error.message
    });
  }
}

module.exports = {
  registerHandler,
  loginHandler,
  getCurrentUserHandler,
  logoutHandler
};

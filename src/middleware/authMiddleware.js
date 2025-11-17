// src/middleware/authMiddleware.js
const { client, account } = require('../services/appwriteClient');

async function authenticate(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization header' });

    const token = parts[1];
    client.setJWT(token);

    const user = await account.get();
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error', err && err.message ? err.message : err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };

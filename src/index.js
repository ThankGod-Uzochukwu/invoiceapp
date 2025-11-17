// src/index.js
require('dotenv').config();
const app = require('./app');

const port = parseInt(process.env.PORT || '4000', 10);

// Validate required environment variables
const requiredEnvVars = [
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT',
  'APPWRITE_API_KEY',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_COLLECTION_INVOICES_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

const server = app.listen(port, () => {
  console.log('🚀 Appwrite Finance Backend API');
  console.log(`📍 Server running on http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

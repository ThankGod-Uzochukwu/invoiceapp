// src/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const invoiceRoutes = require('./routes/invoices');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/invoices', invoiceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'appwrite-finance-backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Appwrite Finance Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      invoices: '/invoices',
      createInvoice: 'POST /invoices',
      listInvoices: 'GET /invoices?status=paid|unpaid',
      markPaid: 'POST /invoices/:id/pay',
      summary: 'GET /invoices/summary'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;

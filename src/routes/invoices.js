// src/routes/invoices.js
const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { z } = require('zod');
const { createInvoiceHandler, listInvoicesHandler, markPaidHandler, summaryHandler } = require('../controllers/invoiceController');

const router = express.Router();

// Validation schema for invoice creation
const createInvoiceSchema = z.object({
  items: z.array(z.object({ 
    description: z.string().min(1, 'Description is required'), 
    amount: z.number().positive('Amount must be positive') 
  })).min(1, 'At least one item is required'),
  country: z.string().optional(),
});

// All routes require authentication
router.post('/', authenticate, validate(createInvoiceSchema), createInvoiceHandler);
router.get('/', authenticate, listInvoicesHandler);
router.post('/:id/pay', authenticate, markPaidHandler);
router.get('/summary', authenticate, summaryHandler);

module.exports = router;

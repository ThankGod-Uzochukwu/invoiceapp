// src/routes/invoices.js
const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { z } = require('zod');
const { createInvoiceHandler, listInvoicesHandler, markPaidHandler, summaryHandler } = require('../controllers/invoiceController');

const router = express.Router();

const createInvoiceSchema = z.object({
  items: z.array(z.object({ description: z.string(), amount: z.number() })).min(1),
  country: z.string().optional(),
});

router.post('/', authenticate, validate(createInvoiceSchema), createInvoiceHandler);
router.get('/', authenticate, listInvoicesHandler);
router.post('/:id/pay', authenticate, markPaidHandler);
router.get('/summary', authenticate, summaryHandler);

module.exports = router;

// src/controllers/invoiceController.js
const invoiceService = require('../services/invoiceService');
const { functions } = require('../services/appwriteClient');

/**
 * Create a new invoice with automatic VAT calculation
 * @route POST /invoices
 * @access Private (requires authentication)
 */
async function createInvoiceHandler(req, res) {
  try {
    const user = req.user;
    const payload = req.validated || req.body;
    
    console.log(`Creating invoice for user ${user.$id}`);
    const doc = await invoiceService.createInvoice(user.$id, payload);
    
    console.log(`Invoice created successfully: ${doc.$id}`);
    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: doc
    });
  } catch (err) {
    console.error('Error creating invoice:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create invoice',
      message: err.message || 'Server error' 
    });
  }
}

/**
 * List all invoices for the authenticated user
 * @route GET /invoices?status=paid|unpaid
 * @access Private (requires authentication)
 */
async function listInvoicesHandler(req, res) {
  try {
    const user = req.user;
    const status = req.query.status === 'paid' ? 'paid' : req.query.status === 'unpaid' ? 'unpaid' : undefined;
    
    console.log(`Listing invoices for user ${user.$id}, status: ${status || 'all'}`);
    const docs = await invoiceService.listInvoices(user.$id, status);
    
    return res.json({
      success: true,
      count: docs.length,
      data: docs
    });
  } catch (err) {
    console.error('Error listing invoices:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to list invoices',
      message: err.message || 'Server error' 
    });
  }
}

/**
 * Mark an invoice as paid, recompute VAT, and send email notification
 * @route POST /invoices/:id/pay
 * @access Private (requires authentication)
 */
async function markPaidHandler(req, res) {
  try {
    const user = req.user;
    const invoiceId = req.params.id;
    
    console.log(`Marking invoice ${invoiceId} as paid for user ${user.$id}`);
    const updated = await invoiceService.markInvoicePaid(user.$id, invoiceId);

    // Send email notification
    const functionId = process.env.APPWRITE_FUNCTION_SEND_EMAIL_ID;
    if (functionId) {
      try {
        console.log(`Triggering email notification for invoice ${invoiceId}`);
        await functions.createExecution(
          functionId, 
          JSON.stringify({
            to: user.email,
            subject: `Invoice #${invoiceId.substring(0, 8)} Payment Confirmed`,
            body: `
              <h2>Payment Confirmed!</h2>
              <p>Your invoice <strong>#${invoiceId.substring(0, 8)}</strong> has been marked as paid.</p>
              <p><strong>Total Amount:</strong> $${updated.total.toFixed(2)}</p>
              <p><strong>VAT:</strong> $${updated.vat.toFixed(2)}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p>Thank you for your business!</p>
            `
          }),
          false, // async execution
          '/', // path
          'POST' // method
        );
        console.log(`Email notification sent successfully`);
      } catch (fnErr) {
        console.warn('Failed to send email notification:', fnErr.message);
        // Don't fail the request if email fails
      }
    } else {
      console.warn('APPWRITE_FUNCTION_SEND_EMAIL_ID not configured, skipping email notification');
    }

    return res.json({
      success: true,
      message: 'Invoice marked as paid',
      data: updated
    });
  } catch (err) {
    console.error('Error marking invoice as paid:', err);
    const statusCode = err.message.includes('Not found') || err.message.includes('unauthorized') ? 404 : 500;
    return res.status(statusCode).json({ 
      success: false,
      error: 'Failed to mark invoice as paid',
      message: err.message || 'Server error' 
    });
  }
}

/**
 * Get financial summary for the authenticated user
 * @route GET /invoices/summary
 * @access Private (requires authentication)
 */
async function summaryHandler(req, res) {
  try {
    const user = req.user;
    
    console.log(`Generating summary for user ${user.$id}`);
    const summary = await invoiceService.getSummary(user.$id);
    
    return res.json({
      success: true,
      data: {
        totalRevenue: summary.totalRevenue,
        totalVat: summary.totalVat,
        outstandingInvoices: summary.outstanding,
        paidInvoices: summary.paid || 0,
        totalInvoices: summary.total || 0
      }
    });
  } catch (err) {
    console.error('Error generating summary:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to generate summary',
      message: err.message || 'Server error' 
    });
  }
}

module.exports = { 
  createInvoiceHandler, 
  listInvoicesHandler, 
  markPaidHandler, 
  summaryHandler 
};

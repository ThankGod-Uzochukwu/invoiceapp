// src/controllers/invoiceController.js
const invoiceService = require('../services/invoiceService');
const { functions } = require('../services/appwriteClient');

async function createInvoiceHandler(req, res) {
  try {
    const user = req.user;
    const payload = req.validated || req.body;
    const doc = await invoiceService.createInvoice(user.$id, payload);
    return res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

async function listInvoicesHandler(req, res) {
  try {
    const user = req.user;
    const status = req.query.status === 'paid' ? 'paid' : req.query.status === 'unpaid' ? 'unpaid' : undefined;
    const docs = await invoiceService.listInvoices(user.$id, status);
    return res.json(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

async function markPaidHandler(req, res) {
  try {
    const user = req.user;
    const invoiceId = req.params.id;
    const updated = await invoiceService.markInvoicePaid(user.$id, invoiceId);

    const functionId = process.env.APPWRITE_FUNCTION_SEND_EMAIL_ID;
    if (functionId) {
      try {
        await functions.createExecution(functionId, JSON.stringify({
          to: user.email,
          subject: `Invoice ${invoiceId} paid`,
          body: `Your invoice ${invoiceId} was marked as paid. Total: ${updated.total}`
        }));
      } catch (fnErr) {
        console.warn('Failed to call send-email function', fnErr);
      }
    }

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Server error' });
  }
}

async function summaryHandler(req, res) {
  try {
    const user = req.user;
    const s = await invoiceService.getSummary(user.$id);
    return res.json(s);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

module.exports = { createInvoiceHandler, listInvoicesHandler, markPaidHandler, summaryHandler };

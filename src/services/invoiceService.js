// src/services/invoiceService.js
const { databases, sdk } = require('./appwriteClient');
const { getVatRateForCountry, computeVAT } = require('../utils/vat');

const DB_ID = process.env.APPWRITE_DATABASE_ID || '';
const INVOICES_COLLECTION = process.env.APPWRITE_COLLECTION_INVOICES_ID || '';

/**
 * Create a new invoice with automatic VAT calculation
 * @param {string} userId - The user's ID
 * @param {Object} payload - Invoice data containing items and optional country
 * @returns {Promise<Object>} Created invoice document
 */
async function createInvoice(userId, payload) {
  try {
    const { items = [], country } = payload;
    
    // Validate items
    if (!items || items.length === 0) {
      throw new Error('Invoice must contain at least one item');
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const amount = Number(item.amount || 0);
      if (amount < 0) {
        throw new Error('Item amounts must be positive');
      }
      return sum + amount;
    }, 0);

    // Get VAT rate and compute totals
    const rate = await getVatRateForCountry(country);
    const { vat, total } = computeVAT(subtotal, rate);

    console.log(`Creating invoice: subtotal=${subtotal}, VAT=${vat}, total=${total}`);

    // Create document in Appwrite
    const doc = await databases.createDocument(
      DB_ID, 
      INVOICES_COLLECTION, 
      sdk.ID.unique(), 
      {
        userId,
        items: JSON.stringify(items), // Store as JSON string
        country: country || 'US',
        subtotal,
        vatRate: rate,
        vat,
        total,
        paid: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [`read("user:${userId}")`], // Read permissions
      [`write("user:${userId}")`] // Write permissions
    );

    return {
      ...doc,
      items: typeof doc.items === 'string' ? JSON.parse(doc.items) : doc.items
    };
  } catch (err) {
    console.error('Error in createInvoice:', err);
    throw new Error(`Failed to create invoice: ${err.message}`);
  }
}

/**
 * List invoices for a user with optional status filter
 * @param {string} userId - The user's ID
 * @param {string} status - Optional filter: 'paid' or 'unpaid'
 * @returns {Promise<Array>} List of invoice documents
 */
async function listInvoices(userId, status) {
  try {
    const queries = [sdk.Query.equal('userId', userId), sdk.Query.orderDesc('createdAt')];
    
    if (status === 'paid') {
      queries.push(sdk.Query.equal('paid', true));
    } else if (status === 'unpaid') {
      queries.push(sdk.Query.equal('paid', false));
    }

    const res = await databases.listDocuments(DB_ID, INVOICES_COLLECTION, queries);
    
    // Parse items if stored as JSON string
    return res.documents.map(doc => ({
      ...doc,
      items: typeof doc.items === 'string' ? JSON.parse(doc.items) : doc.items
    }));
  } catch (err) {
    console.error('Error in listInvoices:', err);
    throw new Error(`Failed to list invoices: ${err.message}`);
  }
}

/**
 * Mark an invoice as paid and recompute VAT
 * @param {string} userId - The user's ID
 * @param {string} invoiceId - The invoice ID
 * @returns {Promise<Object>} Updated invoice document
 */
async function markInvoicePaid(userId, invoiceId) {
  try {
    // Get existing invoice
    const invoice = await databases.getDocument(DB_ID, INVOICES_COLLECTION, invoiceId);
    
    // Verify ownership
    if (!invoice || invoice.userId !== userId) {
      throw new Error('Not found or unauthorized');
    }

    // Check if already paid
    if (invoice.paid) {
      console.log(`Invoice ${invoiceId} is already marked as paid`);
      return {
        ...invoice,
        items: typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
      };
    }

    // Recompute VAT
    const subtotal = Number(invoice.subtotal || 0);
    const rate = Number(invoice.vatRate || process.env.DEFAULT_VAT_RATE || 0.075);
    const { vat, total } = computeVAT(subtotal, rate);

    console.log(`Marking invoice ${invoiceId} as paid: subtotal=${subtotal}, VAT=${vat}, total=${total}`);

    // Update document
    const updated = await databases.updateDocument(
      DB_ID, 
      INVOICES_COLLECTION, 
      invoiceId, 
      {
        paid: true,
        vat,
        total,
        vatRate: rate,
        updatedAt: new Date().toISOString(),
        paidAt: new Date().toISOString()
      }
    );

    return {
      ...updated,
      items: typeof updated.items === 'string' ? JSON.parse(updated.items) : updated.items
    };
  } catch (err) {
    console.error('Error in markInvoicePaid:', err);
    throw new Error(`Failed to mark invoice as paid: ${err.message}`);
  }
}

/**
 * Get financial summary for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Summary with revenue, VAT, and outstanding invoices
 */
async function getSummary(userId) {
  try {
    const allInvoices = await listInvoices(userId);
    
    const summary = {
      totalRevenue: 0,
      totalVat: 0,
      outstanding: 0,
      paid: 0,
      total: allInvoices.length
    };

    allInvoices.forEach(invoice => {
      const total = Number(invoice.total || 0);
      const vat = Number(invoice.vat || 0);
      
      summary.totalRevenue += total;
      summary.totalVat += vat;
      
      if (invoice.paid) {
        summary.paid += 1;
      } else {
        summary.outstanding += 1;
      }
    });

    // Round to 2 decimal places
    summary.totalRevenue = Math.round(summary.totalRevenue * 100) / 100;
    summary.totalVat = Math.round(summary.totalVat * 100) / 100;

    console.log(`Summary for user ${userId}:`, summary);
    return summary;
  } catch (err) {
    console.error('Error in getSummary:', err);
    throw new Error(`Failed to generate summary: ${err.message}`);
  }
}

module.exports = { 
  createInvoice, 
  listInvoices, 
  markInvoicePaid, 
  getSummary 
};

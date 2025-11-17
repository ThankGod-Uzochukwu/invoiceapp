// src/services/invoiceService.js
const { databases, sdk } = require('./appwriteClient');
const { getVatRateForCountry, computeVAT } = require('../utils/vat');

const DB_ID = process.env.APPWRITE_DATABASE_ID || '';
const INVOICES_COLLECTION = process.env.APPWRITE_COLLECTION_INVOICES_ID || '';

async function createInvoice(userId, payload) {
  const { items = [], country } = payload;
  const subtotal = items.reduce((s, it) => s + Number(it.amount || 0), 0);
  const rate = await getVatRateForCountry(country);
  const { vat, total } = computeVAT(subtotal, rate);

  const doc = await databases.createDocument(DB_ID, INVOICES_COLLECTION, sdk.ID.unique(), {
    userId,
    items,
    subtotal,
    vatRate: rate,
    vat,
    total,
    paid: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, [
    `user:${userId}`
  ], [
    `user:${userId}`
  ]);

  return doc;
}

async function listInvoices(userId, status) {
  const queries = [sdk.Query.equal('userId', userId)];
  if (status === 'paid') queries.push(sdk.Query.equal('paid', true));
  if (status === 'unpaid') queries.push(sdk.Query.equal('paid', false));
  const res = await databases.listDocuments(DB_ID, INVOICES_COLLECTION, queries);
  return res.documents;
}

async function markInvoicePaid(userId, invoiceId) {
  const invoice = await databases.getDocument(DB_ID, INVOICES_COLLECTION, invoiceId);
  if (!invoice || invoice.userId !== userId) throw new Error('Not found or unauthorized');

  const subtotal = Number(invoice.subtotal || 0);
  const rate = Number(invoice.vatRate || process.env.DEFAULT_VAT_RATE || 0.075);
  const { vat, total } = computeVAT(subtotal, rate);

  const updated = await databases.updateDocument(DB_ID, INVOICES_COLLECTION, invoiceId, {
    ...invoice,
    paid: true,
    vat,
    total,
    vatRate: rate,
    updatedAt: new Date().toISOString(),
  });

  return updated;
}

async function getSummary(userId) {
  const all = await listInvoices(userId);
  const totalRevenue = all.reduce((s, i) => s + Number(i.total || 0), 0);
  const totalVat = all.reduce((s, i) => s + Number(i.vat || 0), 0);
  const outstanding = all.filter(i => !i.paid).length;
  return { totalRevenue, totalVat, outstanding };
}

module.exports = { createInvoice, listInvoices, markInvoicePaid, getSummary };

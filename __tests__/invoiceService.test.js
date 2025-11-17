// __tests__/invoiceService.test.js
const invoiceService = require('../src/services/invoiceService');

jest.mock('../src/services/appwriteClient', () => {
  return {
    databases: {
      createDocument: jest.fn().mockResolvedValue({ id: 'abc', subtotal: 100, vat: 7.5, total: 107.5 }),
      listDocuments: jest.fn().mockResolvedValue({ total: 1, documents: [{ id: 'abc', userId: 'user1', subtotal: 100, vat: 7.5, total: 107.5, paid: false }] }),
      getDocument: jest.fn().mockResolvedValue({ id: 'abc', userId: 'user1', subtotal: 100, vat: 7.5, total: 107.5, paid: false }),
      updateDocument: jest.fn().mockResolvedValue({ id: 'abc', paid: true }),
    },
    sdk: {
      Query: { equal: () => ({}) },
      ID: { unique: () => 'unique-id' }
    }
  };
});

describe('invoiceService', () => {
  it('creates an invoice', async () => {
    const doc = await invoiceService.createInvoice('user1', { items: [{ description: 'X', amount: 100 }] });
    expect(doc).toHaveProperty('id');
  });

  it('lists invoices', async () => {
    const docs = await invoiceService.listInvoices('user1');
    expect(Array.isArray(docs)).toBe(true);
  });

  it('marks invoice paid', async () => {
    const updated = await invoiceService.markInvoicePaid('user1', 'abc');
    expect(updated).toHaveProperty('id');
  });
});

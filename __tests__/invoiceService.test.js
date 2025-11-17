// __tests__/invoiceService.test.js
const invoiceService = require('../src/services/invoiceService');

jest.mock('../src/services/appwriteClient', () => {
  return {
    databases: {
      createDocument: jest.fn().mockResolvedValue({ 
        $id: 'abc', 
        userId: 'user1',
        items: JSON.stringify([{ description: 'X', amount: 100 }]),
        subtotal: 100, 
        vat: 7.5, 
        total: 107.5,
        paid: false 
      }),
      listDocuments: jest.fn().mockResolvedValue({ 
        total: 1, 
        documents: [{ 
          $id: 'abc', 
          userId: 'user1', 
          items: JSON.stringify([{ description: 'X', amount: 100 }]),
          subtotal: 100, 
          vat: 7.5, 
          total: 107.5, 
          paid: false 
        }] 
      }),
      getDocument: jest.fn().mockResolvedValue({ 
        $id: 'abc', 
        userId: 'user1', 
        items: JSON.stringify([{ description: 'X', amount: 100 }]),
        subtotal: 100, 
        vatRate: 0.075,
        vat: 7.5, 
        total: 107.5, 
        paid: false 
      }),
      updateDocument: jest.fn().mockResolvedValue({ 
        $id: 'abc', 
        userId: 'user1',
        items: JSON.stringify([{ description: 'X', amount: 100 }]),
        subtotal: 100,
        vatRate: 0.075,
        vat: 7.5,
        total: 107.5,
        paid: true,
        paidAt: new Date().toISOString()
      }),
    },
    sdk: {
      Query: { 
        equal: jest.fn(() => ({})),
        orderDesc: jest.fn(() => ({}))
      },
      ID: { unique: jest.fn(() => 'unique-id') }
    }
  };
});

describe('invoiceService', () => {
  it('creates an invoice', async () => {
    const doc = await invoiceService.createInvoice('user1', { 
      items: [{ description: 'X', amount: 100 }],
      country: 'US' 
    });
    expect(doc).toHaveProperty('$id');
    expect(doc.subtotal).toBe(100);
    expect(doc.vat).toBe(7.5);
    expect(doc.total).toBe(107.5);
  });

  it('lists invoices', async () => {
    const docs = await invoiceService.listInvoices('user1');
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);
  });

  it('marks invoice paid', async () => {
    const updated = await invoiceService.markInvoicePaid('user1', 'abc');
    expect(updated).toHaveProperty('$id');
    expect(updated.paid).toBe(true);
    expect(updated).toHaveProperty('paidAt');
  });

  it('generates summary', async () => {
    const summary = await invoiceService.getSummary('user1');
    expect(summary).toHaveProperty('totalRevenue');
    expect(summary).toHaveProperty('totalVat');
    expect(summary).toHaveProperty('outstanding');
    expect(summary).toHaveProperty('paid');
    expect(summary).toHaveProperty('total');
  });
});

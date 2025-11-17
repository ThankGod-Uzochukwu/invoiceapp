// __tests__/invoiceController.test.js
const request = require('supertest');
const app = require('../src/app');

// Mock auth middleware to inject a fake user
jest.mock('../src/middleware/authMiddleware', () => ({
  authenticate: (req, res, next) => { req.user = { $id: 'user1', email: 'test@example.com' }; next(); }
}));

jest.mock('../src/services/invoiceService', () => ({
  createInvoice: jest.fn().mockResolvedValue({ id: 'abc' }),
  listInvoices: jest.fn().mockResolvedValue([]),
  markInvoicePaid: jest.fn().mockResolvedValue({ id: 'abc', paid: true }),
  getSummary: jest.fn().mockResolvedValue({ totalRevenue: 100, totalVat: 7.5, outstanding: 0 })
}));

describe('Invoice routes', () => {
  it('POST /invoices', async () => {
    const res = await request(app).post('/invoices').send({ items: [{ description: 'X', amount: 10 }] });
    expect(res.status).toBe(201);
  });

  it('GET /invoices', async () => {
    const res = await request(app).get('/invoices');
    expect(res.status).toBe(200);
  });

  it('POST /invoices/:id/pay', async () => {
    const res = await request(app).post('/invoices/abc/pay');
    expect(res.status).toBe(200);
  });

  it('GET /invoices/summary', async () => {
    const res = await request(app).get('/invoices/summary');
    expect(res.status).toBe(200);
  });
});

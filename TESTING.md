# API Testing Guide

This guide shows you how to test the Appwrite Finance Backend API.

## Prerequisites

- Server running on `http://localhost:4000`
- Valid Appwrite JWT token
- Tools: cURL, Postman, or any HTTP client

## Getting a JWT Token

To authenticate, you need a JWT token from Appwrite. Here's how to get one:

### Option 1: Using Appwrite Web SDK (Frontend)

```javascript
import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('your_project_id');

const account = new Account(client);

// Login
const session = await account.createEmailSession('user@example.com', 'password');
const jwt = await account.createJWT();
console.log('JWT Token:', jwt.jwt);
```

### Option 2: Using Appwrite Console

1. Go to your Appwrite Console
2. Navigate to Auth → Sessions
3. Create a session for a test user
4. Use the session to generate a JWT

## API Endpoints

### 1. Health Check (No Auth Required)

```bash
curl http://localhost:4000/health
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T...",
  "service": "appwrite-finance-backend"
}
```

### 2. Create Invoice

```bash
curl -X POST http://localhost:4000/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "description": "Web Development Services",
        "amount": 2500
      },
      {
        "description": "Consulting Hours",
        "amount": 750
      }
    ],
    "country": "US"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "$id": "abc123...",
    "userId": "user123",
    "items": [...],
    "subtotal": 3250,
    "vatRate": 0.075,
    "vat": 243.75,
    "total": 3493.75,
    "paid": false,
    "createdAt": "2025-11-17T..."
  }
}
```

### 3. List All Invoices

```bash
curl http://localhost:4000/invoices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. List Paid Invoices

```bash
curl "http://localhost:4000/invoices?status=paid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. List Unpaid Invoices

```bash
curl "http://localhost:4000/invoices?status=unpaid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### 6. Mark Invoice as Paid

```bash
curl -X POST http://localhost:4000/invoices/INVOICE_ID/pay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "message": "Invoice marked as paid",
  "data": {
    "$id": "abc123...",
    "paid": true,
    "total": 3493.75,
    "vat": 243.75,
    "paidAt": "2025-11-17T..."
  }
}
```

This will also trigger an email notification if configured.

### 7. Get Financial Summary

```bash
curl http://localhost:4000/invoices/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "totalRevenue": 15000.00,
    "totalVat": 1125.00,
    "outstandingInvoices": 3,
    "paidInvoices": 7,
    "totalInvoices": 10
  }
}
```

## Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Select `openapi.yaml` from the project root
4. Postman will create a collection with all endpoints

### Set Up Environment

1. Create a new environment in Postman
2. Add variables:
   - `base_url`: `http://localhost:4000`
   - `jwt_token`: Your JWT token
3. Use `{{base_url}}` and `{{jwt_token}}` in your requests

### Example Request

```
POST {{base_url}}/invoices
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body:
{
  "items": [
    {
      "description": "Product A",
      "amount": 100
    }
  ],
  "country": "US"
}
```

## Testing with Jest

Run the automated test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "items",
      "message": "At least one item is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Failed to mark invoice as paid",
  "message": "Not found or unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create invoice",
  "message": "Server error details..."
}
```

## Common Issues

### Issue: 401 Unauthorized

**Cause**: Invalid or expired JWT token

**Solution**: 
- Generate a new JWT token
- Ensure you're using the correct token format: `Bearer YOUR_TOKEN`
- Check that the token hasn't expired (default: 15 minutes)

### Issue: 404 Invoice Not Found

**Cause**: Invoice doesn't exist or belongs to another user

**Solution**:
- Verify the invoice ID is correct
- Ensure you're authenticated as the invoice owner
- Check that the invoice exists in the database

### Issue: Validation Error

**Cause**: Request body doesn't match the expected schema

**Solution**:
- Ensure all required fields are present
- Check data types (e.g., `amount` should be a number)
- Verify array fields have at least one item

## Sample Test Data

### Valid Invoice
```json
{
  "items": [
    {
      "description": "Consulting Services",
      "amount": 1500
    },
    {
      "description": "Software License",
      "amount": 500
    }
  ],
  "country": "GB"
}
```

### Invalid Invoice (Missing Items)
```json
{
  "items": [],
  "country": "US"
}
```

### Invalid Invoice (Negative Amount)
```json
{
  "items": [
    {
      "description": "Invalid",
      "amount": -100
    }
  ]
}
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test health endpoint
ab -n 1000 -c 10 http://localhost:4000/health

# Test with authentication (create a file with JWT)
echo "Authorization: Bearer YOUR_TOKEN" > headers.txt
ab -n 100 -c 5 -H @headers.txt http://localhost:4000/invoices
```

### Expected Performance

- Health check: < 10ms
- Create invoice: < 500ms
- List invoices: < 300ms
- Mark as paid: < 600ms (includes email trigger)
- Get summary: < 400ms

## Security Testing

### Test Authentication

```bash
# Should fail with 401
curl http://localhost:4000/invoices

# Should succeed
curl http://localhost:4000/invoices \
  -H "Authorization: Bearer VALID_TOKEN"
```

### Test Authorization

```bash
# Try to access another user's invoice
# Should fail with 404
curl -X POST http://localhost:4000/invoices/OTHER_USER_INVOICE_ID/pay \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Automated Testing

The project includes automated tests in `__tests__/` directory:

- `invoiceController.test.js` - Controller tests
- `invoiceService.test.js` - Service layer tests

These tests use mocks to avoid hitting the real Appwrite database.

## Next Steps

1. Set up continuous testing with CI/CD
2. Add integration tests with real Appwrite instance
3. Implement rate limiting tests
4. Add performance benchmarks
5. Set up monitoring and alerting

## Support

If you encounter issues:
- Check the server logs
- Verify your Appwrite configuration
- Review the [Appwrite documentation](https://appwrite.io/docs)
- Open an issue on GitHub

# 🏦 Appwrite Finance Backend API

A production-ready REST API backend for a finance management platform designed for small businesses. Built with Node.js, Express, and Appwrite, this backend powers invoice management, VAT calculations, and automated email notifications.

## ✨ Features

- **Invoice Management**: Create, list, and manage invoices with automatic VAT calculation
- **Authentication**: Secure JWT-based authentication via Appwrite
- **Payment Processing**: Mark invoices as paid with VAT recomputation
- **Email Notifications**: Automated email notifications when invoices are paid
- **Financial Summaries**: Get comprehensive financial overviews (revenue, VAT, outstanding invoices)
- **Status Filtering**: Filter invoices by paid/unpaid status
- **Clean Architecture**: Modular structure with routes, controllers, and services
- **Comprehensive Testing**: Jest test suite with unit and integration tests
- **OpenAPI Documentation**: Full API specification for easy integration

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Backend Services**: Appwrite (Database, Auth, Functions)
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Email**: Resend API (via Appwrite Functions)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v14 or higher)
- npm or yarn
- An Appwrite account ([cloud.appwrite.io](https://cloud.appwrite.io))
- A Resend account for email notifications (optional but recommended)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ThankGod-Uzochukwu/invoiceapp.git
cd invoiceapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Appwrite

#### Create an Appwrite Project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a new project
3. Note your Project ID

#### Create Database and Collections

1. **Database**: Create a new database and note the Database ID

2. **Invoices Collection**:
   - Create a collection named "invoices"
   - Add the following attributes:
     - `userId` (string, required)
     - `items` (string, required) - stores JSON
     - `country` (string, optional)
     - `subtotal` (float, required)
     - `vatRate` (float, required)
     - `vat` (float, required)
     - `total` (float, required)
     - `paid` (boolean, required, default: false)
     - `createdAt` (datetime, required)
     - `updatedAt` (datetime, required)
     - `paidAt` (datetime, optional)
   - Set permissions: Document security with user-based read/write

3. **VAT Rates Collection** (Optional):
   - Create a collection named "vat"
   - Add attributes:
     - `country` (string, required)
     - `rate` (float, required)
   - Add sample data:
     ```json
     { "country": "US", "rate": 0.075 }
     { "country": "GB", "rate": 0.20 }
     { "country": "DE", "rate": 0.19 }
     ```

#### Create API Key

1. Go to Settings → API Keys
2. Create a new API key with the following scopes:
   - `databases.read`
   - `databases.write`
   - `functions.read`
   - `functions.write`
3. Copy the API key

#### Setup Email Function (Optional)

1. Create a new function in Appwrite
2. Set runtime to Node.js
3. Upload the code from `appwrite-function-send-email/index.js`
4. Add environment variable: `RESEND_API_KEY=your_resend_key`
5. Deploy the function and note the Function ID

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```env
   PORT=4000
   NODE_ENV=development

   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT=your_project_id
   APPWRITE_API_KEY=your_api_key

   APPWRITE_DATABASE_ID=your_database_id
   APPWRITE_COLLECTION_INVOICES_ID=your_invoices_collection_id
   APPWRITE_COLLECTION_VAT_ID=your_vat_collection_id

   APPWRITE_FUNCTION_SEND_EMAIL_ID=your_function_id
   DEFAULT_VAT_RATE=0.075
   ```

### 5. Run the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:4000`

### 6. Verify Installation

Check the health endpoint:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T...",
  "service": "appwrite-finance-backend"
}
```

## 📚 API Endpoints

All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### Create Invoice
**POST** `/invoices`

Create a new invoice with automatic VAT calculation.

```json
{
  "items": [
    {
      "description": "Website Development",
      "amount": 1000
    },
    {
      "description": "Logo Design",
      "amount": 500
    }
  ],
  "country": "US"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "$id": "abc123...",
    "userId": "user123",
    "items": [...],
    "subtotal": 1500,
    "vatRate": 0.075,
    "vat": 112.50,
    "total": 1612.50,
    "paid": false,
    "createdAt": "2025-11-17T..."
  }
}
```

### List Invoices
**GET** `/invoices?status=paid|unpaid`

List all invoices for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by `paid` or `unpaid`

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### Mark Invoice as Paid
**POST** `/invoices/:id/pay`

Mark an invoice as paid, recompute VAT, and send email notification.

**Response (200):**
```json
{
  "success": true,
  "message": "Invoice marked as paid",
  "data": {
    "$id": "abc123...",
    "paid": true,
    "total": 1612.50,
    "vat": 112.50,
    "paidAt": "2025-11-17T..."
  }
}
```

### Get Financial Summary
**GET** `/invoices/summary`

Get comprehensive financial overview.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 5000.00,
    "totalVat": 375.00,
    "outstandingInvoices": 3,
    "paidInvoices": 7,
    "totalInvoices": 10
  }
}
```

### Health Check
**GET** `/health`

Check if the service is running.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T...",
  "service": "appwrite-finance-backend"
}
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

Run linting:

```bash
npm run lint
```

## 📖 API Documentation

The full OpenAPI specification is available in `openapi.yaml`. You can:

1. **Import into Postman**: Use Postman's import feature
2. **View in Swagger UI**: Use [Swagger Editor](https://editor.swagger.io/)
3. **Generate client SDKs**: Use OpenAPI Generator

## 🏗 Project Structure

```
├── src/
│   ├── app.js                  # Express app configuration
│   ├── index.js                # Server entry point
│   ├── controllers/            # Request handlers
│   │   └── invoiceController.js
│   ├── middleware/             # Custom middleware
│   │   ├── authMiddleware.js   # JWT authentication
│   │   └── validationMiddleware.js # Request validation
│   ├── routes/                 # API routes
│   │   └── invoices.js
│   ├── services/               # Business logic
│   │   ├── appwriteClient.js   # Appwrite SDK setup
│   │   └── invoiceService.js   # Invoice operations
│   └── utils/                  # Utility functions
│       └── vat.js              # VAT calculations
├── __tests__/                  # Test files
│   ├── invoiceController.test.js
│   └── invoiceService.test.js
├── appwrite-function-send-email/ # Appwrite function code
│   └── index.js
├── .env.example                # Environment variables template
├── openapi.yaml                # OpenAPI specification
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🔒 Security Best Practices

1. **Never commit `.env`**: Always use `.env.example` as template
2. **Rotate API keys**: Regularly rotate your Appwrite API keys
3. **Use HTTPS**: Always use HTTPS in production
4. **Validate inputs**: All inputs are validated using Zod schemas
5. **User isolation**: All data is scoped to authenticated users
6. **Rate limiting**: Consider adding rate limiting in production

## 🚢 Deployment

### Deploy to Production

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name finance-api
   ```

3. Use a reverse proxy (nginx or Caddy)
4. Enable SSL/TLS certificates

### Environment Variables for Production

Ensure all required variables are set:
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_COLLECTION_INVOICES_ID`
- `APPWRITE_FUNCTION_SEND_EMAIL_ID`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Backend Developer**: [ThankGod Uzochukwu](https://github.com/ThankGod-Uzochukwu)

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Missing required environment variables"
- **Solution**: Ensure all required variables in `.env.example` are set in your `.env` file

**Issue**: "401 Unauthorized"
- **Solution**: Make sure you're passing a valid JWT token in the Authorization header

**Issue**: "Failed to create invoice"
- **Solution**: Verify your Appwrite database and collection IDs are correct

**Issue**: "Email not sent"
- **Solution**: Check that `APPWRITE_FUNCTION_SEND_EMAIL_ID` is set and the function is deployed

### Getting Help

- Check the [Appwrite Documentation](https://appwrite.io/docs)
- Open an issue on GitHub
- Contact the team

## 📞 Support

For questions or support, please:
- Open an issue on GitHub
- Check the Appwrite community forums

---

**Built with ❤️ using Appwrite and Node.js**

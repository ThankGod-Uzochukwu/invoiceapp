# 🚀 Quick Start Guide

Get the Appwrite Finance Backend up and running in 5 minutes!

## Prerequisites

- Node.js 14+ installed
- Appwrite account (free at [cloud.appwrite.io](https://cloud.appwrite.io))

## Step 1: Clone & Install (30 seconds)

```bash
git clone https://github.com/ThankGod-Uzochukwu/invoiceapp.git
cd invoiceapp
npm install
```

## Step 2: Appwrite Setup (2 minutes)

### A. Create Project
1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Click "Create Project"
3. Copy your Project ID

### B. Create Database
1. Go to "Databases" → "Create Database"
2. Name it "finance_db"
3. Copy the Database ID

### C. Create Collections

**Invoices Collection:**
- Click "Create Collection" → Name: "invoices"
- Add these attributes:
  - `userId` (string, required)
  - `items` (string, required)
  - `country` (string, optional)
  - `subtotal` (float, required)
  - `vatRate` (float, required)
  - `vat` (float, required)
  - `total` (float, required)
  - `paid` (boolean, required, default: false)
  - `createdAt` (datetime, required)
  - `updatedAt` (datetime, required)
  - `paidAt` (datetime, optional)
- Set Permissions: Document security
- Copy Collection ID

**VAT Collection (Optional):**
- Click "Create Collection" → Name: "vat"
- Add attributes:
  - `country` (string, required)
  - `rate` (float, required)
- Add sample data:
  ```json
  { "country": "US", "rate": 0.075 }
  { "country": "GB", "rate": 0.20 }
  ```
- Copy Collection ID

### D. Create API Key
1. Go to Settings → API Keys
2. Create new key with these scopes:
   - `databases.read`
   - `databases.write`
   - `functions.read`
   - `functions.write`
3. Copy the API Key

### E. Deploy Email Function (Optional)
1. Go to "Functions" → "Create Function"
2. Runtime: Node.js
3. Upload code from `appwrite-function-send-email/index.js`
4. Add environment variable:
   - `RESEND_API_KEY` = your_resend_api_key (get from [resend.com](https://resend.com))
   - `FROM_EMAIL` = your-email@yourdomain.com
5. Deploy and copy Function ID

## Step 3: Configure Environment (1 minute)

```bash
# Copy template
cp .env.example .env

# Edit .env with your values
nano .env  # or use any text editor
```

Fill in these values:
```env
APPWRITE_PROJECT=your_project_id_from_step_2A
APPWRITE_API_KEY=your_api_key_from_step_2D
APPWRITE_DATABASE_ID=your_database_id_from_step_2B
APPWRITE_COLLECTION_INVOICES_ID=your_invoices_collection_id_from_step_2C
APPWRITE_COLLECTION_VAT_ID=your_vat_collection_id_from_step_2C
APPWRITE_FUNCTION_SEND_EMAIL_ID=your_function_id_from_step_2E
```

## Step 4: Run the Application (30 seconds)

```bash
# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
```
🚀 Appwrite Finance Backend API
📍 Server running on http://localhost:4000
🏥 Health check: http://localhost:4000/health
📚 Environment: development
```

## Step 5: Test the API (1 minute)

### Test Health Check
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

### Get a JWT Token

You need to authenticate users through Appwrite. Here's the quickest way:

**Option 1: Use Appwrite Console**
1. Go to Auth → Users
2. Create a test user
3. Use Appwrite SDK to generate JWT

**Option 2: Quick Test Script**
```javascript
// test-auth.js
const { Client, Account } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('YOUR_PROJECT_ID');

const account = new Account(client);

async function getToken() {
  // Create a session (login)
  const session = await account.createEmailSession('test@example.com', 'password123');
  
  // Get JWT token
  const jwt = await account.createJWT();
  console.log('JWT Token:', jwt.jwt);
}

getToken();
```

### Create Your First Invoice

```bash
curl -X POST http://localhost:4000/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "description": "Web Development",
        "amount": 1000
      }
    ],
    "country": "US"
  }'
```

Success response:
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "$id": "...",
    "subtotal": 1000,
    "vat": 75,
    "total": 1075,
    "paid": false
  }
}
```

## 🎉 You're Done!

Your finance backend is now running! Here's what you can do next:

### Available Endpoints

- ✅ `GET /health` - Health check (no auth)
- ✅ `POST /invoices` - Create invoice
- ✅ `GET /invoices` - List all invoices
- ✅ `GET /invoices?status=paid` - List paid invoices
- ✅ `GET /invoices?status=unpaid` - List unpaid invoices
- ✅ `POST /invoices/:id/pay` - Mark invoice as paid
- ✅ `GET /invoices/summary` - Get financial summary

### Next Steps

1. **Test All Endpoints**
   - Import `openapi.yaml` into Postman
   - Follow examples in `TESTING.md`

2. **Run Tests**
   ```bash
   npm test
   ```

3. **Deploy to Production**
   - See `DEPLOYMENT.md` for deployment guides
   - Configure production environment
   - Set up monitoring

4. **Integrate with Frontend**
   - Use the OpenAPI spec for API documentation
   - Implement authentication flow
   - Connect your React/Vue/Angular app

## 🆘 Troubleshooting

### "Missing required environment variables"
➡️ Check your `.env` file and ensure all variables are set

### "401 Unauthorized"
➡️ Make sure you're passing a valid JWT token in the Authorization header

### "Failed to create invoice"
➡️ Verify your Appwrite database and collection IDs are correct

### "Email not sent"
➡️ Check that `APPWRITE_FUNCTION_SEND_EMAIL_ID` is set and the function is deployed

## 📚 Documentation

For detailed information, check these guides:

- **README.md** - Full setup and API documentation
- **TESTING.md** - API testing guide with examples
- **DEPLOYMENT.md** - Production deployment guide
- **DATABASE_SCHEMA.md** - Database structure details
- **CONTRIBUTING.md** - Contribution guidelines

## 💡 Tips

- Use **Postman** for API testing (import `openapi.yaml`)
- Check **server logs** for debugging
- Run `npm test` regularly to ensure nothing breaks
- Keep your `.env` file secure (never commit it!)

## 🐛 Need Help?

- Check the logs in your terminal
- Review the [Appwrite documentation](https://appwrite.io/docs)
- Open an issue on [GitHub](https://github.com/ThankGod-Uzochukwu/invoiceapp/issues)

---

**Happy coding! 🚀**

Built with ❤️ using Node.js, Express, and Appwrite

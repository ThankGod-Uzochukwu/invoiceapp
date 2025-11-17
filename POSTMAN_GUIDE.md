# 📮 Postman Testing Guide

## Base URL
```
http://localhost:4000
```

## Authentication Header
All endpoints except `/health`, `/auth/register`, and `/auth/login` require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📍 Endpoints & Request Bodies

### 1. Register User (NEW)
```
POST http://localhost:4000/auth/register
```
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

---

### 2. Login User (NEW)
```
POST http://localhost:4000/auth/login
```
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:** Returns JWT token to use for authenticated requests

---

### 3. Get Current User Profile (NEW)
```
GET http://localhost:4000/auth/me
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```
**Body:** None

---

### 4. Logout (NEW)
```
POST http://localhost:4000/auth/logout
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```
**Body:** None

---

### 5. Health Check
```
GET http://localhost:4000/health
```
**Headers:** None  
**Body:** None

---

### 6. Create Invoice
```
POST http://localhost:4000/invoices
```
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```
**Body:**
```json
{
  "items": [
    {
      "description": "Website Development",
      "amount": 2500
    },
    {
      "description": "Logo Design",
      "amount": 500
    }
  ],
  "country": "US"
}
```

---

### 7. List All Invoices
```
GET http://localhost:4000/invoices
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```
**Body:** None

---

### 8. List Paid Invoices
```
GET http://localhost:4000/invoices?status=paid
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```
**Body:** None

---

### 9. List Unpaid Invoices
```
GET http://localhost:4000/invoices?status=unpaid
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```
**Body:** None

---

### 10. Mark Invoice as Paid
```
POST http://localhost:4000/invoices/{INVOICE_ID}/pay
```
Replace `{INVOICE_ID}` with actual invoice ID

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```
**Body:** None

---

### 11. Get Financial Summary
```
GET http://localhost:4000/invoices/summary
```
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```
**Body:** None

---

## 📦 Additional Test Bodies

### Simple Invoice (US)
```json
{
  "items": [
    {
      "description": "Monthly Subscription",
      "amount": 99.99
    }
  ],
  "country": "US"
}
```

### Multiple Items (UK)
```json
{
  "items": [
    {
      "description": "Software License",
      "amount": 500
    },
    {
      "description": "Support Package",
      "amount": 200
    },
    {
      "description": "Training",
      "amount": 300
    }
  ],
  "country": "GB"
}
```

### Large Invoice (Germany)
```json
{
  "items": [
    {
      "description": "Full Stack Development - 100 hours",
      "amount": 10000
    },
    {
      "description": "Project Management",
      "amount": 2000
    },
    {
      "description": "DevOps Setup",
      "amount": 3000
    }
  ],
  "country": "DE"
}
```

### No Country Specified
```json
{
  "items": [
    {
      "description": "Custom Development",
      "amount": 750
    }
  ]
}
```

---

## 🎯 Complete Testing Workflow

### Step 1: Register a New User
```
POST http://localhost:4000/auth/register
Body: {"email": "test@example.com", "password": "password123", "name": "Test User"}
```

### Step 2: Login to Get JWT Token
```
POST http://localhost:4000/auth/login
Body: {"email": "test@example.com", "password": "password123"}
```
**Copy the `token` from the response and use it for all subsequent requests!**

### Step 3: Create Invoices
```
POST http://localhost:4000/invoices
Headers: Authorization: Bearer YOUR_JWT_TOKEN
Body: Use any of the sample bodies above
```

### Step 4: Test Other Endpoints
- List invoices
- Mark as paid
- Get summary
- Get your profile

### Step 5: Logout When Done
```
POST http://localhost:4000/auth/logout
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

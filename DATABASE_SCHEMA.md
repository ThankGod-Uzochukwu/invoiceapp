# Appwrite Finance Backend - Database Schema

This document describes the database schema for the Appwrite Finance Backend.

## Collections

### 1. Invoices Collection

**Collection Name**: `invoices`

**Attributes**:

| Attribute   | Type     | Required | Default | Description                          |
|-------------|----------|----------|---------|--------------------------------------|
| userId      | string   | Yes      | -       | ID of the user who owns the invoice |
| items       | string   | Yes      | -       | JSON string of invoice line items    |
| country     | string   | No       | 'US'    | Country code for VAT calculation     |
| subtotal    | float    | Yes      | -       | Subtotal before VAT                  |
| vatRate     | float    | Yes      | 0.075   | VAT rate applied                     |
| vat         | float    | Yes      | -       | VAT amount                           |
| total       | float    | Yes      | -       | Total amount (subtotal + VAT)        |
| paid        | boolean  | Yes      | false   | Payment status                       |
| createdAt   | datetime | Yes      | -       | Invoice creation timestamp           |
| updatedAt   | datetime | Yes      | -       | Last update timestamp                |
| paidAt      | datetime | No       | -       | Payment timestamp                    |

**Indexes**:
- Create index on `userId` for efficient user-based queries
- Create index on `paid` for status filtering
- Create index on `createdAt` for sorting

**Permissions**:
- Read: `read("user:{userId}")`
- Write: `write("user:{userId}")`

**Example Document**:
```json
{
  "$id": "abc123def456",
  "userId": "user123",
  "items": "[{\"description\":\"Website Development\",\"amount\":1000},{\"description\":\"Logo Design\",\"amount\":500}]",
  "country": "US",
  "subtotal": 1500.00,
  "vatRate": 0.075,
  "vat": 112.50,
  "total": 1612.50,
  "paid": false,
  "createdAt": "2025-11-17T10:30:00.000Z",
  "updatedAt": "2025-11-17T10:30:00.000Z",
  "paidAt": null
}
```

### 2. VAT Rates Collection

**Collection Name**: `vat`

**Attributes**:

| Attribute | Type   | Required | Default | Description                      |
|-----------|--------|----------|---------|----------------------------------|
| country   | string | Yes      | -       | Country code (ISO 3166-1 alpha-2)|
| rate      | float  | Yes      | -       | VAT rate as decimal (0.20 = 20%) |
| name      | string | No       | -       | Country name                     |

**Indexes**:
- Create unique index on `country`

**Permissions**:
- Read: Public (all users can read VAT rates)
- Write: Admin only

**Sample Data**:
```json
[
  { "country": "US", "rate": 0.075, "name": "United States" },
  { "country": "GB", "rate": 0.20, "name": "United Kingdom" },
  { "country": "DE", "rate": 0.19, "name": "Germany" },
  { "country": "FR", "rate": 0.20, "name": "France" },
  { "country": "IT", "rate": 0.22, "name": "Italy" },
  { "country": "ES", "rate": 0.21, "name": "Spain" },
  { "country": "CA", "rate": 0.05, "name": "Canada" },
  { "country": "AU", "rate": 0.10, "name": "Australia" }
]
```

## Setup Instructions

### Using Appwrite Console

1. **Create Database**:
   - Go to your Appwrite Console
   - Navigate to Databases
   - Click "Create Database"
   - Name it (e.g., "finance_db")
   - Copy the Database ID to your `.env` file

2. **Create Invoices Collection**:
   - Click "Create Collection"
   - Name: "invoices"
   - Add all attributes listed above
   - Set permissions for document security
   - Create indexes as specified
   - Copy the Collection ID to your `.env` file

3. **Create VAT Collection**:
   - Click "Create Collection"
   - Name: "vat"
   - Add all attributes listed above
   - Set read permissions to public
   - Add sample VAT rate data
   - Copy the Collection ID to your `.env` file

### Using Appwrite CLI (Advanced)

You can also use the Appwrite CLI to set up your database programmatically. See the [Appwrite CLI documentation](https://appwrite.io/docs/command-line) for details.

## Data Validation

The application performs validation at multiple levels:

1. **API Level**: Zod schemas validate request payloads
2. **Service Level**: Business logic validates data before database operations
3. **Database Level**: Appwrite attribute constraints ensure data integrity

## Security Considerations

- All invoice data is scoped to individual users
- Users can only access their own invoices
- VAT rates are read-only for regular users
- JWT tokens are validated on every request
- Sensitive data is never logged or exposed

## Backup and Recovery

Recommended practices:
- Enable Appwrite's automated backups
- Export data regularly for compliance
- Test recovery procedures periodically
- Keep audit logs of all financial transactions

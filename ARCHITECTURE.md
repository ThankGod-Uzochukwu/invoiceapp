# Architecture Overview

This document provides a visual overview of the Appwrite Finance Backend architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│  (Frontend App / Postman / cURL / Mobile App)                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS + JWT
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                     EXPRESS API SERVER                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Middleware Layer                                          │ │
│  │  • CORS                                                    │ │
│  │  • Body Parser                                             │ │
│  │  • Request Logging                                         │ │
│  │  • Authentication (JWT)                                    │ │
│  │  • Validation (Zod)                                        │ │
│  │  • Error Handler                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Routes Layer                                              │ │
│  │  GET    /health         → Health Check                     │ │
│  │  POST   /invoices       → Create Invoice                   │ │
│  │  GET    /invoices       → List Invoices                    │ │
│  │  POST   /invoices/:id/pay → Mark as Paid                   │ │
│  │  GET    /invoices/summary → Get Summary                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Controllers Layer                                         │ │
│  │  • Request Validation                                      │ │
│  │  • Response Formatting                                     │ │
│  │  • Error Handling                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Services Layer (Business Logic)                          │ │
│  │  • Invoice Operations                                      │ │
│  │  • VAT Calculations                                        │ │
│  │  • Data Validation                                         │ │
│  │  • Summary Generation                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   APPWRITE BACKEND        │   │  APPWRITE FUNCTIONS       │
│                           │   │                           │
│  ┌─────────────────────┐  │   │  ┌─────────────────────┐  │
│  │  Database           │  │   │  │  Email Function     │  │
│  │  • Invoices         │  │   │  │  (Node.js)          │  │
│  │  • VAT Rates        │  │   │  │                     │  │
│  │  • User Data        │  │   │  │  Resend API         │  │
│  └─────────────────────┘  │   │  └─────────────────────┘  │
│                           │   │                           │
│  ┌─────────────────────┐  │   └───────────────────────────┘
│  │  Authentication     │  │
│  │  • JWT Generation   │  │
│  │  • Session Mgmt     │  │
│  └─────────────────────┘  │
└───────────────────────────┘
```

## Request Flow

### 1. Create Invoice Flow

```
┌────────┐    POST /invoices     ┌─────────────┐
│ Client │ ──────────────────────▶│   Express   │
└────────┘   + JWT Token          │   Server    │
                                  └──────┬──────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Auth         │
                                  │ Middleware   │
                                  └──────┬───────┘
                                         │ Verify JWT
                                         ▼
                                  ┌──────────────┐
                                  │ Validation   │
                                  │ Middleware   │
                                  └──────┬───────┘
                                         │ Validate Input
                                         ▼
                                  ┌──────────────────┐
                                  │ Invoice          │
                                  │ Controller       │
                                  └──────┬───────────┘
                                         │
                                         ▼
                                  ┌──────────────────┐
                                  │ Invoice Service  │
                                  │ • Get VAT Rate   │
                                  │ • Calculate VAT  │
                                  │ • Create Doc     │
                                  └──────┬───────────┘
                                         │
                                         ▼
                                  ┌──────────────────┐
                                  │ Appwrite DB      │
                                  │ Save Invoice     │
                                  └──────┬───────────┘
                                         │
                                         ▼
                                  ┌──────────────────┐
                                  │ Return Response  │
                                  │ {success, data}  │
                                  └──────────────────┘
```

### 2. Mark as Paid Flow

```
┌────────┐  POST /invoices/:id/pay  ┌──────────┐
│ Client │ ───────────────────────▶ │  Server  │
└────────┘                           └─────┬────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Authenticate │
                                    │ & Validate   │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Get Invoice  │
                                    │ from DB      │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Verify       │
                                    │ Ownership    │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Recompute    │
                                    │ VAT & Total  │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Update       │
                                    │ paid = true  │
                                    └──────┬───────┘
                                           │
                                     ┌─────┴─────┐
                                     │           │
                                     ▼           ▼
                              ┌────────────┐  ┌────────────┐
                              │ Trigger    │  │ Return     │
                              │ Email      │  │ Response   │
                              │ Function   │  └────────────┘
                              └────┬───────┘
                                   │
                                   ▼
                              ┌────────────┐
                              │ Send Email │
                              │ via Resend │
                              └────────────┘
```

## Data Flow

### Invoice Object Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    INVOICE LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

1. CREATE
   ┌──────────────────────────────────────────┐
   │  Input                                   │
   │  • items: [{description, amount}]        │
   │  • country: "US"                         │
   └──────────────────┬───────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────┐
   │  Processing                              │
   │  • Calculate subtotal                    │
   │  • Lookup VAT rate for country           │
   │  • Calculate VAT amount                  │
   │  • Calculate total                       │
   └──────────────────┬───────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────┐
   │  Output (Invoice Object)                 │
   │  {                                       │
   │    $id: "abc123",                        │
   │    userId: "user123",                    │
   │    items: [...],                         │
   │    subtotal: 1000,                       │
   │    vatRate: 0.075,                       │
   │    vat: 75,                              │
   │    total: 1075,                          │
   │    paid: false,                          │
   │    createdAt: "2025-11-17T...",          │
   │    updatedAt: "2025-11-17T..."           │
   │  }                                       │
   └──────────────────────────────────────────┘

2. MARK AS PAID
   ┌──────────────────────────────────────────┐
   │  Input                                   │
   │  • invoiceId: "abc123"                   │
   │  • userId: "user123"                     │
   └──────────────────┬───────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────┐
   │  Processing                              │
   │  • Fetch existing invoice                │
   │  • Verify ownership                      │
   │  • Recompute VAT (in case rate changed)  │
   │  • Update paid status                    │
   │  • Trigger email notification            │
   └──────────────────┬───────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────┐
   │  Output (Updated Invoice)                │
   │  {                                       │
   │    ...previous fields,                   │
   │    paid: true,                           │
   │    paidAt: "2025-11-17T...",             │
   │    updatedAt: "2025-11-17T..."           │
   │  }                                       │
   └──────────────────────────────────────────┘
```

## Component Interaction

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Routes    │ ────▶ │ Controllers │ ────▶ │  Services   │
│             │       │             │       │             │
│ • Define    │       │ • Handle    │       │ • Business  │
│   endpoints │       │   requests  │       │   logic     │
│ • Apply     │       │ • Format    │       │ • Data      │
│   middleware│       │   responses │       │   access    │
└─────────────┘       └─────────────┘       └──────┬──────┘
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │  Appwrite   │
                                             │  SDK        │
                                             │             │
                                             │ • Database  │
                                             │ • Functions │
                                             └─────────────┘
```

## Security Layers

```
┌────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└────────────────────────────────────────────────────────────┘

Layer 1: Network
├─ HTTPS/TLS Encryption
├─ CORS Configuration
└─ Rate Limiting (recommended)

Layer 2: Authentication
├─ JWT Token Validation
├─ Appwrite Auth Integration
└─ Session Management

Layer 3: Authorization
├─ User-Scoped Data Access
├─ Ownership Verification
└─ Appwrite Permissions

Layer 4: Input Validation
├─ Zod Schema Validation
├─ Type Checking
└─ Sanitization

Layer 5: Data Protection
├─ Environment Variables for Secrets
├─ No Sensitive Data in Logs
└─ Secure Database Connections
```

## Deployment Architecture (Production)

```
┌───────────────────────────────────────────────────────────┐
│                    INTERNET                                │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  Load Balancer / CDN                      │
│                  (CloudFlare / AWS ELB)                   │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    Reverse Proxy                          │
│                    (nginx / Caddy)                        │
│  • SSL Termination                                        │
│  • Static File Serving                                    │
│  • Request Routing                                        │
└──────────────────────────┬───────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌─────────────────┐       ┌─────────────────┐
    │  Node Instance 1│       │  Node Instance 2│
    │  (PM2 / Docker) │       │  (PM2 / Docker) │
    └────────┬────────┘       └────────┬────────┘
             │                         │
             └────────────┬────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Appwrite Cloud      │
              │   • Database          │
              │   • Authentication    │
              │   • Functions         │
              └───────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────┐
│                   ERROR HANDLING                         │
└─────────────────────────────────────────────────────────┘

Request
   │
   ▼
Try/Catch in Controller
   │
   ├─ Success ─────────────────────▶ Return Success Response
   │                                 {success: true, data}
   │
   └─ Error
      │
      ▼
   Identify Error Type
      │
      ├─ Validation Error ────────▶ 400 Bad Request
      │
      ├─ Auth Error ──────────────▶ 401 Unauthorized
      │
      ├─ Not Found ───────────────▶ 404 Not Found
      │
      ├─ Business Logic Error ────▶ 400 Bad Request
      │
      └─ Unknown Error ───────────▶ 500 Internal Server Error
                                      │
                                      ▼
                                  Log Error Details
                                      │
                                      ▼
                                  Return Error Response
                                  {success: false, error, message}
```

## Testing Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   TESTING PYRAMID                        │
└─────────────────────────────────────────────────────────┘

        ┌──────────────────┐
        │  E2E Tests       │  ← Integration with real Appwrite
        │  (Future)        │
        └──────────────────┘
             ▲
        ┌────────────────────┐
        │ Integration Tests  │  ← API endpoint tests
        │ (Controller Tests) │     with mocked services
        └────────────────────┘
             ▲
        ┌──────────────────────┐
        │    Unit Tests        │  ← Service & utility tests
        │  (Service Tests)     │     with mocked Appwrite SDK
        └──────────────────────┘
```

## Monitoring & Observability (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│              OBSERVABILITY STACK                         │
└─────────────────────────────────────────────────────────┘

Application
    │
    ├─ Logs ──────────────────▶ Winston/Pino ──▶ CloudWatch/ELK
    │
    ├─ Metrics ───────────────▶ Prometheus ─────▶ Grafana
    │
    ├─ Traces ────────────────▶ Jaeger/Zipkin
    │
    └─ Errors ────────────────▶ Sentry/Rollbar
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  Alert System   │
                            │  • Slack        │
                            │  • Email        │
                            │  • PagerDuty    │
                            └─────────────────┘
```

---

This architecture provides:
- ✅ Scalability through horizontal scaling
- ✅ Reliability through error handling
- ✅ Security through multiple layers
- ✅ Maintainability through clean architecture
- ✅ Observability through logging and monitoring

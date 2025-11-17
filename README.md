# Appwrite Finance Backend (JavaScript + Zod)

This repository provides a backend API for invoices using Appwrite as the persistence and auth provider. It includes:

- Plain JavaScript Express server
- Appwrite SDK integration (Databases, Functions, Storage)
- Invoice endpoints: create, list (paid/unpaid), mark-paid (recompute VAT + send email via Appwrite Function), summary
- Zod validation for incoming requests
- OpenAPI (Swagger) spec (`openapi.yaml`)
- Example Jest tests for services and controllers
- GitHub Actions CI that runs tests and lint
- Appwrite Function example that sends email using Resend (index.js in `appwrite-function-send-email`)

## Setup
1. Copy `.env.example` to `.env` and fill out values.
2. `npm install`
3. `npm run dev` to run in dev with nodemon, or `npm start`.
4. Run tests with `npm test`.

## API Endpoints
- `POST /invoices` — Create invoice. Body: `{ items: [{ description, amount }], country?: string }`.
- `GET /invoices?status=paid|unpaid` — List invoices (scoped to authenticated user).
- `POST /invoices/:id/pay` — Mark invoice as paid (triggers VAT recompute + notification).
- `GET /invoices/summary` — Get totals: revenue, VAT, outstanding invoices.

All requests require `Authorization: Bearer <jwt>` where the JWT is the Appwrite client session token.

## OpenAPI
See `openapi.yaml` for a full specification — suitable for import into Postman or Swagger UI.

## CI
A GitHub Actions workflow is included at `.github/workflows/ci.yml` that runs `npm ci`, `npm test`, and `npm run lint` on push and pull requests.
# invoiceapp
# invoiceapp
# invoiceapp
# invoiceapp

# DealDesk Backend API

Scalable, multi-tenant Express & Node.js backend providing centralized REST APIs for the DealDesk Real Estate Workspace.

## Tech Stack
- Node.js (ES Modules, `import`/`export`)
- Express.js
- MongoDB & Mongoose ORM
- JSON Web Tokens (JWT) & bcryptjs
- Razorpay Subscription & Webhook verification
- Cloudinary Media SDK
- Helmet, Rate Limiter, and Strict Business Isolation Middleware

## Features
- **Strict Multi-Tenancy**: Every resource is scoped by `businessId`.
- **RBAC**: Admin, Agent (assigned data only), and Superadmin (platform level).
- **Entitlement Checks**: Server-side enforcement of 3-Day Free Trial & Subscription active status.
- **Smart Match Engine**: Weighted algorithm matching Leads and Properties.
- **Smart QR Engine**: Dynamic redirect and replacement inventory fallback.
- **Auditing**: Comprehensive audit trail for sensitive administrative operations.
- **Controlled Support Access**: Temporary, reason-bound access for platform operators.

## Running Locally
```bash
npm install
npm run seed  # Seeds initial platform admin, plans & sample workspace
npm run dev   # Starts on port 5000
```

## API Health Check
```bash
curl http://localhost:5000/api/health
```

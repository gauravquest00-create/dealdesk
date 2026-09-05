# DealDesk — Smart Workspace for Real Estate Deals

> **“Every property. Every lead. Every deal. One workspace.”**

DealDesk is a production-ready, international SaaS platform purpose-built for high-velocity real estate brokerages and commercial dealmakers. It is designed from the ground up around properties as the core source of truth, automated Smart QR lead acquisition, 7-factor weighted match scoring, viewing feedback capture, and pipeline execution.

---

## 🏗️ Architecture & Monorepo Structure

```text
dealdesk/
├── backend/            # Express.js (ES Modules), MongoDB/Mongoose, JWT, Razorpay, Cloudinary
├── landing/            # React + Vite public portal, i18n, currency converter, 6-step onboarding
├── dashboard/          # React + Vite PWA operational deal room (Dual Admin & Agent personas)
├── superadmin/         # React + Vite platform administration portal & controlled support access
├── render.yaml         # Render Infrastructure-as-Code deployment specification
├── README.md           # Master documentation
└── .gitignore          # Root repository git ignore
```

---

## ⚡ Key Highlights & Core Capabilities

1. **Strict Multi-Tenancy Data Isolation**: Every resource (Properties, Leads, Viewings, Open Houses, QRs, Documents, Deals) is bound to an immutable `businessId`.
2. **Dual Persona Role-Based Access (RBAC)**:
   - **Admin**: Full brokerage snapshot, team oversight, credential generation, and billing controls.
   - **Agent**: Strictly restricted to assigned records with limited preview protection for unassigned properties.
3. **Smart Dynamic QR Engine**: Reassign physical boards to new properties without reprinting. Sold properties automatically activate fallback replacement inventory matching project and configuration.
4. **7-Factor Smart Match Engine**: Multi-variable weighting across Budget (30%), Location (25%), Configuration (20%), Property Type (10%), Size (5%), Transaction (5%), and Other (5%).
5. **Viewing Reports & Scoring**: Capture viewing feedback, client decisions, and objections to dynamically update lead temperature (Cold, Warm, Hot) and numeric deal scores.
6. **WhatsApp & Email Communications Studio**: Personalized templates with granular property details visibility toggles.
7. **PWA Mobile Experience**: Native-feeling mobile bottom navigation, service workers, standalone viewport support, and touch optimization.
8. **Automated 3-Day Free Trial & Razorpay Subscriptions**: Server-side entitlement checks lock expired workspaces while preserving all data.

---

## 🚀 Quick Start (Local Development)

### 1. Backend Service
```bash
cd backend
npm install
npm run seed     # Seeds platform SuperAdmin and sample demo workspace
npm run dev      # Starts API on http://localhost:5000
```

### 2. Public Acquisition & Landing
```bash
cd landing
npm install
npm run dev      # Runs on http://localhost:5175
```

### 3. Brokerage Workspace Dashboard (PWA)
```bash
cd dashboard
npm install
npm run dev      # Runs on http://localhost:5173
```

### 4. Platform SuperAdmin Console
```bash
cd superadmin
npm install
npm run dev      # Runs on http://localhost:5174
```

---

## 🔐 Credentials & Default Accounts

- **Platform SuperAdmin**: `admin@dealdesk.com` / `dealdesk@2026!Secure`
- **Brokerage Admin (Demo)**: `demo@gurgaonprimerealty.com` / `Admin@123456`
- **Sales Consultant (Agent Demo)**: `rahulsharma.gurgaonprimerealty@dealdesk.com` / `Agent@123456`

---

## 🌐 Production Deployment

### Backend (Render)
- Deploy `/backend` as a Web Service.
- Set `Root Directory` to `backend`.
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables as listed in `backend/.env.example`.

### Frontends (Vercel)
- Deploy `/landing`, `/dashboard`, and `/superadmin` as independent Vercel projects.
- Framework Preset: `Vite`
- Root Directory: `landing` (or `dashboard` / `superadmin`)
- Environment variable: `VITE_API_BASE_URL=https://api.yourdomain.com/api`
- All projects include preconfigured `vercel.json` for single-page app rewrite handling.

---

## 📄 License
Commercial Enterprise SaaS. © 2026 DealDesk. All rights reserved.

import { Router } from 'express';
import * as saCtrl from '../controllers/superadminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../constants/roles.js';

const router = Router();
router.use(authenticate, requireRoles([ROLES.SUPERADMIN]));

// ============================================================
// 🚨 CRITICAL: Specific routes first, dynamic routes last
// ============================================================

// 📊 Dashboard metrics
router.get('/metrics', saCtrl.getMetrics);

// 🏢 Businesses - specific routes
router.get('/businesses/new', saCtrl.getNewBusinessForm);   // ✅ NEW (specific)
router.post('/businesses', saCtrl.createBusiness);           // ✅ CREATE

// 🏢 Businesses - list & dynamic routes
router.get('/businesses', saCtrl.listBusinesses);            // ✅ LIST
router.get('/businesses/:id', saCtrl.getBusinessDetail);     // ✅ DETAIL (dynamic)
router.put('/businesses/:id', saCtrl.updateBusiness);        // ✅ UPDATE
router.post('/businesses/:id/suspend', saCtrl.toggleSuspension);
router.post('/businesses/:id/support-access', saCtrl.startSupportAccess);

// 💳 Billing / Orders (for creating business with payment)
router.post('/businesses/:id/create-order', saCtrl.createOrderForBusiness);
router.post('/businesses/:id/verify-payment', saCtrl.verifyPaymentForBusiness);

// 📋 Plans
router.get('/plans', saCtrl.listPlans);
router.post('/plans', saCtrl.createPlan);
router.put('/plans/:id', saCtrl.updatePlan);
router.delete('/plans/:id', saCtrl.deletePlan);

// 💰 Subscriptions & Payments
router.get('/subscriptions', saCtrl.listSubscriptions);
router.get('/payments', saCtrl.listPayments);

// 🔐 Audit Logs
router.get('/audit-logs', saCtrl.listAuditLogs);

export default router;
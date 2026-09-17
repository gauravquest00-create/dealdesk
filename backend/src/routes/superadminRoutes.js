import { Router } from 'express';
import * as saCtrl from '../controllers/superadminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../constants/roles.js';
import { resetBusinessAdminPassword } from '../controllers/superadminController.js';

const router = Router();

// ✅ All routes require SUPERADMIN – no need for extra requireSuperAdmin
router.use(authenticate, requireRoles([ROLES.SUPERADMIN]));

// ============================================================
// 🚨 CRITICAL: Specific routes first, dynamic routes last
// ============================================================

// 📊 Dashboard metrics
router.get('/metrics', saCtrl.getMetrics);

// 🏢 Businesses - specific routes
router.get('/businesses/new', saCtrl.getNewBusinessForm);
router.post('/businesses', saCtrl.createBusiness);

// 🏢 Businesses - list & dynamic routes
router.get('/businesses', saCtrl.listBusinesses);
router.get('/businesses/:id', saCtrl.getBusinessDetail);
router.put('/businesses/:id', saCtrl.updateBusiness);
router.post('/businesses/:id/suspend', saCtrl.toggleSuspension);
router.post('/businesses/:id/support-access', saCtrl.startSupportAccess);

// 🔥 Reset Business Password (must come BEFORE /:id if using same verb? No, POST vs GET – safe)
router.post('/businesses/:businessId/reset-password', resetBusinessAdminPassword);

// 💳 Billing / Orders
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

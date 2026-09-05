import { Router } from 'express';
import * as billCtrl from '../controllers/billingController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkLimitMiddleware } from '../middleware/limitChecker.js';

const router = Router();

// Public route
router.get('/plans', billCtrl.getPlans);

// Protected routes
router.use(authenticate, enforceBusinessScope);

router.get('/status', billCtrl.getBillingStatus);
router.post('/order', billCtrl.createOrder);
router.post('/verify', billCtrl.verifyPayment);

// Optional: route to check a specific limit for frontend
router.get('/check-limit/:resource', async (req, res, next) => {
  try {
    const { resource } = req.params;
    const result = await import('../middleware/limitChecker.js').then(m => m.checkLimit(req.businessId, resource));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
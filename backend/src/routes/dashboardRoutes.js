import { Router } from 'express';
import * as dashCtrl from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';

const router = Router();
router.use(authenticate, enforceBusinessScope, checkEntitlement);

router.get('/', dashCtrl.getDashboardMetrics);

export default router;

import { Router } from 'express';
import * as matchCtrl from '../controllers/matchController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';

const router = Router();
router.use(authenticate, enforceBusinessScope, checkEntitlement);

router.get('/property/:propertyId', matchCtrl.getMatchesForProperty);
router.get('/lead/:leadId', matchCtrl.getMatchesForLead);

export default router;

import { Router } from 'express';
import * as dealCtrl from '../controllers/dealController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';

const router = Router();
router.use(authenticate, enforceBusinessScope, checkEntitlement);

router.get('/', dealCtrl.listDeals);
router.post('/', dealCtrl.createDeal);
router.put('/:id', dealCtrl.updateDeal);

export default router;

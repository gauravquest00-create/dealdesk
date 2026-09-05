import { Router } from 'express';
import * as viewingCtrl from '../controllers/viewingController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';

const router = Router();
router.use(authenticate, enforceBusinessScope, checkEntitlement);

router.get('/', viewingCtrl.listViewings);
router.post('/', viewingCtrl.scheduleViewing);
router.post('/:id/report', viewingCtrl.submitViewingReport);

export default router;

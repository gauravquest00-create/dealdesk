import { Router } from 'express';
import * as ohCtrl from '../controllers/openHouseController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';
import { checkBusinessAccess } from '../middleware/checkBusinessAccess.js';

const router = Router();

// Public visitor registration
router.post('/public/register', ohCtrl.publicRegisterVisitor);

// Protected
router.use(authenticate, enforceBusinessScope, checkEntitlement);
router.use(checkBusinessAccess);

router.get('/', ohCtrl.listOpenHouses);
router.post('/', ohCtrl.createOpenHouse);

export default router;

import { Router } from 'express';
import * as bizCtrl from '../controllers/businessController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../constants/roles.js';

const router = Router();
router.use(authenticate, enforceBusinessScope, checkEntitlement);

router.get('/', bizCtrl.getBusiness);
router.put('/', requireRoles([ROLES.ADMIN]), bizCtrl.updateBusiness);

export default router;

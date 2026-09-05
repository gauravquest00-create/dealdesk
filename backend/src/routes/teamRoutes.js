import { Router } from 'express';
import * as teamCtrl from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../constants/roles.js';
import { checkLimitMiddleware } from '../middleware/limitChecker.js';

const router = Router();

// All routes require auth, business scope, entitlement, and admin role
router.use(authenticate, enforceBusinessScope, checkEntitlement, requireRoles([ROLES.ADMIN]));

router.get('/', teamCtrl.listTeam);

// ✅ Add limit check before creating agent
router.post('/', checkLimitMiddleware('agents'), teamCtrl.addAgent);

// ✅ Update agent (status, permissions, role, etc.)
router.put('/:id', teamCtrl.updateAgentStatus);

// ✅ Toggle agent active/inactive status
router.put('/:id/toggle-status', teamCtrl.toggleAgentStatus);

export default router;
import { Router } from 'express';
import * as commCtrl from '../controllers/communicationController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';

const router = Router();
router.use(authenticate, enforceBusinessScope, checkEntitlement);

router.get('/templates', commCtrl.listTemplates);
router.post('/draft', commCtrl.generateDraft);
router.post('/send', commCtrl.logOutreach);
router.get('/history', commCtrl.listHistory);

// Campaign Routes
router.get('/campaigns', commCtrl.listCampaigns);
router.post('/campaigns', commCtrl.createCampaign);

export default router;

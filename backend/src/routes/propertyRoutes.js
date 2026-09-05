import { Router } from 'express';
import * as propCtrl from '../controllers/propertyController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';

const router = Router();
router.use(authenticate, enforceBusinessScope, checkEntitlement);

router.get('/', propCtrl.listProperties);
router.post('/', propCtrl.createProperty);
router.get('/:id', propCtrl.getProperty);
router.put('/:id', propCtrl.updateProperty);
router.delete('/:id', propCtrl.deleteProperty);
router.get('/:id/replacement-recommendations', propCtrl.getReplacementRecommendations);

export default router;

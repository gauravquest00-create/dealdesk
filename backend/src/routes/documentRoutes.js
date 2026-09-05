import { Router } from 'express';
import * as docCtrl from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkEntitlement } from '../middleware/entitlement.js';

const router = Router();
router.use(authenticate, enforceBusinessScope, checkEntitlement);

router.get('/', docCtrl.listDocuments);
router.post('/', docCtrl.createDocument);
router.get('/checklist/:propertyId', docCtrl.getChecklist);

export default router;

import express from 'express';
import * as qrCtrl from '../controllers/qrController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkLimitMiddleware } from '../middleware/limitChecker.js';
import { checkBusinessAccess } from '../middleware/checkBusinessAccess.js';

const router = express.Router();

// Public routes (no auth)
router.get('/public/resolve/:qrId', qrCtrl.resolveQR);
router.post('/public/enquiry', qrCtrl.submitPublicEnquiry);

// Protected routes
router.use(authenticate);
router.use(enforceBusinessScope);
router.use(checkBusinessAccess);

router.post('/', checkLimitMiddleware('qrs'), qrCtrl.createOrReassignQR);
router.get('/', qrCtrl.listQRs);
router.get('/:qrId', qrCtrl.getQR);
router.put('/:qrId', qrCtrl.updateQR);
router.delete('/:qrId', qrCtrl.deleteQR);

export default router;

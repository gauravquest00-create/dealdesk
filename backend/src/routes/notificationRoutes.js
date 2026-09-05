import { Router } from 'express';
import * as notifCtrl from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';

const router = Router();
router.use(authenticate, enforceBusinessScope);

router.get('/', notifCtrl.listNotifications);
router.put('/:id/read', notifCtrl.markAsRead);
router.put('/read-all', notifCtrl.markAllAsRead);

export default router;

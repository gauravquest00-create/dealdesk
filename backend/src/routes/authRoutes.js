import { Router } from 'express';
import * as authCtrl from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.get('/me', authenticate, authCtrl.me);
router.post('/change-password', authenticate, authCtrl.changePassword);

export default router;

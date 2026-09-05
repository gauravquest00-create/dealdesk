import { Router } from 'express';
import * as healthCtrl from '../controllers/healthController.js';

const router = Router();
router.get('/', healthCtrl.checkHealth);

export default router;

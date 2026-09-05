import { Router } from 'express';
import authRoutes from './authRoutes.js';
import businessRoutes from './businessRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import leadRoutes from './leadRoutes.js';
import matchRoutes from './matchRoutes.js';
import viewingRoutes from './viewingRoutes.js';
import qrRoutes from './qrRoutes.js';
import openHouseRoutes from './openHouseRoutes.js';
import communicationRoutes from './communicationRoutes.js';
import dealRoutes from './dealRoutes.js';
import teamRoutes from './teamRoutes.js';
import documentRoutes from './documentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import billingRoutes from './billingRoutes.js';
import superadminRoutes from './superadminRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import healthRoutes from './healthRoutes.js';
import socialLinkRoutes from './socialLinkRoutes.js';
// ✅ Import publicCreateLead from leadController
import { publicCreateLead } from '../controllers/leadController.js';

const router = Router();

// ============================================================
// 🔓 PUBLIC ROUTES (No authentication required)
// ============================================================
router.post('/public/leads', publicCreateLead);

// ============================================================
// 🔒 PROTECTED ROUTES (Authentication required)
// ============================================================
router.use('/auth', authRoutes);
router.use('/business', businessRoutes);
router.use('/properties', propertyRoutes);
router.use('/leads', leadRoutes);
router.use('/matches', matchRoutes);
router.use('/viewings', viewingRoutes);
router.use('/qr', qrRoutes);
router.use('/open-houses', openHouseRoutes);
router.use('/communications', communicationRoutes);
router.use('/deals', dealRoutes);
router.use('/team', teamRoutes);
router.use('/documents', documentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/billing', billingRoutes);
router.use('/superadmin', superadminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/upload', uploadRoutes);
router.use('/health', healthRoutes);
router.use('/social-links', socialLinkRoutes);

export default router;
import express from 'express';
import {
  listLeads,
  getLead,
  createLead,
  publicCreateLead,
  updateLead,
  updateLeadStatus,
  updateLeadTemperature,
  deleteLead,
  bulkUpdateLeads,
  getLeadStats,
  assignLead,
} from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkBusinessAccess } from '../middleware/checkBusinessAccess.js';

const router = express.Router();

// ============================================================
// PUBLIC ROUTE (No auth)
// ============================================================
router.post('/public/leads', publicCreateLead);

// ============================================================
// PROTECTED ROUTES (Auth + Business Scope + Access Check)
// ============================================================
router.use(authenticate);
router.use(enforceBusinessScope);
router.use(checkBusinessAccess); // ✅ ADD THIS — blocks expired/suspended accounts

router.get('/', listLeads);
router.get('/stats', getLeadStats);
router.get('/:id', getLead);
router.post('/', createLead);
router.put('/:id', updateLead);
router.put('/:id/status', updateLeadStatus);
router.put('/:id/temperature', updateLeadTemperature);
router.put('/:id/assign', assignLead);
router.delete('/:id', deleteLead);
router.post('/bulk-update', bulkUpdateLeads);

export default router;

import express from 'express';
import {
  createSocialLink,
  listSocialLinks,
  getSocialLink,
  getSocialLinkBySlug,
  updateSocialLink,
  deleteSocialLink,
  reactivateSocialLink,
  getSocialLinkLeads,
} from '../controllers/socialLinkController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceBusinessScope } from '../middleware/businessScope.js';
import { checkLimitMiddleware } from '../middleware/limitChecker.js';
import { checkBusinessAccess } from '../middleware/checkBusinessAccess.js';

const router = express.Router();

// PUBLIC ROUTE - No auth
router.get('/slug/:slug', getSocialLinkBySlug);

// PROTECTED ROUTES
router.use(authenticate);
router.use(enforceBusinessScope);
router.use(checkBusinessAccess);

// ✅ Add limit check before creating a social link
router.post('/', checkLimitMiddleware('socialLinks'), createSocialLink);

router.get('/', listSocialLinks);
router.get('/:id', getSocialLink);
router.put('/:id', updateSocialLink);
router.put('/:id/reactivate', reactivateSocialLink);
router.delete('/:id', deleteSocialLink);
router.get('/:id/leads', getSocialLinkLeads);

export default router;

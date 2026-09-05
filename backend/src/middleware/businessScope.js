import { ROLES } from '../constants/roles.js';

/**
 * Ensures queries are strictly scoped to the authenticated user's businessId.
 * Never trusts businessId or agentId passed in the client request body or query params.
 */
export const enforceBusinessScope = (req, res, next) => {
  if (req.user && req.user.role === ROLES.SUPERADMIN) {
    return next();
  }

  if (!req.businessId) {
    return res.status(403).json({
      success: false,
      message: 'Business context missing',
      code: 'MISSING_BUSINESS_SCOPE'
    });
  }

  // Inject sanitized businessId into request body & query
  req.body = req.body || {};
  req.body.businessId = req.businessId;

  // Build a reusable query filter
  req.businessQuery = { businessId: req.businessId };

  // If the user is an AGENT, restrict to assigned records
  if (req.user.role === ROLES.AGENT) {
    req.agentQuery = {
      businessId: req.businessId,
      assignedAgentId: req.user._id,
    };
  } else {
    req.agentQuery = { businessId: req.businessId };
  }

  next();
};

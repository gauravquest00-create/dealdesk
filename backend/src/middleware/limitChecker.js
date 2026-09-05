import Business from '../models/Business.js';
import Plan from '../models/Plan.js';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import SocialLink from '../models/SocialLink.js';
import OpenHouse from '../models/OpenHouse.js';
import Document from '../models/Document.js';
import Viewing from '../models/Viewing.js';
import User from '../models/User.js';
import SmartQR from '../models/SmartQR.js'; // ✅ ADD THIS IMPORT

/**
 * Check if a business has reached any limit for a specific resource type.
 * Returns { exceeded: boolean, limit: number, usage: number, plan: object, suggestion: string }
 */
export const checkLimit = async (businessId, resourceType) => {
  const business = await Business.findById(businessId);
  if (!business) throw new Error('Business not found');

  // If business has no planId (trial or old), assign default starter plan limits
  let plan = null;
  if (business.planId) {
    plan = await Plan.findOne({ planId: business.planId, isActive: true });
  }
  
  // Fallback: if no plan found, use starter plan limits
  if (!plan) {
    plan = await Plan.findOne({ planId: 'starter', isActive: true });
    if (!plan) {
      // If even starter plan not found, return no limits (unlimited)
      return { exceeded: false, limit: -1, usage: 0, plan: null, suggestion: null };
    }
  }

  const limits = plan.limits;
  let usage = 0;
  let limitValue = -1;

  // Determine usage and limit based on resource type
  switch (resourceType) {
    case 'properties':
      limitValue = limits.properties;
      if (limitValue !== -1) {
        usage = await Property.countDocuments({ businessId, isActive: true });
      }
      break;
    case 'leads':
      limitValue = limits.leadsPerMonth;
      if (limitValue !== -1) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        usage = await Lead.countDocuments({
          businessId,
          createdAt: { $gte: startOfMonth }
        });
      }
      break;
    case 'qrs':
      limitValue = limits.qrs;
      if (limitValue !== -1) {
        usage = await SmartQR.countDocuments({ businessId }); // ✅ Now works
      }
      break;
    case 'socialLinks':
      limitValue = limits.socialLinks;
      if (limitValue !== -1) {
        usage = await SocialLink.countDocuments({ businessId });
      }
      break;
    case 'openHouses':
      limitValue = limits.openHousesPerMonth;
      if (limitValue !== -1) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        usage = await OpenHouse.countDocuments({
          businessId,
          createdAt: { $gte: startOfMonth }
        });
      }
      break;
    case 'documents':
      limitValue = limits.documents;
      if (limitValue !== -1) {
        usage = await Document.countDocuments({ businessId });
      }
      break;
    case 'viewings':
      limitValue = limits.viewingsPerMonth;
      if (limitValue !== -1) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        usage = await Viewing.countDocuments({
          businessId,
          createdAt: { $gte: startOfMonth }
        });
      }
      break;
    case 'agents':
      limitValue = limits.agents;
      if (limitValue !== -1) {
        usage = await User.countDocuments({ businessId, isActive: true });
      }
      break;
    default:
      return { exceeded: false, limit: -1, usage: 0, plan: plan.toObject(), suggestion: null };
  }

  // If unlimited (-1), no check
  if (limitValue === -1) {
    return { exceeded: false, limit: -1, usage, plan: plan.toObject(), suggestion: null };
  }

  const exceeded = usage >= limitValue;

  // Suggestion: If exceeded, find next best plan
  let suggestion = null;
  if (exceeded) {
    const allPlans = await Plan.find({ isActive: true }).sort({ monthlyPriceUSD: 1 });
    const currentIndex = allPlans.findIndex(p => p.planId === plan.planId);
    if (currentIndex !== -1 && currentIndex < allPlans.length - 1) {
      suggestion = {
        planId: allPlans[currentIndex + 1].planId,
        name: allPlans[currentIndex + 1].name,
        price: allPlans[currentIndex + 1].monthlyPriceUSD,
        message: `You've reached your ${resourceType} limit. Upgrade to ${allPlans[currentIndex + 1].name} plan for more capacity.`
      };
    } else {
      suggestion = {
        planId: null,
        name: null,
        price: null,
        message: `You've reached your ${resourceType} limit. Contact support for custom plan.`
      };
    }
  }

  return { exceeded, limit: limitValue, usage, plan: plan.toObject(), suggestion };
};

/**
 * Middleware to check a specific limit before allowing an action.
 * Usage: router.post('/properties', checkLimit('properties'), createProperty);
 */
export const checkLimitMiddleware = (resourceType) => {
  return async (req, res, next) => {
    try {
      const businessId = req.businessId;
      const result = await checkLimit(businessId, resourceType);
      if (result.exceeded) {
        return res.status(403).json({
          success: false,
          message: `Limit reached for ${resourceType}. Please upgrade your plan.`,
          data: {
            limit: result.limit,
            usage: result.usage,
            suggestion: result.suggestion,
          }
        });
      }
      // Attach result to req for optional use
      req.limitResult = result;
      next();
    } catch (err) {
      next(err);
    }
  };
};
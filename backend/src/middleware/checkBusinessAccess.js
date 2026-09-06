import Business from '../models/Business.js';
import { ACCOUNT_STATUS, ENTITLEMENT_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

/**
 * Check if business has active access (not suspended, not expired)
 * Applied to all lead/property/deal/viewing operations
 */
export const checkBusinessAccess = async (req, res, next) => {
  try {
    // SuperAdmin bypass
    if (req.user && req.user.role === ROLES.SUPERADMIN) {
      return next();
    }

    const businessId = req.businessId;
    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: 'Business workspace required',
        code: 'NO_WORKSPACE'
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
        code: 'BUSINESS_NOT_FOUND'
      });
    }

    // ✅ Check 1: Account Status
    if (business.accountStatus === ACCOUNT_STATUS.SUSPENDED) {
      return res.status(403).json({
        success: false,
        message: 'Your business account is suspended. Please contact support.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    if (business.accountStatus === ACCOUNT_STATUS.DEACTIVATED) {
      return res.status(403).json({
        success: false,
        message: 'This business workspace has been deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // ✅ Check 2: Trial Expiry
    const now = new Date();
    const trialEndsAt = business.trialEndsAt;
    const isTrialExpired = trialEndsAt && new Date(trialEndsAt) < now;
    const isPaidActive = business.entitlementStatus === ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION;

    // If trial expired and not paid, block access
    if (isTrialExpired && !isPaidActive) {
      // Update status in DB if not already
      if (business.entitlementStatus !== ENTITLEMENT_STATUS.EXPIRED) {
        await Business.findByIdAndUpdate(businessId, { 
          entitlementStatus: ENTITLEMENT_STATUS.EXPIRED 
        });
      }

      // ✅ Allow billing and me routes for payment
      const isBillingPath = req.originalUrl.includes('/api/billing') || 
                            req.originalUrl.includes('/api/subscriptions') || 
                            req.originalUrl.includes('/api/auth/me') ||
                            req.originalUrl.includes('/api/plans');

      if (isBillingPath) {
        return next();
      }

      return res.status(402).json({
        success: false,
        message: 'Your free trial has expired. Please upgrade to continue.',
        code: 'TRIAL_EXPIRED',
        entitlementStatus: ENTITLEMENT_STATUS.EXPIRED,
        trialEndsAt: trialEndsAt,
      });
    }

    // ✅ Check 3: If entitlement is EXPIRED directly
    if (business.entitlementStatus === ENTITLEMENT_STATUS.EXPIRED) {
      const isBillingPath = req.originalUrl.includes('/api/billing') || 
                            req.originalUrl.includes('/api/subscriptions') || 
                            req.originalUrl.includes('/api/auth/me') ||
                            req.originalUrl.includes('/api/plans');

      if (isBillingPath) {
        return next();
      }

      return res.status(402).json({
        success: false,
        message: 'Your access has expired. Please upgrade to continue.',
        code: 'TRIAL_EXPIRED',
      });
    }

    // ✅ Attach business to request for reuse
    req.business = business;
    next();
  } catch (err) {
    next(err);
  }
};

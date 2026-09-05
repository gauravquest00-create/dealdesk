import { ACCOUNT_STATUS, ENTITLEMENT_STATUS } from '../constants/statuses.js';
import Business from '../models/Business.js';
import { ROLES } from '../constants/roles.js';

export const checkEntitlement = async (req, res, next) => {
  if (req.user && req.user.role === ROLES.SUPERADMIN) {
    return next();
  }

  const business = req.business;
  if (!business) {
    return res.status(403).json({ success: false, message: 'Business workspace required', code: 'NO_WORKSPACE' });
  }

  // 1. Account status check
  if (business.accountStatus === ACCOUNT_STATUS.SUSPENDED) {
    return res.status(403).json({
      success: false,
      message: 'Access Restricted: Your DealDesk business account is currently unavailable. Please contact DealDesk Support for assistance.',
      code: 'ACCOUNT_SUSPENDED'
    });
  }

  if (business.accountStatus === ACCOUNT_STATUS.DEACTIVATED) {
    return res.status(403).json({
      success: false,
      message: 'This account has been deactivated.',
      code: 'ACCOUNT_DEACTIVATED'
    });
  }

  // 2. Billing & Trial Entitlement
  const now = new Date();
  const trialExpired = business.trialEndsAt && new Date(business.trialEndsAt) < now;
  const isPaidActive = business.entitlementStatus === ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION;

  if (trialExpired && !isPaidActive) {
    // Automatically flag business entitlement as EXPIRED in DB if not already
    if (business.entitlementStatus !== ENTITLEMENT_STATUS.EXPIRED) {
      await Business.findByIdAndUpdate(business._id, { entitlementStatus: ENTITLEMENT_STATUS.EXPIRED });
    }

    // Allow billing & plan check routes so user can pay
    const isBillingPath = req.originalUrl.includes('/api/billing') || req.originalUrl.includes('/api/subscriptions') || req.originalUrl.includes('/api/auth/me');
    if (isBillingPath) {
      return next();
    }

    return res.status(402).json({
      success: false,
      message: 'Your free trial has expired. Your workspace and data are safe. Continue using DealDesk by choosing a subscription plan.',
      code: 'TRIAL_EXPIRED',
      entitlementStatus: ENTITLEMENT_STATUS.EXPIRED,
      trialEndsAt: business.trialEndsAt,
    });
  }

  next();
};

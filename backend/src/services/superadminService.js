import Business from '../models/Business.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import Trial from '../models/Trial.js';
import AuditLog from '../models/AuditLog.js';
import { ACCOUNT_STATUS, ENTITLEMENT_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

export const getPlatformMetrics = async () => {
  const [
    totalBusinesses,
    activeBusinesses,
    totalUsers,
    subscriptions,
    trials,
    recentPayments,
  ] = await Promise.all([
    Business.countDocuments(),
    Business.countDocuments({ accountStatus: ACCOUNT_STATUS.ACTIVE }),
    User.countDocuments({ role: { $ne: ROLES.SUPERADMIN } }),
    Subscription.find({ status: ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION }).lean(),
    Trial.find().lean(),
    Payment.find({ status: 'Captured' }).sort({ paidAt: -1 }).limit(10).lean(),
  ]);

  // Compute MRR
  let mrr = 0;
  for (const sub of subscriptions) {
    if (sub.billingCycle === 'annual') {
      mrr += Math.round(sub.amount / 12);
    } else {
      mrr += sub.amount;
    }
  }

  const convertedTrials = trials.filter(t => t.status === 'CONVERTED').length;
  const trialConversionRate = trials.length > 0 ? Math.round((convertedTrials / trials.length) * 100) : 0;

  return {
    totalBusinesses,
    activeBusinesses,
    totalUsers,
    mrr,
    activeSubscriptionsCount: subscriptions.length,
    activeTrialsCount: trials.filter(t => t.status === 'ACTIVE').length,
    trialConversionRate,
    recentPayments,
  };
};

export const toggleBusinessSuspension = async ({ businessId, suspend, reason, superAdminUser }) => {
  if (suspend && !reason) {
    throw { statusCode: 400, message: 'A specific reason is mandatory for account suspension.', code: 'REASON_REQUIRED' };
  }

  const business = await Business.findById(businessId);
  if (!business) throw { statusCode: 404, message: 'Business not found' };

  business.accountStatus = suspend ? ACCOUNT_STATUS.SUSPENDED : ACCOUNT_STATUS.ACTIVE;
  business.suspensionReason = suspend ? reason : '';
  business.suspendedAt = suspend ? new Date() : null;
  await business.save();

  await AuditLog.create({
    who: superAdminUser.name,
    userId: superAdminUser._id,
    role: ROLES.SUPERADMIN,
    businessId: business._id,
    action: suspend ? 'BUSINESS_SUSPENDED' : 'BUSINESS_REACTIVATED',
    targetType: 'Business',
    targetId: String(business._id),
    reason: reason || 'Business access restored by platform administration',
  });

  return business;
};

export const triggerSupportAccess = async ({ businessId, reason, durationMinutes = 60, superAdminUser }) => {
  if (!reason || reason.trim().length < 5) {
    throw { statusCode: 400, message: 'A valid operational reason is required for Support Access Mode.', code: 'SUPPORT_REASON_REQUIRED' };
  }

  const business = await Business.findById(businessId);
  if (!business) throw { statusCode: 404, message: 'Business not found' };

  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
  business.supportAccessActive = true;
  business.supportAccessExpiresAt = expiresAt;
  business.supportAccessReason = reason;
  await business.save();

  await AuditLog.create({
    who: superAdminUser.name,
    userId: superAdminUser._id,
    role: ROLES.SUPERADMIN,
    businessId: business._id,
    action: 'SUPPORT_ACCESS_MODE_STARTED',
    targetType: 'Business',
    targetId: String(business._id),
    reason: `Entered Support Access Mode for ${durationMinutes} mins: ${reason}`,
  });

  return {
    supportAccessActive: true,
    expiresAt,
    reason,
    businessId: business._id,
    businessName: business.name,
  };
};

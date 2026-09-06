import User from '../models/User.js';
import Business from '../models/Business.js';
import Trial from '../models/Trial.js';
import TrialEligibility from '../models/TrialEligibility.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import { hashPassword, comparePassword, sha256 } from '../utils/hash.js';
import { generateToken } from '../utils/token.js';
import { ROLES } from '../constants/roles.js';
import { ACCOUNT_STATUS, ENTITLEMENT_STATUS, TRIAL_STATUS } from '../constants/statuses.js';

// ✅ FIXED: Now accepts trialEndsAt, entitlementStatus, trialStatus from controller
export const registerBusinessAndAdmin = async ({
  businessName,
  fullName,
  businessEmail,
  username: customUsername,
  password,
  country = 'India',
  city = 'Gurugram',
  currency = 'USD',
  timezone = 'Asia/Kolkata',
  phone = '',
  planId = 'starter',
  billingCycle = 'monthly',
  isPaid = false,
  paymentDetails = null,
  // ✅ New parameters from controller
  trialEndsAt: providedTrialEndsAt = null,
  entitlementStatus: providedEntitlementStatus = null,
  trialStatus: providedTrialStatus = null,
}) => {
  const emailClean = businessEmail.trim().toLowerCase();
  const domain = emailClean.split('@')[1] || '';

  // Check if email already registered
  const existingUser = await User.findOne({ email: emailClean });
  if (existingUser) {
    throw { statusCode: 400, message: 'An account with this email already exists.', code: 'EMAIL_ALREADY_EXISTS' };
  }

  // 1. Trial Abuse Prevention Check (only for free trial)
  const emailH = sha256(emailClean);
  const domainH = sha256(domain);
  const existingTrial = await TrialEligibility.findOne({
    $or: [{ emailHash: emailH }, { domainHash: domainH }]
  });

  const isEligibleForTrial = !existingTrial;

  // 2. Determine trial days, end date, and status
  const now = new Date();
  let trialDays = 0;
  let trialEndsAt = providedTrialEndsAt;
  let entitlementStatus = providedEntitlementStatus;
  let trialStatus = providedTrialStatus;

  // If controller didn't provide, compute based on isPaid and eligibility
  if (isPaid) {
    // Paid → no trial, active subscription
    trialDays = 0;
    entitlementStatus = ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION;
    trialEndsAt = new Date(now.getTime() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000);
    trialStatus = null;
  } else if (!isEligibleForTrial) {
    // Not eligible for trial → payment required
    trialDays = 0;
    entitlementStatus = ENTITLEMENT_STATUS.PAYMENT_REQUIRED;
    trialEndsAt = null;
    trialStatus = null;
  } else if (providedTrialEndsAt) {
    // ✅ Use provided trialEndsAt (from controller)
    trialDays = 3;
    trialEndsAt = providedTrialEndsAt;
    entitlementStatus = ENTITLEMENT_STATUS.TRIAL_ACTIVE;
    trialStatus = TRIAL_STATUS.ACTIVE;
  } else {
    // ✅ Default 3-day trial
    trialDays = 3;
    trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    entitlementStatus = ENTITLEMENT_STATUS.TRIAL_ACTIVE;
    trialStatus = TRIAL_STATUS.ACTIVE;
  }

  // 3. Create Business
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
  
  const business = await Business.create({
    name: businessName,
    slug,
    email: emailClean,
    phone,
    country,
    city,
    currency,
    timezone,
    accountStatus: ACCOUNT_STATUS.ACTIVE,
    entitlementStatus: entitlementStatus,
    planId: isPaid ? planId : 'starter',
    billingCycle,
    trialEndsAt: trialEndsAt, // ✅ now correctly set
  });

  // 4. Create Admin User
  const passwordHash = await hashPassword(password);
  let finalUsername = customUsername 
    ? customUsername.trim().toLowerCase() 
    : emailClean.split('@')[0] + '.' + slug.slice(0, 8);

  // Check if username taken
  const existingUsername = await User.findOne({ username: finalUsername });
  if (existingUsername) {
    finalUsername = `${finalUsername}.${Math.floor(100 + Math.random() * 900)}`;
  }

  const adminUser = await User.create({
    businessId: business._id,
    name: fullName,
    email: emailClean,
    username: finalUsername,
    passwordHash,
    phone,
    role: ROLES.ADMIN,
    isActive: true,
    isEmailVerified: true,
  });

  // 5. Trial Record & Eligibility Ledger (only for trial)
  if (trialStatus === TRIAL_STATUS.ACTIVE && trialDays > 0) {
    await Trial.create({
      businessId: business._id,
      startedAt: now,
      endsAt: trialEndsAt,
      status: TRIAL_STATUS.ACTIVE,
    });

    await TrialEligibility.create({
      emailHash: emailH,
      domainHash: domainH,
      phoneHash: phone ? sha256(phone) : undefined,
      businessNameHash: sha256(businessName),
      isEligible: false,
      previousBusinessId: business._id,
    });
  } else if (isPaid) {
    // 6. Paid: create subscription & payment
    const sub = await Subscription.create({
      businessId: business._id,
      planId,
      billingCycle,
      amount: paymentDetails?.amount || (billingCycle === 'annual' ? 490 : 49),
      currency,
      status: ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION,
      currentPeriodStart: now,
      currentPeriodEnd: trialEndsAt,
      provider: 'razorpay',
      providerSubscriptionId: paymentDetails?.providerOrderId || `sub_order_${Date.now()}`,
    });

    await Payment.create({
      businessId: business._id,
      subscriptionId: sub._id,
      providerPaymentId: paymentDetails?.providerPaymentId || `pay_${Date.now()}`,
      providerOrderId: paymentDetails?.providerOrderId || `order_${Date.now()}`,
      amount: paymentDetails?.amount || (billingCycle === 'annual' ? 490 : 49),
      currency,
      status: 'Captured',
      paidAt: now,
      invoiceId: `INV-${Date.now().toString().slice(-8)}`,
    });
  }

  // 7. Audit Log
  await AuditLog.create({
    who: fullName,
    userId: adminUser._id,
    role: ROLES.ADMIN,
    businessId: business._id,
    action: isPaid ? 'BUSINESS_CREATED_PAID' : 'BUSINESS_CREATED_TRIAL',
    targetType: 'Business',
    targetId: String(business._id),
    reason: isPaid 
      ? `Business signup with immediate ${planId} (${billingCycle}) subscription` 
      : `Initial business signup with ${trialDays}-day free trial (expires: ${trialEndsAt?.toISOString()})`,
  });

  const token = generateToken({ 
    userId: adminUser._id, 
    role: adminUser.role, 
    businessId: business._id 
  });

  return {
    user: adminUser,
    business,
    token,
    trialDays,
    isEligibleForTrial,
    isPaid,
    trialEndsAt,
    credentials: {
      username: finalUsername,
      email: emailClean,
    }
  };
};

export const loginUser = async ({ identifier, password }) => {
  const idClean = identifier.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: idClean }, { username: idClean }]
  });

  if (!user) {
    throw { statusCode: 401, message: 'Invalid email/username or password', code: 'INVALID_CREDENTIALS' };
  }

  if (!user.isActive) {
    throw { statusCode: 403, message: 'Your account is deactivated. Please contact your business administrator.', code: 'USER_DEACTIVATED' };
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email/username or password', code: 'INVALID_CREDENTIALS' };
  }

  user.lastLoginAt = new Date();
  await user.save();

  let business = null;
  if (user.businessId) {
    business = await Business.findById(user.businessId);
    if (!business) {
      throw { statusCode: 403, message: 'Business workspace not found', code: 'WORKSPACE_NOT_FOUND' };
    }
    if (business.accountStatus === ACCOUNT_STATUS.SUSPENDED) {
      throw { 
        statusCode: 403, 
        message: 'Your business account is currently suspended. Please contact support.', 
        code: 'BUSINESS_SUSPENDED' 
      };
    }
    if (business.accountStatus === ACCOUNT_STATUS.DEACTIVATED) {
      throw { 
        statusCode: 403, 
        message: 'This brokerage workspace has been deactivated.', 
        code: 'BUSINESS_DEACTIVATED' 
      };
    }
  }

  const token = generateToken({
    userId: user._id,
    role: user.role,
    businessId: user.businessId || null
  });

  return {
    user,
    business,
    token,
    mustChangePassword: user.mustChangePassword,
  };
};

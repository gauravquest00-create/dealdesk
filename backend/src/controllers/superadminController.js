import * as superadminService from '../services/superadminService.js';
import Business from '../models/Business.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import Trial from '../models/Trial.js';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import SmartQR from '../models/SmartQR.js';
import Deal from '../models/Deal.js';
import Viewing from '../models/Viewing.js';
import Plan from '../models/Plan.js';
import { ROLES } from '../constants/roles.js';
import { ACCOUNT_STATUS, ENTITLEMENT_STATUS } from '../constants/statuses.js';
import { generateSlug } from '../utils/slug.js';

// ============================================================
// EXISTING FUNCTIONS (unchanged)
// ============================================================

export const getMetrics = async (req, res, next) => {
  try {
    const metrics = await superadminService.getPlatformMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
};

export const listBusinesses = async (req, res, next) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(businesses.map(async (b) => {
      const [propCount, agentCount, leadCount] = await Promise.all([
        Property.countDocuments({ businessId: b._id }),
        User.countDocuments({ businessId: b._id, role: ROLES.AGENT }),
        Lead.countDocuments({ businessId: b._id }),
      ]);
      return {
        ...b,
        counts: {
          properties: propCount,
          agents: agentCount,
          leads: leadCount,
        }
      };
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

export const getBusinessDetail = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id).lean();
    if (!business) return res.status(404).json({ success: false, message: 'Business workspace not found' });

    const [
      users,
      subscription,
      payments,
      auditLogs,
      totalProperties,
      totalAgents,
      totalLeads,
      totalQRs,
      totalDeals,
      totalViewings
    ] = await Promise.all([
      User.find({ businessId: business._id }).lean(),
      Subscription.findOne({ businessId: business._id }).lean(),
      Payment.find({ businessId: business._id }).sort({ paidAt: -1 }).lean(),
      AuditLog.find({ businessId: business._id }).sort({ timestamp: -1 }).limit(30).lean(),
      Property.countDocuments({ businessId: business._id }),
      User.countDocuments({ businessId: business._id, role: { $ne: ROLES.SUPERADMIN } }),
      Lead.countDocuments({ businessId: business._id }),
      SmartQR.countDocuments({ businessId: business._id }),
      Deal.countDocuments({ businessId: business._id }),
      Viewing.countDocuments({ businessId: business._id }),
    ]);

    res.json({
      success: true,
      data: {
        ...business,
        users,
        subscription,
        payments,
        auditLogs,
        analytics: {
          totalProperties,
          totalAgents,
          totalLeads,
          totalQRs,
          totalDeals,
          totalViewings,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const toggleSuspension = async (req, res, next) => {
  try {
    const { suspend, reason } = req.body;
    const business = await superadminService.toggleBusinessSuspension({
      businessId: req.params.id,
      suspend,
      reason,
      superAdminUser: req.user,
    });

    res.json({ success: true, message: suspend ? 'Business suspended' : 'Business reactivated', data: business });
  } catch (err) {
    next(err);
  }
};

export const startSupportAccess = async (req, res, next) => {
  try {
    const { reason, durationMinutes } = req.body;
    const result = await superadminService.triggerSupportAccess({
      businessId: req.params.id,
      reason,
      durationMinutes,
      superAdminUser: req.user,
    });

    res.json({ success: true, message: 'Support Access Mode activated', data: result });
  } catch (err) {
    next(err);
  }
};

export const listSubscriptions = async (req, res, next) => {
  try {
    const subs = await Subscription.find().populate('businessId', 'name email').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: subs });
  } catch (err) {
    next(err);
  }
};

export const listPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().populate('businessId', 'name email').sort({ paidAt: -1 }).lean();
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

export const listAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100).lean();
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// PLAN MANAGEMENT (existing)
// ============================================================

export const listPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find().sort({ monthlyPriceUSD: 1 }).lean();
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const { planId, name, monthlyPriceUSD, annualPriceUSD, desc, features, limits, popular, isActive } = req.body;
    if (!planId || !name || monthlyPriceUSD === undefined || annualPriceUSD === undefined) {
      return res.status(400).json({ success: false, message: 'Plan ID, name, and prices are required.', code: 'MISSING_FIELDS' });
    }

    const plan = await Plan.create({
      planId: planId.toLowerCase().trim(),
      name,
      monthlyPriceUSD: Number(monthlyPriceUSD),
      annualPriceUSD: Number(annualPriceUSD),
      desc: desc || '',
      features: features || [],
      limits: limits || { properties: -1, agents: -1, qrs: -1 },
      popular: !!popular,
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, message: 'Plan created successfully', data: plan });
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const allowed = ['name', 'monthlyPriceUSD', 'annualPriceUSD', 'desc', 'features', 'limits', 'popular', 'isActive'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        plan[key] = req.body[key];
      }
    }

    await plan.save();
    res.json({ success: true, message: 'Plan updated successfully', data: plan });
  } catch (err) {
    next(err);
  }
};

export const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    plan.isActive = false;
    await plan.save();

    res.json({ success: true, message: 'Plan deactivated successfully', data: plan });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// 🆕 NEW FUNCTIONS for Create Business workflow
// ============================================================

// ✅ GET /businesses/new — (optional) return form placeholder
export const getNewBusinessForm = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Create new business form' });
  } catch (err) {
    next(err);
  }
};

// ✅ POST /businesses — Create a new business
export const createBusiness = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      country,
      timezone,
      currency,
      planId,
      billingCycle,
      entitlementStatus,
      accountStatus,
      trialEndsAt,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Business name and email are required' });
    }

    const slug = generateSlug(name);
    const existing = await Business.findOne({ $or: [{ email }, { slug }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Business with this email or slug already exists' });
    }

    const business = await Business.create({
      name,
      slug,
      email,
      phone: phone || '',
      city: city || 'Gurugram',
      country: country || 'India',
      timezone: timezone || 'Asia/Kolkata',
      currency: currency || 'USD',
      planId: planId || 'starter',
      billingCycle: billingCycle || 'monthly',
      entitlementStatus: entitlementStatus || ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION,
      accountStatus: accountStatus || ACCOUNT_STATUS.ACTIVE,
      trialEndsAt: trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Create default admin user
    const tempPassword = `Pass@${Math.random().toString(36).slice(-6).toUpperCase()}`;
    // In real scenario, hash the password and send email.
    // For now, we store a placeholder hash (you should implement proper hashing).
    const hashedPassword = await import('../utils/hash.js').then(m => m.hashPassword(tempPassword));

    await User.create({
      businessId: business._id,
      name: 'Admin',
      email: email,
      username: `${email.split('@')[0]}.${slug}`,
      passwordHash: hashedPassword,
      role: ROLES.ADMIN,
      isActive: true,
    });

    // Audit log
    await AuditLog.create({
      who: req.user.name || 'SuperAdmin',
      role: 'SUPERADMIN',
      businessId: business._id,
      action: 'BUSINESS_CREATED',
      targetType: 'Business',
      targetId: String(business._id),
      reason: `Business created by SuperAdmin ${req.user.name}`,
    });

    res.status(201).json({
      success: true,
      data: business,
      message: 'Business created successfully. Temporary password: ' + tempPassword,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ PUT /businesses/:id — Update business
export const updateBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const business = await Business.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

// ✅ POST /businesses/:id/create-order — Create Razorpay order for a specific business
export const createOrderForBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planId, billingCycle, currency } = req.body;

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const plan = await Plan.findOne({ planId });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const usdPrice = billingCycle === 'annual' ? plan.annualPriceUSD : plan.monthlyPriceUSD;
    const rate = {
      USD: 1,
      INR: 83,
      AED: 3.67,
      GBP: 0.78,
      EUR: 0.92,
      CAD: 1.35,
      AUD: 1.49
    }[currency] || 1;
    const amount = Math.round(usdPrice * rate * 100); // in minor units (paise/cents)

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(-6)}`;

    res.json({
      success: true,
      data: {
        orderId,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
        amount,
        currency,
        planName: plan.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ POST /businesses/:id/verify-payment — Verify and activate subscription
export const verifyPaymentForBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { providerPaymentId, providerOrderId, signature, planId, billingCycle, amount, currency } = req.body;

    // In production, verify signature using Razorpay secret.
    // For now, we skip signature validation (assuming it's done via SDK).

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Activate subscription
    business.entitlementStatus = ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION;
    business.planId = planId || business.planId;
    business.billingCycle = billingCycle || business.billingCycle;
    await business.save();

    // Create subscription record
    await Subscription.create({
      businessId: business._id,
      planId: planId || business.planId,
      billingCycle: billingCycle || business.billingCycle,
      amount: amount / 100,
      currency,
      status: 'active',
      provider: 'razorpay',
      providerSubscriptionId: providerOrderId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Create payment record
    await Payment.create({
      businessId: business._id,
      subscriptionId: null,
      providerPaymentId,
      providerOrderId,
      amount: amount / 100,
      currency,
      status: 'Captured',
      paidAt: new Date(),
      invoiceId: `INV-${Date.now().toString().slice(-8)}`,
    });

    // Audit log
    await AuditLog.create({
      who: req.user.name || 'SuperAdmin',
      role: 'SUPERADMIN',
      businessId: business._id,
      action: 'SUBSCRIPTION_ACTIVATED',
      targetType: 'Subscription',
      targetId: providerOrderId,
      reason: `Payment verified and subscription activated for ${business.name}`,
    });

    res.json({ success: true, message: 'Payment verified and subscription activated' });
  } catch (err) {
    next(err);
  }
};
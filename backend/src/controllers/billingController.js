import * as billingService from '../services/billingService.js';
import Business from '../models/Business.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import Plan from '../models/Plan.js';
import { PLANS, CURRENCY_RATES, calculateConverted } from '../utils/pricing.js';
import { checkLimit } from '../middleware/limitChecker.js';

// ============================================================
// GET ALL PLANS (with currency conversion)
// ============================================================
export const getPlans = async (req, res, next) => {
  try {
    const currency = req.query.currency || 'USD';
    
    // Try to fetch from DB, if empty seed from PLANS
    let dbPlans = await Plan.find({ isActive: true }).sort({ monthlyPriceUSD: 1 }).lean();

    if (!dbPlans || dbPlans.length === 0) {
      // Seed from PLANS constant (pricing.js)
      const defaultList = PLANS.map(p => ({
        planId: p.planId,
        name: p.name,
        monthlyPriceUSD: p.monthlyPriceUSD,
        annualPriceUSD: p.annualPriceUSD,
        desc: p.desc,
        popular: p.popular,
        features: p.features,
        limits: p.limits,
        isActive: true,
      }));
      await Plan.insertMany(defaultList);
      dbPlans = await Plan.find({ isActive: true }).sort({ monthlyPriceUSD: 1 }).lean();
    }

    const plans = dbPlans.map(p => ({
      id: p.planId,
      _id: p._id,
      name: p.name,
      monthlyPriceUSD: p.monthlyPriceUSD,
      annualPriceUSD: p.annualPriceUSD,
      desc: p.desc,
      popular: p.popular,
      features: p.features,
      limits: p.limits,
      calculatedMonthly: {
        amount: calculateConverted(p.monthlyPriceUSD, currency),
        currency,
      },
      calculatedAnnual: {
        amount: calculateConverted(p.annualPriceUSD, currency),
        currency,
      }
    }));

    res.json({ success: true, data: { plans, rates: CURRENCY_RATES, currency } });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET BILLING STATUS WITH USAGE
// ============================================================
export const getBillingStatus = async (req, res, next) => {
  try {
    const businessId = req.businessId;
    const business = await Business.findById(businessId).lean();
    const subscription = await Subscription.findOne({ businessId }).lean();
    const payments = await Payment.find({ businessId }).sort({ paidAt: -1 }).limit(10).lean();

    // Get current plan details
    const plan = await Plan.findOne({ planId: business.planId, isActive: true }).lean();

    // Get usage for all resource types
    const resourceTypes = ['properties', 'leads', 'qrs', 'socialLinks', 'openHouses', 'documents', 'viewings', 'agents'];
    const usage = {};

    for (const resType of resourceTypes) {
      const result = await checkLimit(businessId, resType);
      usage[resType] = {
        limit: result.limit,
        usage: result.usage,
        exceeded: result.exceeded,
        suggestion: result.suggestion,
      };
    }

    // Determine if any limit is exceeded
    const anyExceeded = Object.values(usage).some(u => u.exceeded === true);

    // Suggest overall plan upgrade if any exceeded
    let overallSuggestion = null;
    if (anyExceeded) {
      // Find the next plan
      const allPlans = await Plan.find({ isActive: true }).sort({ monthlyPriceUSD: 1 });
      const currentIndex = allPlans.findIndex(p => p.planId === business.planId);
      if (currentIndex !== -1 && currentIndex < allPlans.length - 1) {
        overallSuggestion = {
          planId: allPlans[currentIndex + 1].planId,
          name: allPlans[currentIndex + 1].name,
          price: allPlans[currentIndex + 1].monthlyPriceUSD,
          message: `You've reached limits in some areas. Upgrade to ${allPlans[currentIndex + 1].name} plan.`
        };
      } else {
        overallSuggestion = {
          planId: null,
          name: null,
          price: null,
          message: 'You’ve reached the limits of the highest plan. Contact us for custom options.'
        };
      }
    }

    res.json({
      success: true,
      data: {
        businessId: business._id,
        businessName: business.name,
        entitlementStatus: business.entitlementStatus,
        planId: business.planId,
        billingCycle: business.billingCycle,
        trialEndsAt: business.trialEndsAt,
        subscription,
        recentPayments: payments,
        currentPlan: plan,
        usage,
        overallSuggestion,
        anyLimitExceeded: anyExceeded,
      }
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================
export const createOrder = async (req, res, next) => {
  try {
    const { planId, billingCycle = 'monthly', currency = 'USD' } = req.body;
    
    // Fetch price from Plan model (fallback to pricing utils)
    const plan = await Plan.findOne({ planId, isActive: true }).lean();
    let usdPrice;
    if (plan) {
      usdPrice = billingCycle === 'annual' ? plan.annualPriceUSD : plan.monthlyPriceUSD;
    } else {
      // fallback to pricing utility
      const { calculatePrice } = await import('../utils/pricing.js');
      usdPrice = calculatePrice(planId, billingCycle, currency).amount;
    }
    const amount = calculateConverted(usdPrice, currency);

    const order = await billingService.createSubscriptionOrder({
      businessId: req.businessId,
      planId,
      billingCycle,
      currency,
    });

    res.json({ success: true, data: { ...order, amount, currency } });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// VERIFY PAYMENT AND ACTIVATE SUBSCRIPTION
// ============================================================
export const verifyPayment = async (req, res, next) => {
  try {
    const { providerPaymentId, providerOrderId, signature, planId, billingCycle, amount, currency } = req.body;
    const result = await billingService.verifyPaymentAndActivateSubscription({
      businessId: req.businessId,
      providerPaymentId,
      providerOrderId,
      signature,
      planId,
      billingCycle,
      amount,
      currency,
    });

    res.json({ success: true, message: 'Subscription activated', data: result });
  } catch (err) {
    next(err);
  }
};
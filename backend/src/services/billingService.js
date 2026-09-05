import crypto from 'crypto';
import { getRazorpay } from '../config/razorpay.js';
import { ENV } from '../config/env.js';
import Business from '../models/Business.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import { ENTITLEMENT_STATUS } from '../constants/statuses.js';
import { calculatePrice } from '../utils/pricing.js';

export const createSubscriptionOrder = async ({ businessId, planId, billingCycle = 'monthly', currency = 'USD' }) => {
  const business = await Business.findById(businessId);
  if (!business) throw { statusCode: 404, message: 'Business not found' };

  const pricing = calculatePrice(planId, billingCycle, currency);
  const razorpay = getRazorpay();

  let orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: Math.round(pricing.amount * 100), // convert to paise / cents
        currency: pricing.currency,
        receipt: `rcpt_${String(businessId).slice(-6)}_${Date.now()}`,
        notes: {
          businessId: String(businessId),
          planId,
          billingCycle,
        }
      });
      orderId = order.id;
    } catch (err) {
      console.warn('[Razorpay Order creation fallback]', err.message);
    }
  }

  return {
    orderId,
    keyId: ENV.RAZORPAY_KEY_ID || 'rzp_live_demo_key',
    amount: pricing.amount,
    currency: pricing.currency,
    planName: pricing.planName,
    businessName: business.name,
    customerEmail: business.email,
  };
};

export const verifyPaymentAndActivateSubscription = async ({
  businessId,
  providerPaymentId,
  providerOrderId,
  signature,
  planId,
  billingCycle = 'monthly',
  amount,
  currency = 'USD'
}) => {
  // 1. Verify Signature if Secret configured
  if (ENV.RAZORPAY_KEY_SECRET && signature) {
    const generatedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(`${providerOrderId}|${providerPaymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      throw { statusCode: 400, message: 'Invalid payment signature', code: 'INVALID_SIGNATURE' };
    }
  }

  const business = await Business.findById(businessId);
  if (!business) throw { statusCode: 404, message: 'Business not found' };

  const durationDays = billingCycle === 'annual' ? 365 : 30;
  const currentPeriodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  // Update or create subscription
  const subscription = await Subscription.findOneAndUpdate(
    { businessId },
    {
      planId,
      billingCycle,
      amount,
      currency,
      status: ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION,
      currentPeriodStart: new Date(),
      currentPeriodEnd,
      provider: 'razorpay',
      providerSubscriptionId: providerOrderId,
    },
    { upsert: true, new: true }
  );

  // Record Payment
  await Payment.create({
    businessId,
    subscriptionId: subscription._id,
    providerPaymentId,
    providerOrderId,
    amount,
    currency,
    status: 'Captured',
    paidAt: new Date(),
    invoiceId: `INV-${Date.now().toString().slice(-8)}`,
  });

  // Activate Business
  business.entitlementStatus = ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION;
  business.planId = planId;
  business.billingCycle = billingCycle;
  await business.save();

  await AuditLog.create({
    who: business.name,
    role: 'ADMIN',
    businessId: business._id,
    action: 'SUBSCRIPTION_ACTIVATED',
    targetType: 'Subscription',
    targetId: String(subscription._id),
    reason: `Subscribed to ${planId} (${billingCycle}) for ${amount} ${currency}`,
  });

  return { success: true, subscription, entitlementStatus: ENTITLEMENT_STATUS.ACTIVE_SUBSCRIPTION };
};

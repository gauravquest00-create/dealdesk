import mongoose from 'mongoose';
import { ENTITLEMENT_STATUS } from '../constants/statuses.js';

const subscriptionSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
  planId: { type: String, required: true },
  billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: Object.values(ENTITLEMENT_STATUS),
    default: ENTITLEMENT_STATUS.TRIAL_ACTIVE,
    index: true,
  },
  provider: { type: String, default: 'razorpay' },
  providerSubscriptionId: { type: String },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { type: Date, required: true },
  cancelAtPeriodEnd: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);

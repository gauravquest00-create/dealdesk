import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  providerPaymentId: { type: String, required: true, index: true },
  providerOrderId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['Created', 'Captured', 'Failed', 'Refunded'], default: 'Created' },
  invoiceId: { type: String },
  paidAt: { type: Date },
  failureReason: { type: String },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);

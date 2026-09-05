import mongoose from 'mongoose';

const billingProfileSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
  legalName: { type: String, required: true },
  taxId: { type: String, default: '' },
  billingEmail: { type: String, required: true },
  billingAddress: {
    line1: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
}, { timestamps: true });

export default mongoose.model('BillingProfile', billingProfileSchema);

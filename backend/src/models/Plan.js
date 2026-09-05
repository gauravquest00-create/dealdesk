import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  monthlyPriceUSD: { type: Number, required: true, min: 0 },
  annualPriceUSD: { type: Number, required: true, min: 0 },
  desc: { type: String, default: '' },
  popular: { type: Boolean, default: false },
  features: [{ type: String }],
  limits: {
    agents: { type: Number, default: -1 }, // -1 = unlimited
    properties: { type: Number, default: -1 },
    leadsPerMonth: { type: Number, default: -1 },
    qrs: { type: Number, default: -1 },
    socialLinks: { type: Number, default: -1 },
    openHousesPerMonth: { type: Number, default: -1 },
    documents: { type: Number, default: -1 },
    viewingsPerMonth: { type: Number, default: -1 },
    bulkWhatsApp: { type: Boolean, default: false },
    emailCampaigns: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.model('Plan', planSchema);
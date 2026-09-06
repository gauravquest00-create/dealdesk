import mongoose from 'mongoose';
import { ACCOUNT_STATUS, ENTITLEMENT_STATUS } from '../constants/statuses.js';

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  businessType: { type: String, default: 'Real Estate Agency' },
  country: { type: String, default: 'India' },
  city: { type: String, default: 'Gurugram' },
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  language: { type: String, default: 'en' },
  locale: { type: String, default: 'en-US' },
  dateFormat: { type: String, default: 'YYYY-MM-DD' },
  timeFormat: { type: String, default: '24h' },
  logoUrl: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, required: true, lowercase: true, trim: true },
  website: { type: String, default: '' },
  address: { type: String, default: '' },
  state: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  
  accountStatus: {
    type: String,
    enum: Object.values(ACCOUNT_STATUS),
    default: ACCOUNT_STATUS.ACTIVE,
    index: true,
  },
  suspensionReason: { type: String, default: '' },
  suspendedAt: { type: Date },

  entitlementStatus: {
    type: String,
    enum: Object.values(ENTITLEMENT_STATUS),
    default: ENTITLEMENT_STATUS.TRIAL_ACTIVE,
    index: true,
  },

  planId: { type: String, default: 'starter' },
  billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  trialEndsAt: { type: Date }, // ✅ required hata diya

  supportAccessActive: { type: Boolean, default: false },
  supportAccessExpiresAt: { type: Date },
  supportAccessReason: { type: String },

  settings: {
    defaultCommunicationChannel: { type: String, default: 'WhatsApp' },
    propertyDetailDefaults: {
      propertyName: { type: Boolean, default: true },
      configuration: { type: Boolean, default: true },
      location: { type: Boolean, default: true },
      propertyLink: { type: Boolean, default: true },
      price: { type: Boolean, default: false },
      propertySize: { type: Boolean, default: false },
    },
    theme: { type: String, default: 'light' },
    notificationsEnabled: { type: Boolean, default: true },
  },
}, { timestamps: true });

export default mongoose.model('Business', businessSchema);

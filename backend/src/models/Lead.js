import mongoose from 'mongoose';
import { LEAD_STATUS, LEAD_TEMPERATURE, LEAD_SOURCE } from '../constants/statuses.js';

const leadSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  source: {
    type: String,
    enum: Object.values(LEAD_SOURCE),
    default: LEAD_SOURCE.SMART_QR,
    index: true,
  },
  status: {
    type: String,
    enum: Object.values(LEAD_STATUS),
    default: LEAD_STATUS.NEW,
    index: true,
  },
sourceSocialLinkId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'SocialLink',
  index: true,
},
  temperature: {
    type: String,
    enum: Object.values(LEAD_TEMPERATURE),
    default: LEAD_TEMPERATURE.WARM,
    index: true,
  },
  score: { type: Number, default: 50, min: 0, max: 100 },
  
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  interestedPropertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
  
  requirements: {
    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 0 },
    preferredLocations: [{ type: String }],
    propertyTypes: [{ type: String }],
    preferredConfigurations: [{ type: String }],
    minSizeSqFt: { type: Number, default: 0 },
    transactionType: { type: String, default: 'Sale' },
    timeline: { type: String, default: 'Immediate' },
  },

  nextFollowUpDate: { type: Date },
  nextAction: { type: String, default: 'Call client to schedule viewing' },
  notes: { type: String, default: '' },

  scoreBreakdown: [{
    action: String,
    delta: Number,
    timestamp: { type: Date, default: Date.now }
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

leadSchema.index({ businessId: 1, phone: 1 });
leadSchema.index({ businessId: 1, status: 1 });
leadSchema.index({ businessId: 1, assignedAgentId: 1 });

export default mongoose.model('Lead', leadSchema);

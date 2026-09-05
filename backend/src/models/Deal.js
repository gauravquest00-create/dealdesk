import mongoose from 'mongoose';
import { DEAL_STAGE } from '../constants/statuses.js';

const dealSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  dealValue: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  stage: {
    type: String,
    enum: Object.values(DEAL_STAGE),
    default: DEAL_STAGE.NEW,
    index: true,
  },
  commissionPercent: { type: Number, default: 2.0 },
  commissionValue: { type: Number, default: 0 },
  expectedClosingDate: { type: Date },
  actualClosingDate: { type: Date },
  notes: { type: String, default: '' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Deal', dealSchema);

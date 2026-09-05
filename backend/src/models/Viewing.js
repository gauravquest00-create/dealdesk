import mongoose from 'mongoose';
import { VIEWING_STATUS } from '../constants/statuses.js';

const viewingSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  scheduledDate: { type: String, required: true }, // YYYY-MM-DD
  scheduledTime: { type: String, required: true }, // HH:mm
  status: {
    type: String,
    enum: Object.values(VIEWING_STATUS),
    default: VIEWING_STATUS.SCHEDULED,
    index: true,
  },
  cancellationReason: { type: String },
  hasReport: { type: Boolean, default: false },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Viewing', viewingSchema);

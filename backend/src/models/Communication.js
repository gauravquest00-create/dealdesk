import mongoose from 'mongoose';
import { COMMUNICATION_CHANNELS } from '../constants/statuses.js';

const communicationSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  channel: {
    type: String,
    enum: Object.values(COMMUNICATION_CHANNELS),
    required: true,
  },
  templateName: { type: String, default: 'Custom Message' },
  content: { type: String, required: true },
  recipient: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Sent', 'Delivered', 'Failed'], default: 'Sent' },
  metadata: { type: Map, of: String },
  sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Communication', communicationSchema);

import mongoose from 'mongoose';
import { QR_EVENT_TYPES } from '../constants/statuses.js';

const qrActivitySchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  qrId: { type: String, required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
  eventType: {
    type: String,
    enum: Object.values(QR_EVENT_TYPES),
    required: true,
    index: true,
  },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  ipHash: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('QRActivity', qrActivitySchema);

import mongoose from 'mongoose';
import { COMMUNICATION_CHANNELS } from '../constants/statuses.js';

const communicationTemplateSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true }, // null for default system templates
  title: { type: String, required: true },
  channel: { type: String, enum: Object.values(COMMUNICATION_CHANNELS), default: 'WhatsApp' },
  subject: { type: String, default: '' },
  body: { type: String, required: true },
  isSystemDefault: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('CommunicationTemplate', communicationTemplateSchema);

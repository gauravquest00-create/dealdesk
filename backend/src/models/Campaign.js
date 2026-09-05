import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  title: { type: String, required: true, trim: true },
  channel: { type: String, enum: ['WhatsApp', 'Email'], default: 'WhatsApp' },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunicationTemplate' },
  content: { type: String, required: true },
  targetAudience: { 
    type: String, 
    enum: ['All Leads', 'Hot Leads Only', 'Warm Leads', 'Open House Visitors', 'Smart QR Inquiries'],
    default: 'All Leads' 
  },
  status: { type: String, enum: ['Draft', 'Active', 'Completed', 'Cancelled'], default: 'Active' },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  scheduledAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Campaign', campaignSchema);

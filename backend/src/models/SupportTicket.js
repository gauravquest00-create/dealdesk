import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In_Progress', 'Resolved', 'Closed'], default: 'Open' },
  messages: [{
    senderRole: String,
    senderName: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  who: { type: String, required: true }, // Name or email
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  action: { type: String, required: true }, // e.g. BUSINESS_SUSPENDED, SUPPORT_ACCESS_STARTED
  targetType: { type: String, required: true }, // Business, User, Plan, Setting
  targetId: { type: String },
  reason: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  metadata: { type: Map, of: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);

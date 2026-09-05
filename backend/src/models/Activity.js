import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  entityType: { type: String, required: true }, // Property, Lead, Viewing, Deal, QR, Document
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, required: true }, // CREATED, UPDATED, STATUS_CHANGED, CONTACTED
  description: { type: String, required: true },
  metadata: { type: Map, of: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);

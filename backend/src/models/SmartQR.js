import mongoose from 'mongoose';

const smartQRSchema = new mongoose.Schema({
  qrId: { type: String, required: true, unique: true, trim: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  currentPropertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  label: { type: String, default: 'Main Gate Board' },
  status: { type: String, default: 'Active' },
  scanCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  leadCount: { type: Number, default: 0 },
  reassignmentHistory: [{
    fromProperty: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    toProperty: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    timestamp: { type: Date, default: Date.now },
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

smartQRSchema.index({ qrId: 1 });
smartQRSchema.index({ businessId: 1, currentPropertyId: 1 });

export default mongoose.model('SmartQR', smartQRSchema);
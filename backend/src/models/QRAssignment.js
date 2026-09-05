import mongoose from 'mongoose';

const qrAssignmentSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  qrId: { type: String, required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  linkedFrom: { type: Date, default: Date.now },
  linkedTo: { type: Date },
  status: { type: String, enum: ['Current', 'Reassigned', 'Archived'], default: 'Current' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('QRAssignment', qrAssignmentSchema);

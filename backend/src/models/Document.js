import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Ownership', 'Property', 'Marketing', 'Legal', 'Compliance', 'Transaction', 'Other'],
    default: 'Property'
  },
  fileUrl: { type: String, required: true },
  publicId: { type: String },
  fileType: { type: String, default: 'application/pdf' },
  fileSize: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'Missing'], default: 'Pending' },
  version: { type: Number, default: 1 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);

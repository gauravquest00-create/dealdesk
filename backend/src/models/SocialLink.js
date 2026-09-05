import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
  // Project details
  projectName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: 'Exclusive luxury residences available for viewing. Book your private tour today!',
    trim: true,
  },
  linkSlug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  
  // Optional reference to a property
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
  },
  
  // Business/tenant who owns this link
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  
  // Created by which user
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Statistics
  clicks: {
    type: Number,
    default: 0,
  },
  leadsGenerated: {
    type: Number,
    default: 0,
  },
  
  // Soft delete flag - false means hidden from dashboard but public link still works
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  // When soft deleted
  deletedAt: {
    type: Date,
    default: null,
  },
  
}, { timestamps: true });

// Indexes
socialLinkSchema.index({ linkSlug: 1 });
socialLinkSchema.index({ businessId: 1, isActive: 1 });
socialLinkSchema.index({ businessId: 1, createdAt: -1 });

const SocialLink = mongoose.model('SocialLink', socialLinkSchema);
export default SocialLink;
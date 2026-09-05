import mongoose from 'mongoose';

const viewingReportSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  viewingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Viewing', required: true, unique: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  overallInterest: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  clientDecision: {
    type: String,
    enum: ['Not Interested', 'Considering', 'Interested', 'Ready to Proceed'],
    required: true
  },
  likedAspects: { type: String, default: '' },
  dislikedAspects: { type: String, default: '' },
  clientRequirementsMentioned: { type: String, default: '' },
  objections: { type: String, default: '' },
  propertyConditionRating: { type: Number, min: 1, max: 5, default: 5 },
  photosMatchedReality: { type: Boolean, default: true },
  nextAction: { type: String, required: true },
  nextFollowUpDate: { type: Date },
  additionalNotes: { type: String, default: '' },

  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('ViewingReport', viewingReportSchema);

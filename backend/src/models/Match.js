import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  matchScore: { type: Number, required: true, min: 0, max: 100 },
  scoreBreakdown: {
    budgetScore: Number,
    locationScore: Number,
    configurationScore: Number,
    propertyTypeScore: Number,
    sizeScore: Number,
    transactionScore: Number,
    otherScore: Number,
  },
  whyMatched: [{ type: String }],
  recommendedAction: { type: String, default: 'Suggest Property' },
  status: { type: String, enum: ['Active', 'Dismissed', 'Converted'], default: 'Active' },
  calculatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

matchSchema.index({ businessId: 1, leadId: 1, propertyId: 1 }, { unique: true });

export default mongoose.model('Match', matchSchema);

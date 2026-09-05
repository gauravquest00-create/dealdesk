import mongoose from 'mongoose';

const trialEligibilitySchema = new mongoose.Schema({
  emailHash: { type: String, required: true, index: true },
  domainHash: { type: String, required: true, index: true },
  phoneHash: { type: String, index: true },
  deviceRiskToken: { type: String },
  businessNameHash: { type: String },
  isEligible: { type: Boolean, default: true },
  previousBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  claimedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('TrialEligibility', trialEligibilitySchema);

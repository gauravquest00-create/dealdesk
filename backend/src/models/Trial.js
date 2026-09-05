import mongoose from 'mongoose';
import { TRIAL_STATUS } from '../constants/statuses.js';

const trialSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
  startedAt: { type: Date, default: Date.now },
  endsAt: { type: Date, required: true },
  status: {
    type: String,
    enum: Object.values(TRIAL_STATUS),
    default: TRIAL_STATUS.ACTIVE,
    index: true,
  },
  convertedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Trial', trialSchema);

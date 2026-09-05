import mongoose from 'mongoose';
import { ROLES, AGENT_SUB_ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  username: { type: String, required: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.AGENT,
    index: true,
  },
  subRole: {
    type: String,
    enum: Object.values(AGENT_SUB_ROLES),
    default: AGENT_SUB_ROLES.HYBRID_AGENT,
  },
  department: { type: String, default: 'Sales' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  permissions: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';
import { PROPERTY_STATUS } from '../constants/statuses.js';

const propertySchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  propertyCode: { type: String, required: true, trim: true }, // e.g., DD-PR-101 or DLF-CAM-1802
  projectName: { type: String, required: true, trim: true, index: true },
  propertyType: { type: String, required: true }, // Apartment, Villa, Penthouse, Builder Floor, Duplex, Plot, Commercial
  configuration: { type: String, required: true }, // 1 BHK, 2 BHK, 3 BHK, 4 BHK, 5+ BHK, Duplex Penthouse
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  balconies: { type: Number, default: 0 },
  sizeSqFt: { type: Number, required: true }, // Primary display area
  carpetAreaSqFt: { type: Number },
  superAreaSqFt: { type: Number },
  floor: { type: String, default: '' },
  totalFloors: { type: Number },
  facing: { type: String, default: 'East' },
  furnishing: { type: String, enum: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'], default: 'Semi-Furnished' },
  possessionStatus: { type: String, enum: ['Ready to Move', 'Under Construction', 'New Launch'], default: 'Ready to Move' },

  transactionType: { type: String, enum: ['Sale', 'Rent', 'Lease'], default: 'Sale' },
  askingPrice: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  isNegotiable: { type: Boolean, default: true },
  monthlyMaintenance: { type: Number, default: 0 },
  commissionPercent: { type: Number, default: 2.0 },
  expectedRoi: { type: Number, default: 0 },

  address: { type: String, required: true },
  sector: { type: String, default: '' },
  city: { type: String, default: 'Gurugram' },
  postalCode: { type: String, default: '' },
  googleMapsUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  amenities: [{ type: String }],

  photos: [{
    url: { type: String, required: true },
    publicId: { type: String },
    isCover: { type: Boolean, default: false }
  }],
  floorPlanUrl: { type: String, default: '' },
  reraNumber: { type: String, default: '' },
  privateNotes: { type: String, default: '' },

  status: {
    type: String,
    enum: Object.values(PROPERTY_STATUS),
    default: PROPERTY_STATUS.AVAILABLE,
    index: true,
  },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  
  // Intelligence metrics
  viewCount: { type: Number, default: 0 },
  qrScanCount: { type: Number, default: 0 },
  viewingCount: { type: Number, default: 0 },
  leadCount: { type: Number, default: 0 },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

propertySchema.index({ businessId: 1, propertyCode: 1 }, { unique: true });
propertySchema.index({ businessId: 1, projectName: 1, configuration: 1 });

export default mongoose.model('Property', propertySchema);

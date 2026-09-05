import mongoose from 'mongoose';

const openHouseSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  title: { type: String, required: true },
  eventDate: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true }, // HH:mm
  hostAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventQrCode: { type: String, unique: true, index: true }, // generated unique QR token
  registrationRequired: { type: Boolean, default: true },
  maxVisitors: { type: Number, default: 50 },
  status: { type: String, enum: ['Upcoming', 'Active', 'Completed', 'Cancelled'], default: 'Upcoming' },
  
  registrationsCount: { type: Number, default: 0 },
  visitorsAttendedCount: { type: Number, default: 0 },
  leadsGeneratedCount: { type: Number, default: 0 },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('OpenHouse', openHouseSchema);

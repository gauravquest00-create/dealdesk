import mongoose from 'mongoose';

const openHouseRegistrationSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  openHouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'OpenHouse', required: true, index: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  registeredAt: { type: Date, default: Date.now },
  attended: { type: Boolean, default: false },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
}, { timestamps: true });

export default mongoose.model('OpenHouseRegistration', openHouseRegistrationSchema);

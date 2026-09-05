import OpenHouse from '../models/OpenHouse.js';
import OpenHouseRegistration from '../models/OpenHouseRegistration.js';
import Lead from '../models/Lead.js';
import { generateRandomString } from '../utils/hash.js';
import { LEAD_SOURCE, LEAD_STATUS, LEAD_TEMPERATURE } from '../constants/statuses.js';

export const listOpenHouses = async (req, res, next) => {
  try {
    const query = { ...req.agentQuery };
    const events = await OpenHouse.find(query)
      .populate('propertyId', 'propertyCode projectName configuration askingPrice address')
      .populate('hostAgentId', 'name email phone photoUrl')
      .sort({ eventDate: 1 })
      .lean();

    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

export const createOpenHouse = async (req, res, next) => {
  try {
    const eventQr = `OH-${generateRandomString(6)}`;
    const eventDate = req.body.eventDate || req.body.date || new Date().toISOString().split('T')[0];
    const startTime = req.body.startTime || '11:00';
    const endTime = req.body.endTime || '16:00';

    const openHouse = await OpenHouse.create({
      ...req.body,
      eventDate,
      startTime,
      endTime,
      businessId: req.businessId,
      eventQrCode: eventQr,
      hostAgentId: req.body.hostAgentId || req.user._id,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Open House scheduled', data: openHouse });
  } catch (err) {
    next(err);
  }
};

export const publicRegisterVisitor = async (req, res, next) => {
  try {
    const { eventQrCode, name, phone, email } = req.body;
    const event = await OpenHouse.findOne({ eventQrCode });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Auto-create lead
    const lead = await Lead.create({
      businessId: event.businessId,
      name,
      phone,
      email,
      source: LEAD_SOURCE.OPEN_HOUSE,
      status: LEAD_STATUS.NEW,
      temperature: LEAD_TEMPERATURE.WARM,
      score: 60,
      interestedPropertyId: event.propertyId,
      assignedAgentId: event.hostAgentId,
      notes: `Registered for Open House: ${event.title} on ${event.eventDate}`,
    });

    const reg = await OpenHouseRegistration.create({
      businessId: event.businessId,
      openHouseId: event._id,
      propertyId: event.propertyId,
      name,
      phone,
      email,
      leadId: lead._id,
    });

    event.registrationsCount += 1;
    event.leadsGeneratedCount += 1;
    await event.save();

    res.status(201).json({ success: true, message: 'Registration confirmed. Welcome to the Open House!', data: reg });
  } catch (err) {
    next(err);
  }
};

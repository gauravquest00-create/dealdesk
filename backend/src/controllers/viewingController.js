import mongoose from 'mongoose';
import Viewing from '../models/Viewing.js';
import ViewingReport from '../models/ViewingReport.js';
import Lead from '../models/Lead.js';
import Property from '../models/Property.js';
import Activity from '../models/Activity.js';
import { LEAD_TEMPERATURE, LEAD_STATUS, VIEWING_STATUS } from '../constants/statuses.js';

export const listViewings = async (req, res, next) => {
  try {
    const query = { ...req.agentQuery };
    const viewings = await Viewing.find(query)
      .populate('propertyId', 'propertyCode projectName configuration askingPrice address')
      .populate('leadId', 'name phone email temperature score')
      .populate('agentId', 'name email phone photoUrl')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
      .lean();

    res.json({ success: true, data: viewings });
  } catch (err) {
    next(err);
  }
};

export const scheduleViewing = async (req, res, next) => {
  try {
    let { propertyId, leadId, scheduledDate, scheduledTime, agentId, clientName, clientPhone, notes } = req.body;

    // 1. Resolve / create Lead if leadId is empty or not a valid ObjectId
    if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
      if (clientPhone || clientName) {
        let lead = clientPhone ? await Lead.findOne({ businessId: req.businessId, phone: clientPhone }) : null;
        if (!lead) {
          lead = await Lead.create({
            businessId: req.businessId,
            name: clientName || 'Client Prospect',
            phone: clientPhone || '+91 98765 43210',
            interestedPropertyId: propertyId,
            source: 'Manual',
            status: LEAD_STATUS.VIEWING_SCHEDULED,
            temperature: LEAD_TEMPERATURE.HOT,
            score: 75,
            notes: notes ? `Scheduled viewing: ${notes}` : 'Scheduled walkthrough',
          });
        }
        leadId = lead._id;
      } else {
        // Fallback to most recent lead for business or create placeholder
        let lead = await Lead.findOne({ businessId: req.businessId });
        if (!lead) {
          lead = await Lead.create({
            businessId: req.businessId,
            name: clientName || 'Walk-in Client',
            phone: '+91 98765 43210',
            interestedPropertyId: propertyId,
            source: 'Manual',
            status: LEAD_STATUS.VIEWING_SCHEDULED,
            temperature: LEAD_TEMPERATURE.HOT,
            score: 75,
          });
        }
        leadId = lead._id;
      }
    }

    // 2. Parse scheduledDate and scheduledTime safely (handle ISO string like 2026-09-04T15:00:00)
    let safeDate = scheduledDate;
    let safeTime = scheduledTime || '15:00';
    if (safeDate && safeDate.includes('T')) {
      const parts = safeDate.split('T');
      safeDate = parts[0];
      if (!scheduledTime && parts[1]) {
        safeTime = parts[1].slice(0, 5);
      }
    }
    if (!safeDate) {
      safeDate = new Date().toISOString().split('T')[0];
    }

    const viewing = await Viewing.create({
      businessId: req.businessId,
      propertyId,
      leadId,
      agentId: agentId || req.user._id,
      scheduledDate: safeDate,
      scheduledTime: safeTime,
      status: VIEWING_STATUS.SCHEDULED,
      cancellationReason: notes || undefined,
      createdBy: req.user._id,
    });

    // Update lead status & score
    await Lead.findByIdAndUpdate(leadId, {
      status: LEAD_STATUS.VIEWING_SCHEDULED,
      $inc: { score: 15 },
      $push: { scoreBreakdown: { action: 'Viewing Scheduled', delta: 15, timestamp: new Date() } },
    });

    await Activity.create({
      businessId: req.businessId,
      userId: req.user._id,
      entityType: 'Viewing',
      entityId: viewing._id,
      action: 'SCHEDULED',
      description: `Scheduled viewing for ${safeDate} at ${safeTime}`,
    });

    res.status(201).json({ success: true, message: 'Viewing scheduled successfully', data: viewing });
  } catch (err) {
    next(err);
  }
};

export const submitViewingReport = async (req, res, next) => {
  try {
    const viewing = await Viewing.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!viewing) return res.status(404).json({ success: false, message: 'Viewing not found' });

    const report = await ViewingReport.create({
      ...req.body,
      businessId: req.businessId,
      viewingId: viewing._id,
      propertyId: viewing.propertyId,
      leadId: viewing.leadId,
      agentId: req.user._id,
    });

    viewing.hasReport = true;
    viewing.status = VIEWING_STATUS.COMPLETED;
    await viewing.save();

    // Rule-based lead updates
    const temp = req.body.overallInterest === 'High' ? LEAD_TEMPERATURE.HOT : (req.body.overallInterest === 'Medium' ? LEAD_TEMPERATURE.WARM : LEAD_TEMPERATURE.COLD);
    const delta = req.body.overallInterest === 'High' ? 25 : (req.body.overallInterest === 'Medium' ? 10 : -10);

    await Lead.findByIdAndUpdate(viewing.leadId, {
      status: LEAD_STATUS.VIEWING_COMPLETED,
      temperature: temp,
      $inc: { score: delta },
      $push: { scoreBreakdown: { action: `Viewing Report: ${req.body.clientDecision || 'Feedback logged'}`, delta, timestamp: new Date() } },
      nextAction: req.body.nextAction || 'Follow up with offer discussions',
      nextFollowUpDate: req.body.nextFollowUpDate,
    });

    res.status(201).json({ success: true, message: 'Viewing report submitted', data: report });
  } catch (err) {
    next(err);
  }
};

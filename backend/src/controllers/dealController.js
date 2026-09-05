import mongoose from 'mongoose';
import Deal from '../models/Deal.js';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import { DEAL_STAGE } from '../constants/statuses.js';

// Stage mapper to ensure valid DEAL_STAGE enum values
const mapDealStage = (stageInput) => {
  const map = {
    'Offer Made': DEAL_STAGE.OFFER_NEGOTIATION,
    'Under Negotiation': DEAL_STAGE.OFFER_NEGOTIATION,
    'Offer/Negotiation': DEAL_STAGE.OFFER_NEGOTIATION,
    'Agreement Signed': DEAL_STAGE.WON,
    'Closed Won': DEAL_STAGE.WON,
    'Won': DEAL_STAGE.WON,
    'Lost': DEAL_STAGE.LOST,
    'New': DEAL_STAGE.NEW,
    'Qualified': DEAL_STAGE.QUALIFIED,
    'Viewing': DEAL_STAGE.VIEWING,
  };
  return map[stageInput] || DEAL_STAGE.OFFER_NEGOTIATION;
};

export const listDeals = async (req, res, next) => {
  try {
    const query = { ...req.agentQuery };
    const deals = await Deal.find(query)
      .populate('leadId', 'name phone email')
      .populate('propertyId', 'propertyCode projectName askingPrice configuration')
      .populate('agentId', 'name email photoUrl')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: deals });
  } catch (err) {
    next(err);
  }
};

export const createDeal = async (req, res, next) => {
  try {
    let { propertyId, leadId, title, dealValue, commissionPercent, commissionPct, stage, expectedCloseDate, clientName, clientPhone } = req.body;

    // 1. Ensure a valid Lead is associated
    if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
      if (clientPhone || clientName) {
        let lead = clientPhone ? await Lead.findOne({ businessId: req.businessId, phone: clientPhone }) : null;
        if (!lead) {
          lead = await Lead.create({
            businessId: req.businessId,
            name: clientName || 'Deal Buyer',
            phone: clientPhone || '+91 98765 43210',
            interestedPropertyId: propertyId,
            source: 'Manual',
            status: 'Negotiation',
            temperature: 'Hot',
            score: 85,
          });
        }
        leadId = lead._id;
      } else {
        // Find existing lead or create default
        let lead = await Lead.findOne({ businessId: req.businessId, interestedPropertyId: propertyId });
        if (!lead) {
          lead = await Lead.findOne({ businessId: req.businessId });
        }
        if (!lead) {
          lead = await Lead.create({
            businessId: req.businessId,
            name: 'Buyer Prospect',
            phone: '+91 98765 43210',
            interestedPropertyId: propertyId,
            source: 'Manual',
            status: 'Negotiation',
            temperature: 'Hot',
            score: 85,
          });
        }
        leadId = lead._id;
      }
    }

    const val = Number(dealValue) || 0;
    const commPercent = Number(commissionPercent || commissionPct) || 2.0;
    const commVal = Math.round((val * commPercent) / 100);
    const validStage = mapDealStage(stage);

    const deal = await Deal.create({
      businessId: req.businessId,
      propertyId,
      leadId,
      agentId: req.body.agentId || req.user._id,
      title: title || 'Property Purchase Deal',
      dealValue: val,
      stage: validStage,
      commissionPercent: commPercent,
      commissionValue: commVal,
      expectedClosingDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
      createdBy: req.user._id,
    });

    await Activity.create({
      businessId: req.businessId,
      userId: req.user._id,
      entityType: 'Deal',
      entityId: deal._id,
      action: 'CREATED',
      description: `New deal initiated for $${val.toLocaleString()} (Stage: ${validStage})`,
    });

    res.status(201).json({ success: true, message: 'Deal created', data: deal });
  } catch (err) {
    next(err);
  }
};

export const updateDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

    if (req.body.stage) {
      req.body.stage = mapDealStage(req.body.stage);
    }

    Object.assign(deal, req.body);
    if (req.body.dealValue || req.body.commissionPercent || req.body.commissionPct) {
      const commPct = req.body.commissionPercent || req.body.commissionPct || deal.commissionPercent || 2.0;
      deal.commissionPercent = commPct;
      deal.commissionValue = Math.round((deal.dealValue * commPct) / 100);
    }
    deal.updatedBy = req.user._id;
    await deal.save();

    res.json({ success: true, message: 'Deal updated', data: deal });
  } catch (err) {
    next(err);
  }
};

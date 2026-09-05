import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import Match from '../models/Match.js';
import { calculateMatchScore, sanitizePropertyForAgentPreview, sanitizeLeadForAgentPreview } from '../services/matchService.js';
import { PROPERTY_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

export const getMatchesForProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.propertyId, businessId: req.businessId });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const leadsQuery = { businessId: req.businessId };
    if (req.user.role === ROLES.AGENT) {
      leadsQuery.assignedAgentId = req.user._id;
    }

    const leads = await Lead.find(leadsQuery).populate('assignedAgentId', 'name email').lean();

    const matches = leads.map(lead => {
      const match = calculateMatchScore(lead, property);
      return {
        lead: sanitizeLeadForAgentPreview(lead, req.user),
        property: sanitizePropertyForAgentPreview(property, req.user),
        ...match
      };
    }).filter(m => m.matchScore >= 50).sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, data: matches });
  } catch (err) {
    next(err);
  }
};

export const getMatchesForLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.leadId, businessId: req.businessId });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const properties = await Property.find({
      businessId: req.businessId,
      status: PROPERTY_STATUS.AVAILABLE
    }).populate('assignedAgentId', 'name email').lean();

    const matches = properties.map(prop => {
      const match = calculateMatchScore(lead, prop);
      return {
        lead: sanitizeLeadForAgentPreview(lead, req.user),
        property: sanitizePropertyForAgentPreview(prop, req.user),
        ...match
      };
    }).filter(m => m.matchScore >= 45).sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, data: matches });
  } catch (err) {
    next(err);
  }
};

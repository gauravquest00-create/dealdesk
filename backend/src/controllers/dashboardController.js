import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import Viewing from '../models/Viewing.js';
import Deal from '../models/Deal.js';
import SmartQR from '../models/SmartQR.js';
import Document from '../models/Document.js';
import OpenHouse from '../models/OpenHouse.js';
import { ROLES } from '../constants/roles.js';
import { LEAD_STATUS, LEAD_TEMPERATURE, PROPERTY_STATUS } from '../constants/statuses.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const isAgent = req.user.role === ROLES.AGENT;
    const bizId = req.businessId;
    const agentFilter = isAgent ? { assignedAgentId: req.user._id } : {};
    const viewingAgentFilter = isAgent ? { agentId: req.user._id } : {};

    const todayStr = new Date().toISOString().split('T')[0];

    // Core KPIs
    const [
      totalProperties,
      totalLeads,
      totalViewings,
      totalDeals,
      todayViewings,
      followUpsDue,
      hotLeadsNotContacted,
      pendingViewingReports,
      missingDocsProperties,
      activeQRs,
      totalOpenHouses,
    ] = await Promise.all([
      Property.countDocuments({ businessId: bizId, ...agentFilter }),
      Lead.countDocuments({ businessId: bizId, ...agentFilter }),
      Viewing.countDocuments({ businessId: bizId, ...viewingAgentFilter }),
      Deal.countDocuments({ businessId: bizId, ...agentFilter, stage: { $ne: 'Lost' } }),
      Viewing.find({ businessId: bizId, scheduledDate: todayStr, ...viewingAgentFilter })
        .populate('propertyId', 'projectName propertyCode address')
        .populate('leadId', 'name phone')
        .lean(),
      Lead.find({ businessId: bizId, nextFollowUpDate: { $lte: new Date() }, ...agentFilter }).limit(5).lean(),
      Lead.find({ businessId: bizId, temperature: LEAD_TEMPERATURE.HOT, status: LEAD_STATUS.NEW, ...agentFilter }).limit(5).lean(),
      Viewing.find({ businessId: bizId, hasReport: false, status: 'Completed', ...viewingAgentFilter }).populate('propertyId leadId').limit(5).lean(),
      Property.find({ businessId: bizId, ...agentFilter }).limit(5).lean(),
      SmartQR.countDocuments({ businessId: bizId }),
      OpenHouse.countDocuments({ businessId: bizId }),
    ]);

    const actionRequired = {
      followUpsDueCount: followUpsDue.length,
      hotLeadsCount: hotLeadsNotContacted.length,
      pendingReportsCount: pendingViewingReports.length,
      followUpsDue,
      hotLeadsNotContacted,
      pendingViewingReports,
    };

    res.json({
      success: true,
      data: {
        role: req.user.role,
        isAgent,
        counts: {
          properties: totalProperties,
          leads: totalLeads,
          viewings: totalViewings,
          deals: totalDeals,
          activeQRs,
          openHouses: totalOpenHouses,
        },
        actionRequired,
        todayViewings,
      }
    });
  } catch (err) {
    next(err);
  }
};

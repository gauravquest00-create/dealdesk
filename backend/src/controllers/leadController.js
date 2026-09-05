import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import Viewing from '../models/Viewing.js';
import Deal from '../models/Deal.js';
import Communication from '../models/Communication.js';
import SocialLink from '../models/SocialLink.js';
import { LEAD_TEMPERATURE, LEAD_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

// ============================================================
// LIST LEADS - with full filtering
// ============================================================
export const listLeads = async (req, res, next) => {
  try {
    const { 
      status, 
      temperature, 
      source, 
      search, 
      sourceSocialLinkId,
      sourceEventId,
      assignedAgentId,
      limit,
      page
    } = req.query;
    
    const query = { ...req.agentQuery };

    if (status) query.status = status;
    if (temperature) query.temperature = temperature;
    if (source) query.source = source;
    if (sourceSocialLinkId) query.sourceSocialLinkId = sourceSocialLinkId;
    if (sourceEventId) query.sourceEventId = sourceEventId;
    if (assignedAgentId) query.assignedAgentId = assignedAgentId;
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = page ? (parseInt(page) - 1) * parseInt(limit || 50) : 0;
    const limitNum = parseInt(limit || 50);

    const leads = await Lead.find(query)
      .populate('assignedAgentId', 'name email phone photoUrl')
      .populate('interestedPropertyId', 'propertyCode projectName configuration askingPrice')
      .populate('sourceSocialLinkId', 'projectName linkSlug')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Lead.countDocuments(query);

    res.json({ 
      success: true, 
      data: leads,
      total,
      page: parseInt(page || 1),
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET SINGLE LEAD
// ============================================================
export const getLead = async (req, res, next) => {
  try {
    const query = { _id: req.params.id, businessId: req.businessId };
    if (req.user.role === ROLES.AGENT) {
      query.assignedAgentId = req.user._id;
    }

    const lead = await Lead.findOne(query)
      .populate('assignedAgentId', 'name email phone photoUrl')
      .populate('interestedPropertyId')
      .populate('sourceSocialLinkId', 'projectName linkSlug')
      .lean();

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found or access restricted' 
      });
    }

    const [viewings, deals, communications, activities] = await Promise.all([
      Viewing.find({ leadId: lead._id, businessId: req.businessId })
        .populate('propertyId agentId')
        .sort({ scheduledDate: -1 })
        .lean(),
      Deal.find({ leadId: lead._id, businessId: req.businessId })
        .populate('propertyId')
        .lean(),
      Communication.find({ leadId: lead._id, businessId: req.businessId })
        .sort({ sentAt: -1 })
        .lean(),
      Activity.find({ entityId: lead._id, businessId: req.businessId })
        .sort({ timestamp: -1 })
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        ...lead,
        viewings,
        deals,
        communications,
        activities,
      }
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// CREATE LEAD (Authenticated)
// ============================================================
export const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      businessId: req.businessId,
      createdBy: req.user._id,
      assignedAgentId: req.body.assignedAgentId || req.user._id,
    });

    await Activity.create({
      businessId: req.businessId,
      userId: req.user._id,
      entityType: 'Lead',
      entityId: lead._id,
      action: 'CREATED',
      description: `New lead created: ${lead.name} (${lead.phone}) from ${lead.source}`,
    });

    res.status(201).json({ 
      success: true, 
      message: 'Lead created', 
      data: lead 
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// PUBLIC CREATE LEAD - No authentication
// ============================================================
export const publicCreateLead = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      source,
      sourceSocialLinkId,
      sourceEventId,
      interestedPropertyId,
      requirements,
      notes,
      status,
      temperature,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required',
      });
    }

    let businessId = null;
    let assignedAgentId = null;

    // If we have a social link, use its business and creator
    if (sourceSocialLinkId) {
      const socialLink = await SocialLink.findById(sourceSocialLinkId);
      if (socialLink) {
        businessId = socialLink.businessId;
        assignedAgentId = socialLink.createdBy;
      }
    }

    // If still no businessId, try to find from sourceEventId (Open House) or fallback
    // For now, return error if we can't determine business
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Unable to determine business. Invalid source.',
      });
    }

    const lead = await Lead.create({
      name,
      phone,
      email: email || '',
      source: source || 'SOCIAL_LINK',
      sourceSocialLinkId: sourceSocialLinkId || null,
      sourceEventId: sourceEventId || null,
      interestedPropertyId: interestedPropertyId || null,
      requirements: requirements || {},
      notes: notes || '',
      status: status || LEAD_STATUS.NEW,
      temperature: temperature || LEAD_TEMPERATURE.WARM,
      businessId,
      assignedAgentId: assignedAgentId || null,
      createdBy: assignedAgentId || null,
    });

    await Activity.create({
      businessId,
      userId: assignedAgentId || null,
      entityType: 'Lead',
      entityId: lead._id,
      action: 'CREATED',
      description: `Lead created from public source: ${source} (${name})`,
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// UPDATE LEAD
// ============================================================
export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    if (req.user.role === ROLES.AGENT && String(lead.assignedAgentId) !== String(req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    Object.assign(lead, req.body);
    lead.updatedBy = req.user._id;
    await lead.save();

    res.json({ 
      success: true, 
      message: 'Lead updated', 
      data: lead 
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// UPDATE LEAD STATUS
// ============================================================
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const leadId = req.params.id;

    if (!status || !Object.values(LEAD_STATUS).includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    const lead = await Lead.findOne({ _id: leadId, businessId: req.businessId });
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    if (req.user.role === ROLES.AGENT && String(lead.assignedAgentId) !== String(req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const oldStatus = lead.status;
    lead.status = status;
    lead.updatedBy = req.user._id;
    await lead.save();

    await Activity.create({
      businessId: req.businessId,
      userId: req.user._id,
      entityType: 'Lead',
      entityId: lead._id,
      action: 'STATUS_CHANGE',
      description: `Lead status changed from ${oldStatus} to ${status}`,
    });

    res.json({ 
      success: true, 
      message: 'Lead status updated', 
      data: lead 
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// UPDATE LEAD TEMPERATURE
// ============================================================
export const updateLeadTemperature = async (req, res, next) => {
  try {
    const { temperature } = req.body;
    const leadId = req.params.id;

    if (!temperature || !Object.values(LEAD_TEMPERATURE).includes(temperature)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid temperature value' 
      });
    }

    const lead = await Lead.findOne({ _id: leadId, businessId: req.businessId });
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    if (req.user.role === ROLES.AGENT && String(lead.assignedAgentId) !== String(req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const oldTemp = lead.temperature;
    lead.temperature = temperature;
    lead.updatedBy = req.user._id;
    await lead.save();

    await Activity.create({
      businessId: req.businessId,
      userId: req.user._id,
      entityType: 'Lead',
      entityId: lead._id,
      action: 'TEMPERATURE_CHANGE',
      description: `Lead temperature changed from ${oldTemp} to ${temperature}`,
    });

    res.json({ 
      success: true, 
      message: 'Lead temperature updated', 
      data: lead 
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// DELETE LEAD (Soft delete)
// ============================================================
export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    if (req.user.role === ROLES.AGENT && String(lead.assignedAgentId) !== String(req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    lead.status = LEAD_STATUS.LOST;
    lead.updatedBy = req.user._id;
    await lead.save();

    await Activity.create({
      businessId: req.businessId,
      userId: req.user._id,
      entityType: 'Lead',
      entityId: lead._id,
      action: 'DELETED',
      description: `Lead ${lead.name} was archived`,
    });

    res.json({ 
      success: true, 
      message: 'Lead archived' 
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// BULK UPDATE LEADS
// ============================================================
export const bulkUpdateLeads = async (req, res, next) => {
  try {
    const { leadIds, updateData } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lead IDs required' 
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Update data required' 
      });
    }

    const query = { 
      _id: { $in: leadIds }, 
      businessId: req.businessId 
    };

    if (req.user.role === ROLES.AGENT) {
      query.assignedAgentId = req.user._id;
    }

    const result = await Lead.updateMany(
      query,
      { 
        ...updateData, 
        updatedBy: req.user._id 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No leads found to update' 
      });
    }

    await Activity.create({
      businessId: req.businessId,
      userId: req.user._id,
      entityType: 'Lead',
      action: 'BULK_UPDATE',
      description: `Bulk updated ${result.modifiedCount} leads`,
    });

    res.json({ 
      success: true, 
      message: `${result.modifiedCount} leads updated`,
      data: result 
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET LEAD STATISTICS
// ============================================================
export const getLeadStats = async (req, res, next) => {
  try {
    const businessId = req.businessId;
    const query = { businessId };

    if (req.user.role === ROLES.AGENT) {
      query.assignedAgentId = req.user._id;
    }

    const [total, byStatus, byTemperature, bySource] = await Promise.all([
      Lead.countDocuments(query),
      Lead.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: query },
        { $group: { _id: '$temperature', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: query },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus,
        byTemperature,
        bySource,
      }
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// ASSIGN LEAD TO AGENT
// ============================================================
export const assignLead = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const leadId = req.params.id;

    if (!agentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Agent ID required' 
      });
    }

    const lead = await Lead.findOne({ _id: leadId, businessId: req.businessId });
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can reassign leads' 
      });
    }

    const oldAgent = lead.assignedAgentId;
    lead.assignedAgentId = agentId;
    lead.updatedBy = req.user._id;
    await lead.save();

    await Activity.create({
      businessId: req.businessId,
      userId: req.user._id,
      entityType: 'Lead',
      entityId: lead._id,
      action: 'ASSIGNED',
      description: `Lead reassigned from ${oldAgent || 'Unassigned'} to ${agentId}`,
    });

    res.json({ 
      success: true, 
      message: 'Lead assigned successfully', 
      data: lead 
    });
  } catch (err) {
    next(err);
  }
};
import Property from '../models/Property.js';
import Viewing from '../models/Viewing.js';
import OpenHouse from '../models/OpenHouse.js';
import SmartQR from '../models/SmartQR.js';
import Lead from '../models/Lead.js';
import Document from '../models/Document.js';
import Deal from '../models/Deal.js';
import Activity from '../models/Activity.js';
import { sanitizePropertyForAgentPreview } from '../services/matchService.js';
import { PROPERTY_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

export const listProperties = async (req, res, next) => {
  try {
    const { status, project, propertyType, search } = req.query;
    const query = { ...req.agentQuery };

    if (status) query.status = status;
    if (project) query.projectName = new RegExp(project, 'i');
    if (propertyType) query.propertyType = propertyType;
    if (search) {
      query.$or = [
        { projectName: new RegExp(search, 'i') },
        { propertyCode: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
      ];
    }

    const properties = await Property.find(query).populate('assignedAgentId', 'name email phone photoUrl').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
};

export const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, businessId: req.businessId })
      .populate('assignedAgentId', 'name email phone photoUrl')
      .lean();

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found', code: 'PROPERTY_NOT_FOUND' });
    }

    // Check agent assignment
    const sanitized = sanitizePropertyForAgentPreview(property, req.user);
    if (sanitized.isLimitedPreview) {
      return res.json({ success: true, data: sanitized, isLimitedPreview: true });
    }

    // Fetch related items for tabs
    const [viewings, openHouses, qr, leads, documents, deals, activities] = await Promise.all([
      Viewing.find({ propertyId: property._id, businessId: req.businessId }).populate('leadId agentId').sort({ scheduledDate: -1 }).lean(),
      OpenHouse.find({ propertyId: property._id, businessId: req.businessId }).populate('hostAgentId').lean(),
      SmartQR.findOne({ currentPropertyId: property._id, businessId: req.businessId }).lean(),
      Lead.find({ interestedPropertyId: property._id, businessId: req.businessId }).lean(),
      Document.find({ propertyId: property._id, businessId: req.businessId }).lean(),
      Deal.find({ propertyId: property._id, businessId: req.businessId }).populate('leadId agentId').lean(),
      Activity.find({ entityId: property._id, businessId: req.businessId }).sort({ timestamp: -1 }).limit(20).lean(),
    ]);

    res.json({
      success: true,
      data: {
        ...property,
        viewings,
        openHouses,
        smartQR: qr,
        leads,
        documents,
        deals,
        activities,
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createProperty = async (req, res, next) => {
  try {
    const code = req.body.propertyCode || `DD-PR-${Math.floor(100 + Math.random() * 900)}`;
    const property = await Property.create({
      ...req.body,
      propertyCode: code,
      businessId: req.businessId,
      createdBy: req.user._id,
      assignedAgentId: req.body.assignedAgentId || req.user._id,
    });

    await Activity.create({
      businessId: req.businessId,
      userId: req.user._id,
      entityType: 'Property',
      entityId: property._id,
      action: 'CREATED',
      description: `Added new property: ${property.projectName} (${property.propertyCode})`,
    });

    res.status(201).json({ success: true, message: 'Property created', data: property });
  } catch (err) {
    next(err);
  }
};

export const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Restrict editing if agent is not assigned
    if (req.user.role === ROLES.AGENT && String(property.assignedAgentId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this property' });
    }

    const previousStatus = property.status;
    Object.assign(property, req.body);
    property.updatedBy = req.user._id;
    await property.save();

    // Log status change activity
    if (req.body.status && req.body.status !== previousStatus) {
      await Activity.create({
        businessId: req.businessId,
        userId: req.user._id,
        entityType: 'Property',
        entityId: property._id,
        action: 'STATUS_CHANGED',
        description: `Status changed from ${previousStatus} to ${property.status}`,
      });
    }

    res.json({ success: true, message: 'Property updated', data: property });
  } catch (err) {
    next(err);
  }
};

export const getReplacementRecommendations = async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Matching Priority: Same project -> Same config -> Same bedroom -> Closest size
    let replacements = await Property.find({
      businessId: req.businessId,
      _id: { $ne: property._id },
      projectName: property.projectName,
      configuration: property.configuration,
      status: PROPERTY_STATUS.AVAILABLE,
    }).lean();

    if (replacements.length === 0) {
      replacements = await Property.find({
        businessId: req.businessId,
        _id: { $ne: property._id },
        projectName: property.projectName,
        bedrooms: property.bedrooms,
        status: PROPERTY_STATUS.AVAILABLE,
      }).sort({ sizeSqFt: 1 }).lean();
    }

    if (replacements.length === 0) {
      replacements = await Property.find({
        businessId: req.businessId,
        _id: { $ne: property._id },
        configuration: property.configuration,
        status: PROPERTY_STATUS.AVAILABLE,
      }).lean();
    }

    res.json({ success: true, data: replacements });
  } catch (err) {
    next(err);
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (err) {
    next(err);
  }
};

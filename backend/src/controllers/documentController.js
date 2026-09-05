import Document from '../models/Document.js';
import Property from '../models/Property.js';
import { ROLES, AGENT_SUB_ROLES } from '../constants/roles.js';

export const listDocuments = async (req, res, next) => {
  try {
    const { propertyId } = req.query;
    const query = { businessId: req.businessId };

    // Agent data isolation
    if (req.user.role === ROLES.AGENT) {
      if (req.user.subRole === AGENT_SUB_ROLES.LEAD_AGENT) {
        return res.status(403).json({ success: false, message: 'Access to property compliance vault restricted for lead agents.', code: 'FORBIDDEN' });
      }
      // If property agent, ensure they only access assigned properties
      const assignedProps = await Property.find({ businessId: req.businessId, assignedAgentId: req.user._id }, '_id');
      const assignedIds = assignedProps.map(p => p._id);
      if (propertyId) {
        if (!assignedIds.some(id => String(id) === String(propertyId))) {
          return res.status(403).json({ success: false, message: 'Unauthorized property document access.', code: 'FORBIDDEN' });
        }
        query.propertyId = propertyId;
      } else {
        query.propertyId = { $in: assignedIds };
      }
    } else if (propertyId) {
      query.propertyId = propertyId;
    }

    const docs = await Document.find(query)
      .populate('propertyId', 'propertyCode projectName address')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
};

export const createDocument = async (req, res, next) => {
  try {
    const doc = await Document.create({
      ...req.body,
      name: req.body.name || req.body.title || 'Property Document',
      businessId: req.businessId,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Document added to property vault', data: doc });
  } catch (err) {
    next(err);
  }
};

export const getChecklist = async (req, res, next) => {
  try {
    const docs = await Document.find({ propertyId: req.params.propertyId, businessId: req.businessId }).lean();
    
    const summary = {
      total: docs.length,
      verified: docs.filter(d => d.status === 'Verified').length,
      pending: docs.filter(d => d.status === 'Pending').length,
      missing: Math.max(0, 6 - docs.length),
      documents: docs,
    };

    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

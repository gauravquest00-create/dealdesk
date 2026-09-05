import Communication from '../models/Communication.js';
import CommunicationTemplate from '../models/CommunicationTemplate.js';
import * as commService from '../services/communicationService.js';

export const listTemplates = async (req, res, next) => {
  try {
    const templates = await CommunicationTemplate.find({
      $or: [{ businessId: req.businessId }, { isSystemDefault: true }]
    }).lean();

    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
};

export const generateDraft = async (req, res, next) => {
  try {
    const result = await commService.generateDraft({
      businessId: req.businessId,
      agentId: req.user._id,
      ...req.body
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const logOutreach = async (req, res, next) => {
  try {
    const record = await commService.logSentCommunication({
      businessId: req.businessId,
      agentId: req.user._id,
      ...req.body
    });

    res.status(201).json({ success: true, message: 'Communication logged', data: record });
  } catch (err) {
    next(err);
  }
};

export const listHistory = async (req, res, next) => {
  try {
    const history = await Communication.find({ businessId: req.businessId })
      .populate('leadId', 'name phone email')
      .populate('propertyId', 'propertyCode projectName')
      .populate('agentId', 'name email')
      .sort({ sentAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const { title, channel, propertyId, templateId, content, targetAudience } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Campaign title and content are required.', code: 'MISSING_FIELDS' });
    }

    const campaign = await commService.createCampaign({
      businessId: req.businessId,
      userId: req.user._id,
      title,
      channel,
      propertyId,
      templateId,
      content,
      targetAudience,
    });

    res.status(201).json({ success: true, message: 'Broadcast campaign initiated successfully', data: campaign });
  } catch (err) {
    next(err);
  }
};

export const listCampaigns = async (req, res, next) => {
  try {
    const campaigns = await commService.listCampaigns(req.businessId);
    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
};

import mongoose from 'mongoose';
import Communication from '../models/Communication.js';
import CommunicationTemplate from '../models/CommunicationTemplate.js';
import Campaign from '../models/Campaign.js';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import Business from '../models/Business.js';

export const interpolateTemplate = (templateBody, variables = {}) => {
  let text = templateBody || '';
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    text = text.replace(regex, val || '');
  }
  return text;
};

export const generateDraft = async ({
  businessId,
  leadId,
  propertyId,
  agentId,
  templateId,
  customBody,
  detailsToggle = {},
  channel = 'WhatsApp'
}) => {
  // Safe Lead lookup - prevent Cast to ObjectId failed for ""
  let lead = null;
  if (leadId && typeof leadId === 'string' && mongoose.Types.ObjectId.isValid(leadId)) {
    lead = await Lead.findOne({ _id: leadId, businessId });
  } else if (!leadId || leadId === '') {
    // Pick the most recent lead as a preview fallback
    lead = await Lead.findOne({ businessId }).sort({ createdAt: -1 });
  }

  // Safe Property lookup - prevent Cast to ObjectId failed for ""
  let property = null;
  if (propertyId && typeof propertyId === 'string' && mongoose.Types.ObjectId.isValid(propertyId)) {
    property = await Property.findOne({ _id: propertyId, businessId });
  } else if (!propertyId || propertyId === '') {
    property = await Property.findOne({ businessId }).sort({ createdAt: -1 });
  }

  const agent = agentId && mongoose.Types.ObjectId.isValid(agentId) ? await User.findById(agentId) : null;
  const business = await Business.findById(businessId);

  let templateText = customBody;
  if (!templateText && templateId && mongoose.Types.ObjectId.isValid(templateId)) {
    const template = await CommunicationTemplate.findById(templateId);
    if (template) templateText = template.body;
  }

  if (!templateText) {
    templateText = `Hello {{client_name}}, this is {{agent_name}} from {{company_name}} regarding {{property_name}}.`;
  }

  // Assemble dynamic variables
  const vars = {
    client_name: lead?.name || 'Client',
    client_phone: lead?.phone || '',
    client_email: lead?.email || '',
    agent_name: agent?.name || 'Real Estate Advisor',
    agent_phone: agent?.phone || '',
    company_name: business?.name || 'DealDesk Workspace',
    property_name: detailsToggle.propertyName !== false && property ? `${property.projectName} (${property.propertyCode})` : '',
    project_name: property?.projectName || '',
    configuration: detailsToggle.configuration !== false && property ? property.configuration : '',
    bedrooms: property?.bedrooms ? `${property.bedrooms} Beds` : '',
    bathrooms: property?.bathrooms ? `${property.bathrooms} Baths` : '',
    property_size: detailsToggle.propertySize && property ? `${property.sizeSqFt} sq.ft` : '',
    price: detailsToggle.price && property ? `$${property.askingPrice.toLocaleString()}` : '',
    location: detailsToggle.location !== false && property ? property.address : '',
    property_link: detailsToggle.propertyLink !== false && property ? `https://dealdesk.com/p/${property.propertyCode}` : '',
  };

  const rendered = interpolateTemplate(templateText, vars).trim();

  return {
    rendered,
    recipient: channel === 'WhatsApp' ? (lead?.phone || '') : (lead?.email || ''),
    channel,
    leadId: lead?._id || null,
    propertyId: property?._id || null,
    variables: vars,
  };
};

export const logSentCommunication = async ({
  businessId,
  leadId,
  propertyId,
  agentId,
  channel,
  content,
  recipient,
  templateName,
}) => {
  // Validate ObjectIds before logging
  const safeLeadId = (leadId && mongoose.Types.ObjectId.isValid(leadId)) ? leadId : null;
  const safePropId = (propertyId && mongoose.Types.ObjectId.isValid(propertyId)) ? propertyId : null;
  const safeAgentId = (agentId && mongoose.Types.ObjectId.isValid(agentId)) ? agentId : null;

  if (!safeLeadId) {
    throw { statusCode: 400, message: 'A valid client lead must be selected before logging outreach.', code: 'INVALID_LEAD_ID' };
  }

  return Communication.create({
    businessId,
    leadId: safeLeadId,
    propertyId: safePropId,
    agentId: safeAgentId,
    channel,
    content,
    recipient: recipient || 'Direct Client',
    templateName: templateName || 'Manual Outreach',
    status: 'Sent',
    sentAt: new Date(),
  });
};

// ==================== CAMPAIGNS ====================
export const createCampaign = async ({
  businessId,
  userId,
  title,
  channel = 'WhatsApp',
  propertyId,
  templateId,
  content,
  targetAudience = 'All Leads',
}) => {
  const safePropId = (propertyId && mongoose.Types.ObjectId.isValid(propertyId)) ? propertyId : null;
  const safeTemplateId = (templateId && mongoose.Types.ObjectId.isValid(templateId)) ? templateId : null;

  // Count matching recipients based on audience
  let audienceQuery = { businessId };
  if (targetAudience === 'Hot Leads Only') audienceQuery.temperature = 'Hot';
  else if (targetAudience === 'Warm Leads') audienceQuery.temperature = 'Warm';
  else if (targetAudience === 'Smart QR Inquiries') audienceQuery.source = 'Smart QR';
  else if (targetAudience === 'Open House Visitors') audienceQuery.source = 'Open House';

  const recipientCount = await Lead.countDocuments(audienceQuery);

  const campaign = await Campaign.create({
    businessId,
    title,
    channel,
    propertyId: safePropId,
    templateId: safeTemplateId,
    content,
    targetAudience,
    status: 'Active',
    totalRecipients: recipientCount || 1,
    sentCount: recipientCount || 1,
    scheduledAt: new Date(),
    createdBy: userId,
  });

  return campaign;
};

export const listCampaigns = async (businessId) => {
  return Campaign.find({ businessId })
    .populate('propertyId', 'projectName propertyCode')
    .sort({ createdAt: -1 })
    .lean();
};

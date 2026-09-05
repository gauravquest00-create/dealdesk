import SmartQR from '../models/SmartQR.js';
import Property from '../models/Property.js';
import QRActivity from '../models/QRActivity.js';
import QRAssignment from '../models/QRAssignment.js';
import Lead from '../models/Lead.js';
import Business from '../models/Business.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { PROPERTY_STATUS, QR_EVENT_TYPES, LEAD_SOURCE, LEAD_STATUS, LEAD_TEMPERATURE } from '../constants/statuses.js';
import { generateRandomString } from '../utils/hash.js';

export const resolveQR = async (qrId, metadata = {}) => {
  const qr = await SmartQR.findOne({ qrId })
    .populate({
      path: 'currentPropertyId',
      populate: { path: 'assignedAgentId', select: 'name email phone photoUrl department' }
    })
    .populate({
      path: 'replacementPropertyId',
      populate: { path: 'assignedAgentId', select: 'name email phone photoUrl department' }
    })
    .populate('businessId', 'name phone email logoUrl city currency');

  if (!qr) {
    throw { statusCode: 404, message: 'Smart QR not found', code: 'QR_NOT_FOUND' };
  }

  // Record scan event
  await QRActivity.create({
    businessId: qr.businessId?._id || qr.businessId,
    qrId: qr.qrId,
    propertyId: qr.currentPropertyId?._id,
    eventType: QR_EVENT_TYPES.QR_SCANNED,
    ipHash: metadata.ip ? metadata.ip.slice(0, 16) : '',
    userAgent: metadata.userAgent || '',
    referrer: metadata.referrer || '',
  });

  qr.scanCount = (qr.scanCount || 0) + 1;
  await qr.save();

  const property = qr.currentPropertyId;
  const business = qr.businessId;

  // If property is available or active, return directly
  if (property && property.status === PROPERTY_STATUS.AVAILABLE) {
    return {
      qrId: qr.qrId,
      status: 'AVAILABLE',
      property,
      replacementProperty: null,
      isSoldFallback: false,
      business,
      advisor: property.assignedAgentId || null,
    };
  }

  // Property is Sold or Unavailable -> Trigger Replacement Inventory Intelligence
  let replacement = qr.replacementPropertyId;
  if (!replacement && property) {
    // Priority 1: Same project + same configuration
    replacement = await Property.findOne({
      businessId: qr.businessId?._id || qr.businessId,
      _id: { $ne: property._id },
      projectName: property.projectName,
      configuration: property.configuration,
      status: PROPERTY_STATUS.AVAILABLE,
    }).populate('assignedAgentId', 'name email phone photoUrl department');

    // Priority 2: Same project + same bedrooms + closest size
    if (!replacement) {
      replacement = await Property.findOne({
        businessId: qr.businessId?._id || qr.businessId,
        _id: { $ne: property._id },
        projectName: property.projectName,
        bedrooms: property.bedrooms,
        status: PROPERTY_STATUS.AVAILABLE,
      }).sort({ sizeSqFt: 1 }).populate('assignedAgentId', 'name email phone photoUrl department');
    }

    // Priority 3: Similar configuration in any project
    if (!replacement) {
      replacement = await Property.findOne({
        businessId: qr.businessId?._id || qr.businessId,
        _id: { $ne: property._id },
        configuration: property.configuration,
        status: PROPERTY_STATUS.AVAILABLE,
      }).populate('assignedAgentId', 'name email phone photoUrl department');
    }
  }

  const effectiveProp = replacement || property;

  return {
    qrId: qr.qrId,
    status: property ? property.status : 'UNASSIGNED',
    property,
    replacementProperty: replacement || null,
    isSoldFallback: true,
    business,
    advisor: effectiveProp?.assignedAgentId || null,
    message: property 
      ? `Original listing ${property.propertyCode} is ${property.status}. Showing best matching replacement inventory.` 
      : 'QR is currently unassigned.',
  };
};

export const submitQREnquiry = async ({
  qrId,
  propertyId,
  name,
  phone,
  email = '',
  preferredDate = '',
  preferredTime = '',
  message = '',
  metadata = {}
}) => {
  const qr = await SmartQR.findOne({ qrId });
  if (!qr) {
    throw { statusCode: 404, message: 'Smart QR code not found', code: 'QR_NOT_FOUND' };
  }

  const effectivePropId = propertyId || qr.currentPropertyId;
  const property = effectivePropId ? await Property.findById(effectivePropId).populate('assignedAgentId') : null;
  const business = await Business.findById(qr.businessId);

  // 1. Create Lead in the business workspace
  const lead = await Lead.create({
    businessId: qr.businessId,
    name,
    phone,
    email,
    source: LEAD_SOURCE.SMART_QR,
    status: LEAD_STATUS.NEW,
    temperature: LEAD_TEMPERATURE.HOT,
    score: 75,
    interestedPropertyId: effectivePropId || undefined,
    assignedAgentId: property?.assignedAgentId?._id || undefined,
    requirements: {
      budgetMax: property?.askingPrice || 0,
      preferredConfigurations: property?.configuration ? [property.configuration] : [],
      preferredLocations: property?.projectName ? [property.projectName] : [],
      timeline: preferredDate ? `Viewing on ${preferredDate} ${preferredTime}` : 'Immediate',
    },
    notes: `Public Smart QR (${qr.qrId}) Enquiry: ${message || 'Interested in private viewing'}. Preferred Slot: ${preferredDate || 'Flexible'} ${preferredTime || ''}`,
    nextAction: 'Call client to confirm private viewing appointment',
    nextFollowUpDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
    scoreBreakdown: [
      { action: 'Smart QR Scan & Direct Enquiry', delta: 75, timestamp: new Date() }
    ]
  });

  // 2. Record QR Activity
  await QRActivity.create({
    businessId: qr.businessId,
    qrId: qr.qrId,
    propertyId: effectivePropId,
    eventType: QR_EVENT_TYPES.ENQUIRY_SUBMITTED,
    leadId: lead._id,
    ipHash: metadata.ip ? metadata.ip.slice(0, 16) : '',
    userAgent: metadata.userAgent || '',
    referrer: metadata.referrer || '',
  });

  // 3. Increment counters
  qr.leadCount = (qr.leadCount || 0) + 1;
  qr.interestedCount = (qr.interestedCount || 0) + 1;
  await qr.save();

  if (property) {
    property.leadCount = (property.leadCount || 0) + 1;
    await property.save();
  }

  // 4. Create Workspace Notification
  await Notification.create({
    businessId: qr.businessId,
    userId: property?.assignedAgentId?._id || undefined,
    title: `Hot Lead from Smart QR ${qr.qrId}`,
    message: `${name} (${phone}) enquired about ${property?.projectName || 'listing'}.`,
    type: 'LEAD',
    link: `/app/leads`,
  });

  return {
    success: true,
    message: 'Enquiry received. The authorized listing advisor will contact you shortly.',
    leadId: lead._id,
    advisor: {
      name: property?.assignedAgentId?.name || business?.name || 'Authorized Listing Advisor',
      phone: property?.assignedAgentId?.phone || business?.phone || '',
      email: property?.assignedAgentId?.email || business?.email || '',
      company: business?.name || 'DealDesk Workspace',
    },
    property: {
      projectName: property?.projectName || '',
      propertyCode: property?.propertyCode || '',
      askingPrice: property?.askingPrice || 0,
      configuration: property?.configuration || '',
    }
  };
};

export const createOrReassignQR = async ({ businessId, propertyId, label, userId, qrId = null }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  let qr;

  if (qrId) {
    qr = await SmartQR.findOne({ qrId, businessId });
    if (!qr) throw { statusCode: 404, message: 'QR not found' };
    
    // Archive previous assignment
    await QRAssignment.updateMany(
      { businessId, qrId: qr.qrId, status: 'Current' },
      { linkedTo: new Date(), status: 'Reassigned' }
    );

    qr.currentPropertyId = propertyId;
    qr.label = label || qr.label;
    qr.status = 'Active';
    qr.targetUrl = `${clientUrl}/qr/${qr.qrId}`;
    qr.qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qr.targetUrl)}`;
    await qr.save();
  } else {
    const newQrId = generateRandomString(6);
    const targetUrl = `${clientUrl}/qr/${newQrId}`;
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(targetUrl)}`;

    qr = await SmartQR.create({
      businessId,
      qrId: newQrId,
      currentPropertyId: propertyId,
      label: label || `Smart QR - ${newQrId}`,
      status: 'Active',
      targetUrl,
      qrCodeImageUrl,
      createdBy: userId,
    });
  }

  // Create new active assignment record
  await QRAssignment.create({
    businessId,
    qrId: qr.qrId,
    propertyId,
    linkedFrom: new Date(),
    status: 'Current',
    assignedBy: userId,
  });

  return qr;
};

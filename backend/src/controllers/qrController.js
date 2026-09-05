import QRCode from '../models/SmartQR.js';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import { generateRandomString } from '../utils/hash.js';

// ============================================================
// RESOLVE QR (Public)
// ============================================================
export const resolveQR = async (req, res, next) => {
  try {
    const { qrId } = req.params;
    const qr = await QRCode.findOne({ qrId }).populate('currentPropertyId');
    if (!qr) {
      return res.status(404).json({ success: false, message: 'QR not found' });
    }

    // Increment scan count
    qr.scanCount = (qr.scanCount || 0) + 1;
    await qr.save();

    // Check if current property is available
    const property = qr.currentPropertyId;
    let fallbackProperties = [];
    let showFallback = false;

    if (property) {
      if (property.status === 'Sold' || property.status === 'Under Offer' || property.status === 'Rented') {
        showFallback = true;
        // Find alternative properties in same project
        fallbackProperties = await Property.find({
          _id: { $ne: property._id },
          projectName: property.projectName,
          status: 'Available',
          isActive: true,
        }).limit(5).select('projectName propertyCode configuration askingPrice photos');
      }
    }

    res.json({
      success: true,
      data: {
        qr,
        property: property || null,
        fallbackProperties: showFallback ? fallbackProperties : [],
        isFallback: showFallback,
      }
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// SUBMIT PUBLIC ENQUIRY (from QR scan)
// ============================================================
export const submitPublicEnquiry = async (req, res, next) => {
  try {
    const { qrId, name, phone, email, message, propertyId } = req.body;
    if (!qrId || !name || !phone) {
      return res.status(400).json({ success: false, message: 'QR ID, name, and phone are required' });
    }

    const qr = await QRCode.findOne({ qrId });
    if (!qr) {
      return res.status(404).json({ success: false, message: 'QR not found' });
    }

    // Find the business from the QR's property or fallback
    let businessId = null;
    let interestedPropertyId = propertyId || qr.currentPropertyId?._id || null;

    if (interestedPropertyId) {
      const prop = await Property.findById(interestedPropertyId);
      if (prop) businessId = prop.businessId;
    } else {
      // Fallback: use the business of the QR if any property linked
      if (qr.currentPropertyId) {
        const prop = await Property.findById(qr.currentPropertyId._id);
        if (prop) businessId = prop.businessId;
      }
    }

    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Unable to determine business' });
    }

    const lead = await Lead.create({
      name,
      phone,
      email: email || '',
      source: 'SMART_QR',
      sourceQrId: qr._id,
      interestedPropertyId: interestedPropertyId || null,
      businessId,
      notes: message || `Enquiry from QR ${qrId}`,
      status: 'New',
      temperature: 'Warm',
    });

    // Increment lead count on QR
    qr.leadCount = (qr.leadCount || 0) + 1;
    await qr.save();

    await Activity.create({
      businessId,
      entityType: 'Lead',
      entityId: lead._id,
      action: 'CREATED',
      description: `Lead created from QR scan: ${name} (${phone})`,
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// CREATE OR REASSIGN QR (Protected)
// ============================================================
export const createOrReassignQR = async (req, res, next) => {
  try {
    const { propertyId, qrId } = req.body;
    const businessId = req.businessId;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID is required' });
    }

    // Check property exists and belongs to business
    const property = await Property.findOne({ _id: propertyId, businessId });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    let qr;
    if (qrId) {
      // Reassign existing QR
      qr = await QRCode.findOne({ qrId, businessId });
      if (!qr) {
        return res.status(404).json({ success: false, message: 'QR not found' });
      }
      // Record reassignment history
      if (qr.currentPropertyId) {
        qr.reassignmentHistory = qr.reassignmentHistory || [];
        qr.reassignmentHistory.push({
          fromProperty: qr.currentPropertyId,
          toProperty: propertyId,
          timestamp: new Date(),
        });
      }
      qr.currentPropertyId = propertyId;
      await qr.save();
    } else {
      // Generate new QR code
      const newQrId = `QR-${generateRandomString(6).toUpperCase()}`;
      qr = await QRCode.create({
        qrId: newQrId,
        businessId,
        currentPropertyId: propertyId,
        createdBy: req.user._id,
        reassignmentHistory: [],
      });
    }

    res.status(201).json({
      success: true,
      message: qrId ? 'QR reassigned successfully' : 'QR generated successfully',
      data: qr,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// LIST QRs (Protected)
// ============================================================
export const listQRs = async (req, res, next) => {
  try {
    const qrs = await QRCode.find({ businessId: req.businessId })
      .populate('currentPropertyId', 'projectName propertyCode address configuration')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: qrs });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// GET SINGLE QR (Protected)
// ============================================================
export const getQR = async (req, res, next) => {
  try {
    const { qrId } = req.params;
    const qr = await QRCode.findOne({ qrId, businessId: req.businessId })
      .populate('currentPropertyId');
    if (!qr) {
      return res.status(404).json({ success: false, message: 'QR not found' });
    }
    res.json({ success: true, data: qr });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// UPDATE QR (Protected)
// ============================================================
export const updateQR = async (req, res, next) => {
  try {
    const { qrId } = req.params;
    const { label, status } = req.body;
    const qr = await QRCode.findOne({ qrId, businessId: req.businessId });
    if (!qr) {
      return res.status(404).json({ success: false, message: 'QR not found' });
    }
    if (label) qr.label = label;
    if (status) qr.status = status;
    await qr.save();
    res.json({ success: true, data: qr });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// DELETE QR (Protected)
// ============================================================
export const deleteQR = async (req, res, next) => {
  try {
    const { qrId } = req.params;
    const qr = await QRCode.findOneAndDelete({ qrId, businessId: req.businessId });
    if (!qr) {
      return res.status(404).json({ success: false, message: 'QR not found' });
    }
    res.json({ success: true, message: 'QR deleted' });
  } catch (err) {
    next(err);
  }
};
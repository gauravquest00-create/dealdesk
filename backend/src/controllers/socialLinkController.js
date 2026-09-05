import SocialLink from '../models/SocialLink.js';
import Lead from '../models/Lead.js';
import Business from '../models/Business.js';

// ============================================================
// CREATE - Create a new social link
// ============================================================
export const createSocialLink = async (req, res) => {
  try {
    const { projectName, description, linkSlug, propertyId } = req.body;
    const businessId = req.businessId;
    const userId = req.user._id;

    if (!projectName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project name is required' 
      });
    }

    // Auto-generate slug if not provided
    let finalSlug = linkSlug;
    if (!finalSlug) {
      finalSlug = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Ensure uniqueness - if slug exists, add counter
    const existing = await SocialLink.findOne({ linkSlug: finalSlug });
    if (existing) {
      const count = await SocialLink.countDocuments({ 
        linkSlug: new RegExp(`^${finalSlug}`) 
      });
      finalSlug = `${finalSlug}-${count + 1}`;
    }

    const socialLink = new SocialLink({
      projectName,
      description: description || 'Exclusive luxury residences available for viewing. Book your private tour today!',
      linkSlug: finalSlug,
      propertyId: propertyId || null,
      businessId,
      createdBy: userId,
      isActive: true,
      deletedAt: null,
    });

    await socialLink.save();

    res.status(201).json({
      success: true,
      data: socialLink,
      message: 'Social link created successfully',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================================
// LIST - Get all social links with status filtering
// ============================================================
export const listSocialLinks = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { status } = req.query; // 'active', 'inactive', 'all'

    let filter = { businessId };

    if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'active' || !status) {
      filter.isActive = true;
    }
    // status === 'all' → no isActive filter

    const links = await SocialLink.find(filter)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'projectName propertyCode')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: links,
      total: links.length,
      filter: status || 'active',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================================
// GET BY ID - Get single social link
// ============================================================
export const getSocialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.businessId;

    const link = await SocialLink.findOne({ _id: id, businessId })
      .populate('propertyId', 'projectName propertyCode address')
      .populate('createdBy', 'name email');

    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'Social link not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: link,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================================
// GET BY SLUG - Public (NO AUTH, NO isActive CHECK)
// 🔥 Public link works even if isActive = false
// ============================================================
export const getSocialLinkBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // ⚡ DO NOT check isActive - public link should always work
    const link = await SocialLink.findOne({ linkSlug: slug })
      .populate('propertyId', 'projectName propertyCode address photos')
      .populate('businessId', 'name logoUrl currency');

    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'Link not found' 
      });
    }

    // Increment click count (async, don't wait)
    link.clicks += 1;
    link.save().catch(() => {});

    const businessName = link.businessId?.name || 'DealDesk';

    res.status(200).json({
      success: true,
      data: {
        _id: link._id,
        projectName: link.projectName,
        description: link.description,
        linkSlug: link.linkSlug,
        propertyId: link.propertyId,
        businessName: businessName,
        businessId: link.businessId?._id,
        isActive: link.isActive, // Send status for info
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================================
// UPDATE - Update social link
// ============================================================
export const updateSocialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName, description, linkSlug, propertyId, isActive } = req.body;
    const businessId = req.businessId;

    const link = await SocialLink.findOne({ _id: id, businessId });
    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'Social link not found' 
      });
    }

    // Check slug uniqueness if changed
    if (linkSlug && linkSlug !== link.linkSlug) {
      const existing = await SocialLink.findOne({ 
        linkSlug, 
        _id: { $ne: id } 
      });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'Slug already in use' 
        });
      }
      link.linkSlug = linkSlug;
    }

    if (projectName) link.projectName = projectName;
    if (description !== undefined) link.description = description;
    if (propertyId !== undefined) link.propertyId = propertyId;
    if (isActive !== undefined) link.isActive = isActive;

    await link.save();

    res.status(200).json({
      success: true,
      data: link,
      message: 'Social link updated',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================================
// DELETE - Soft delete (isActive = false)
// 🔥 Public link still works after deletion
// ============================================================
export const deleteSocialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.businessId;

    const link = await SocialLink.findOne({ _id: id, businessId });
    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'Social link not found' 
      });
    }

    // ⚡ SOFT DELETE: Just set isActive = false
    link.isActive = false;
    link.deletedAt = new Date();
    await link.save();

    res.status(200).json({
      success: true,
      message: 'Link removed from dashboard. Public link remains active.',
      data: { 
        _id: link._id,
        isActive: false,
        deletedAt: link.deletedAt,
        note: 'Public link is still active for lead capture'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================================
// REACTIVATE - Bring back to dashboard
// ============================================================
export const reactivateSocialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.businessId;

    const link = await SocialLink.findOne({ _id: id, businessId });
    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'Social link not found' 
      });
    }

    link.isActive = true;
    link.deletedAt = null;
    await link.save();

    res.status(200).json({
      success: true,
      data: link,
      message: 'Social link reactivated successfully',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================================
// GET LEADS - Get leads from a specific social link
// ============================================================
export const getSocialLinkLeads = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.businessId;

    const link = await SocialLink.findOne({ _id: id, businessId });
    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'Social link not found' 
      });
    }

    const leads = await Lead.find({ 
      sourceSocialLinkId: id,
      businessId,
    })
      .sort({ createdAt: -1 })
      .populate('assignedAgentId', 'name');

    res.status(200).json({
      success: true,
      data: leads,
      count: leads.length,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
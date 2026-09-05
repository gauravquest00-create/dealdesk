import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { socialLinkApi, leadApi, billingApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { UpgradePlanModal } from '../components/UpgradePlanModal.jsx';
import { 
  FaLink, 
  FaPlus, 
  FaEye, 
  FaCopy, 
  FaTimes, 
  FaBuilding, 
  FaTrash,
  FaEdit,
  FaExternalLinkAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUsers,
  FaUndo,
  FaHistory,
  FaClock,
  FaArchive,
  FaShieldAlt
} from 'react-icons/fa';
import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import './SocialLinksPage.css';

export const SocialLinksPage = () => {
  const { addToast } = useToast();
  const { user, business } = useAuth();

  const [activeTab, setActiveTab] = useState('active');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadsCount, setLeadsCount] = useState({});
  const [totalCounts, setTotalCounts] = useState({ active: 0, inactive: 0, total: 0 });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [linkLimitExceeded, setLinkLimitExceeded] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    projectName: '',
    description: 'Exclusive luxury residences available for viewing. Book your private tour today!',
    linkSlug: '',
  });

  const [editFormData, setEditFormData] = useState({
    projectName: '',
    description: '',
    linkSlug: '',
  });

  // ============================================================
  // LOAD LINKS
  // ============================================================
  const loadLinks = async () => {
    setLoading(true);
    try {
      const allRes = await socialLinkApi.list({ status: 'all' });
      const allLinks = allRes.data || [];
      
      const active = allLinks.filter(l => l.isActive === true);
      const inactive = allLinks.filter(l => l.isActive === false);
      
      setTotalCounts({
        active: active.length,
        inactive: inactive.length,
        total: allLinks.length,
      });

      const status = activeTab === 'active' ? 'active' : 'inactive';
      const res = await socialLinkApi.list({ status });
      const filteredLinks = res.data || [];
      setLinks(filteredLinks);

      // Fetch lead counts
      const counts = {};
      for (const link of filteredLinks) {
        try {
          const leadRes = await leadApi.list({ sourceSocialLinkId: link._id });
          counts[link._id] = (leadRes.data || []).length;
        } catch {
          counts[link._id] = 0;
        }
      }
      setLeadsCount(counts);

      // Check limit
      await checkSocialLinkLimit();
    } catch (error) {
      addToast('Error loading social links', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, [activeTab]);

  const checkSocialLinkLimit = async () => {
    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.socialLinks;
      if (usage) {
        setLinkLimitExceeded(usage.exceeded || false);
        setLimitInfo(usage);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // ============================================================
  // CREATE
  // ============================================================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.projectName) {
      addToast('Project name is required', 'error');
      return;
    }

    // Check limit first
    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.socialLinks;
      if (usage && usage.exceeded) {
        setLinkLimitExceeded(true);
        setLimitInfo(usage);
        setShowUpgradeModal(true);
        return;
      }
    } catch (error) {
      // Proceed anyway
    }

    const slug = formData.linkSlug || generateSlug(formData.projectName);
    try {
      await socialLinkApi.create({
        ...formData,
        linkSlug: slug,
      });
      addToast('Social link created successfully!');
      setShowCreateModal(false);
      setFormData({ projectName: '', description: '', linkSlug: '' });
      loadLinks();
    } catch (err) {
      if (err?.data?.suggestion) {
        setLinkLimitExceeded(true);
        setLimitInfo(err.data);
        setShowUpgradeModal(true);
        addToast(err.message || 'Social link limit reached', 'error');
      } else {
        addToast(err.message || 'Error creating social link', 'error');
      }
    }
  };

  // ============================================================
  // EDIT
  // ============================================================
  const handleEdit = (link) => {
    setSelectedLink(link);
    setEditFormData({
      projectName: link.projectName,
      description: link.description || '',
      linkSlug: link.linkSlug,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.projectName) {
      addToast('Project name is required', 'error');
      return;
    }

    try {
      const slug = editFormData.linkSlug || generateSlug(editFormData.projectName);
      await socialLinkApi.update(selectedLink._id, {
        ...editFormData,
        linkSlug: slug,
      });
      addToast('Social link updated successfully!');
      setShowEditModal(false);
      setSelectedLink(null);
      loadLinks();
    } catch (err) {
      addToast(err.message || 'Error updating social link', 'error');
    }
  };

  // ============================================================
  // DELETE (Soft Delete)
  // ============================================================
  const handleDeleteClick = (link) => {
    setSelectedLink(link);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLink) return;
    try {
      await socialLinkApi.delete(selectedLink._id);
      addToast('Link removed from dashboard. Public link will continue to work.');
      setShowDeleteModal(false);
      setSelectedLink(null);
      loadLinks();
    } catch (err) {
      addToast(err.message || 'Error deleting link', 'error');
    }
  };

  // ============================================================
  // REACTIVATE
  // ============================================================
  const handleReactivate = async (link) => {
    try {
      await socialLinkApi.reactivate(link._id);
      addToast(`"${link.projectName}" reactivated and back on dashboard!`);
      loadLinks();
    } catch (err) {
      addToast(err.message || 'Error reactivating link', 'error');
    }
  };

  // ============================================================
  // UTILITY
  // ============================================================
  const handleCopyLink = (link) => {
    const url = `${window.location.origin}/social/${link.linkSlug}`;
    navigator.clipboard.writeText(url);
    addToast('Link copied to clipboard!');
  };

  const handlePreview = (link) => {
    setSelectedLink(link);
    setShowPreviewModal(true);
  };

  const handleUpgradeSuccess = async () => {
    await checkSocialLinkLimit();
    addToast('✅ Plan upgraded! You can now create more social links.');
  };

  const getLeadCount = (linkId) => leadsCount[linkId] || 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="soc-page">
      {/* Header */}
      <div className="soc-header">
        <div>
          <h1>Social Links</h1>
          <p className="soc-subtitle">Create shareable links for reels, posts, and ads to capture leads directly into DealDesk.</p>
        </div>
        <button className="soc-btn-primary" onClick={() => setShowCreateModal(true)}>
          <FaPlus /> Create New Link
        </button>
      </div>

      {/* Social Link Usage Banner */}
      <div className={`soc-usage-banner ${linkLimitExceeded ? 'limit-reached' : ''}`}>
        <div className="soc-usage-info">
          <span className="soc-usage-label">Social Links Usage:</span>
          <strong>{totalCounts.active}</strong>
          <span className="soc-usage-separator">/</span>
          <span className={`soc-usage-limit ${linkLimitExceeded ? 'exceeded' : ''}`}>
            {limitInfo?.limit === -1 ? 'Unlimited' : limitInfo?.limit || 'Unlimited'}
          </span>
          {linkLimitExceeded && (
            <span className="soc-usage-badge limit-exceeded">⚠️ Limit Reached</span>
          )}
        </div>
        {linkLimitExceeded && (
          <button className="soc-btn-upgrade" onClick={() => setShowUpgradeModal(true)}>
            <FaShieldAlt /> Upgrade Plan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="soc-tabs">
        <button
          className={`soc-tab ${activeTab === 'active' ? 'soc-tab-active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <FaCheckCircle className="soc-tab-icon active-icon" />
          Active
          <span className="soc-tab-badge active">{totalCounts.active}</span>
        </button>
        <button
          className={`soc-tab ${activeTab === 'inactive' ? 'soc-tab-active' : ''}`}
          onClick={() => setActiveTab('inactive')}
        >
          <FaArchive className="soc-tab-icon inactive-icon" />
          Inactive
          <span className="soc-tab-badge inactive">{totalCounts.inactive}</span>
        </button>
        <div className="soc-tab-total">
          Total: <strong>{totalCounts.total}</strong>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="soc-loading">Loading social links...</div>
      ) : links.length === 0 ? (
        <div className="soc-empty">
          {activeTab === 'active' ? (
            <>
              <FaLink className="soc-empty-icon" />
              <h3>No active social links</h3>
              <p>Create your first social link to start capturing leads from social media.</p>
              <button className="soc-btn-primary" onClick={() => setShowCreateModal(true)}>
                <FaPlus /> Create First Link
              </button>
            </>
          ) : (
            <>
              <FaArchive className="soc-empty-icon" />
              <h3>No inactive links</h3>
              <p>All your social links are currently active. When you delete a link from dashboard, it appears here.</p>
              <p className="soc-empty-hint">Inactive links still work publicly and capture leads.</p>
            </>
          )}
        </div>
      ) : (
        <div className="soc-grid">
          {links.map(link => {
            const linkUrl = `${window.location.origin}/social/${link.linkSlug}`;
            const leadCount = getLeadCount(link._id);
            const isInactive = !link.isActive;

            return (
              <div key={link._id} className={`soc-card ${isInactive ? 'soc-card-inactive' : ''}`}>
                {/* Card Header */}
                <div className="soc-card-header">
                  <div className="soc-card-title-wrap">
                    <FaBuilding className="soc-card-icon" />
                    <h3 className="soc-card-title">{link.projectName}</h3>
                  </div>
                  {isInactive ? (
                    <span className="soc-card-status inactive">Inactive</span>
                  ) : (
                    <span className="soc-card-status active">Active</span>
                  )}
                </div>

                {/* Description */}
                <p className="soc-card-desc">
                  {link.description || 'Exclusive luxury residences available for viewing.'}
                </p>

                {/* Stats */}
                <div className="soc-card-stats">
                  <div>
                    <span className="soc-stat-num">{leadCount}</span>
                    <span className="soc-stat-label">Leads</span>
                  </div>
                  <div>
                    <span className="soc-stat-num">{link.clicks || 0}</span>
                    <span className="soc-stat-label">Clicks</span>
                  </div>
                  <div>
                    <span className="soc-stat-num">
                      {isInactive 
                        ? <FaClock className="soc-stat-icon" />
                        : new Date(link.createdAt).toLocaleDateString()
                      }
                    </span>
                    <span className="soc-stat-label">
                      {isInactive ? 'Removed' : 'Created'}
                    </span>
                  </div>
                </div>

                {/* Deletion Info (Inactive only) */}
                {isInactive && link.deletedAt && (
                  <div className="soc-deleted-banner">
                    <FaHistory className="soc-deleted-icon" />
                    <span>Removed from dashboard on {formatDate(link.deletedAt)}</span>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="soc-card-footer">
                  <button 
                    type="button" 
                    className="soc-btn-preview" 
                    onClick={() => handlePreview(link)}
                  >
                    <FaEye /> Preview
                  </button>
                  <button 
                    type="button" 
                    className="soc-btn-copy" 
                    onClick={() => handleCopyLink(link)}
                  >
                    <FaCopy /> Copy Link
                  </button>
                  <a 
                    href={linkUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="soc-btn-open"
                  >
                    <FaExternalLinkAlt /> Open
                  </a>
                </div>

                {/* Bottom Actions - Edit/Delete/Reactivate */}
                <div className="soc-card-actions-row">
                  {isInactive ? (
                    <button 
                      type="button" 
                      className="soc-btn-icon reactivate"
                      onClick={() => handleReactivate(link)}
                      title="Reactivate - Bring back to dashboard"
                    >
                      <FaUndo /> Reactivate
                    </button>
                  ) : (
                    <>
                      <button 
                        type="button" 
                        className="soc-btn-icon edit"
                        onClick={() => handleEdit(link)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        type="button" 
                        className="soc-btn-icon delete"
                        onClick={() => handleDeleteClick(link)}
                        title="Remove from dashboard"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="soc-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="soc-modal soc-modal-create" onClick={e => e.stopPropagation()}>
            <div className="soc-modal-header">
              <h3>Create Social Link</h3>
              <button type="button" className="soc-modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="soc-modal-form">
              <div className="soc-form-group">
                <label>Project Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Palm Residency Luxury Villas" 
                  value={formData.projectName}
                  onChange={e => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      projectName: name,
                      linkSlug: generateSlug(name)
                    });
                  }}
                />
              </div>
              <div className="soc-form-group">
                <label>Description</label>
                <textarea 
                  rows={3}
                  placeholder="Brief description of the project for the landing page..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="soc-form-group">
                <label>Custom Link Slug (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. palm-residency-villas" 
                  value={formData.linkSlug}
                  onChange={e => setFormData({ 
                    ...formData, 
                    linkSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                  })}
                />
                <p className="soc-form-hint">Leave empty to auto-generate from project name.</p>
              </div>
              <div className="soc-modal-actions">
                <button type="button" className="soc-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="soc-btn-primary">Create Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedLink && (
        <div className="soc-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="soc-modal soc-modal-create" onClick={e => e.stopPropagation()}>
            <div className="soc-modal-header">
              <h3>Edit Social Link</h3>
              <button type="button" className="soc-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate} className="soc-modal-form">
              <div className="soc-form-group">
                <label>Project Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Palm Residency Luxury Villas" 
                  value={editFormData.projectName}
                  onChange={e => {
                    const name = e.target.value;
                    setEditFormData({ 
                      ...editFormData, 
                      projectName: name,
                      linkSlug: generateSlug(name)
                    });
                  }}
                />
              </div>
              <div className="soc-form-group">
                <label>Description</label>
                <textarea 
                  rows={3}
                  placeholder="Brief description of the project for the landing page..."
                  value={editFormData.description}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>
              <div className="soc-form-group">
                <label>Custom Link Slug</label>
                <input 
                  type="text" 
                  placeholder="e.g. palm-residency-villas" 
                  value={editFormData.linkSlug}
                  onChange={e => setEditFormData({ 
                    ...editFormData, 
                    linkSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                  })}
                />
                <p className="soc-form-hint">Leave empty to auto-generate from project name.</p>
              </div>
              <div className="soc-modal-actions">
                <button type="button" className="soc-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="soc-btn-primary">Update Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedLink && (
        <div className="soc-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="soc-modal soc-modal-delete" onClick={e => e.stopPropagation()}>
            <div className="soc-modal-header">
              <div className="soc-delete-icon-wrap">
                <FaExclamationTriangle className="soc-delete-icon" />
              </div>
              <h3>Remove from Dashboard</h3>
              <button type="button" className="soc-modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="soc-delete-body">
              <p>Are you sure you want to remove <strong>"{selectedLink.projectName}"</strong> from dashboard?</p>
              <div className="soc-delete-info">
                <FaCheckCircle className="soc-delete-info-icon" />
                <span>The public link will <strong>continue to work</strong> and capture leads.</span>
              </div>
              <p className="soc-delete-hint">You can view it later in the <strong>Inactive</strong> tab and reactivate anytime.</p>
            </div>
            <div className="soc-modal-actions">
              <button type="button" className="soc-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button type="button" className="soc-btn-danger" onClick={handleDeleteConfirm}>
                <FaTrash /> Remove from Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreviewModal && selectedLink && (
        <div className="soc-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="soc-modal soc-modal-preview" onClick={e => e.stopPropagation()}>
            <div className="soc-modal-header">
              <h3>Preview: {selectedLink.projectName}</h3>
              <button type="button" className="soc-modal-close" onClick={() => setShowPreviewModal(false)}><FaTimes /></button>
            </div>
            <div className="soc-preview-body">
              <div className="soc-preview-container">
                <div className="soc-preview-logo">
                  <DealDeskLogo size="md" theme="dark" />
                </div>
                <div className="soc-preview-header">
                  <h2>{business?.name || 'DealDesk'}</h2>
                  <h3 className="soc-preview-project">{selectedLink.projectName}</h3>
                  <p>{selectedLink.description || 'Exclusive luxury residences available for viewing. Book your private tour today!'}</p>
                </div>
                <div className="soc-preview-form">
                  <div className="soc-preview-group">
                    <label>Full Name *</label>
                    <input type="text" placeholder="Your full name" disabled />
                  </div>
                  <div className="soc-preview-group">
                    <label>Contact Number *</label>
                    <input type="tel" placeholder="+91 98765 43210" disabled />
                  </div>
                  <div className="soc-preview-group">
                    <label>Budget Range</label>
                    <select disabled>
                      <option>Select budget range...</option>
                      <option>Below ₹50 Lakhs</option>
                      <option>₹50 Lakhs - ₹1 Crore</option>
                      <option>₹1 Crore - ₹2 Crore</option>
                      <option>₹2 Crore - ₹5 Crore</option>
                      <option>₹5 Crore - ₹10 Crore</option>
                      <option>₹10 Crore+</option>
                    </select>
                  </div>
                  <button className="soc-preview-submit" disabled>
                    <FaCheckCircle /> Submit Enquiry
                  </button>
                </div>
                <div className="soc-preview-footer">
                  <p>Powered by <strong>DealDesk</strong> — Real Estate CRM</p>
                </div>
              </div>
            </div>
            <div className="soc-modal-actions">
              <button type="button" className="soc-btn-secondary" onClick={() => setShowPreviewModal(false)}>Close Preview</button>
              <button 
                type="button" 
                className="soc-btn-primary" 
                onClick={() => {
                  const url = `${window.location.origin}/social/${selectedLink.linkSlug}`;
                  window.open(url, '_blank');
                }}
              >
                <FaExternalLinkAlt /> Open Live Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE PLAN MODAL */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
        title="Social Link Limit Reached"
        message="You've reached the maximum number of social links in your current plan. Upgrade to create more links and capture more leads."
        feature="Social Links"
      />
    </div>
  );
};
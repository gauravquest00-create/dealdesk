import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  leadApi, 
  propertyApi, 
  matchApi, 
  viewingApi, 
  teamApi,
  communicationApi 
} from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { 
  FaArrowLeft, FaUserTie, FaPhoneAlt, FaEnvelope, FaWhatsapp, FaFire, 
  FaSun, FaSnowflake, FaBuilding, FaBolt, FaCalendarAlt, FaCommentDots, 
  FaHistory, FaEdit, FaUserCheck, FaShareAlt, FaPlus, FaCheck, FaTimes,
  FaExternalLinkAlt, FaClock, FaMapMarkerAlt, FaSave, FaSearch,
  FaHandshake, FaPhone, FaSms, FaEnvelope as FaEnvelopeSolid, FaStickyNote,
  FaHome, FaDollarSign, FaPercent, FaCircle, FaCheckCircle, FaCircle as FaCircleEmpty,
  FaEllipsisV, FaUsers, FaFileAlt, FaTag, FaStar, FaAward, FaRulerCombined,
  FaBed, FaBath, FaRulerCombined as FaSize, FaChevronRight
} from 'react-icons/fa';
import './LeadDetailPage.css';

// ---- Helper for currency symbol ----
const getCurrencySymbol = (currencyCode) => {
  const map = {
    USD: '$',
    INR: '₹',
    AED: 'AED ',
    GBP: '£',
    EUR: '€',
    CAD: 'CA$',
    AUD: 'A$',
  };
  return map[currencyCode] || '$';
};

export const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currency, rates, formatPrice } = useCurrency();

  const [lead, setLead] = useState(null);
  const [matches, setMatches] = useState([]);
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity'); // default to activity

  // Edit mode states
  const [isEditingRequirements, setIsEditingRequirements] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Property search dropdown
  const [showPropertySearch, setShowPropertySearch] = useState(false);
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [isUpdatingProperty, setIsUpdatingProperty] = useState(false);
  const searchRef = useRef(null);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Follow-up form
  const [followUpText, setFollowUpText] = useState('');
  const [followUpDate, setFollowUpDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  // Viewing form
  const [viewingForm, setViewingForm] = useState({
    propertyId: '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '15:00',
    notes: 'Site inspection requested by prospect.',
  });

  // Quick action composer
  const [composerTab, setComposerTab] = useState('note');
  const [composerText, setComposerText] = useState('');

  // ---- Helper: Display price with conversion ----
  const getDisplayPrice = (amount, propCurrency = 'USD') => {
    const targetCurrency = currency;
    const val = amount || 0;
    if (!val) return '—';
    if (propCurrency === targetCurrency) {
      const symbol = getCurrencySymbol(propCurrency);
      return `${symbol}${val.toLocaleString()}`;
    }
    if (!rates[propCurrency] || !rates[targetCurrency]) {
      const symbol = getCurrencySymbol(propCurrency);
      return `${symbol}${val.toLocaleString()}`;
    }
    const usdAmount = val / rates[propCurrency];
    const converted = usdAmount * rates[targetCurrency];
    const symbol = getCurrencySymbol(targetCurrency);
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  };

  // ---- LOAD LEAD (OLD LOGIC) ----
  const loadLead = () => {
    setLoading(true);
    leadApi.get(id)
      .then(res => {
        const data = res.data;
        setLead(data);
        setSelectedAgentId(data.assignedAgentId?._id || '');
        setEditData({
          budgetMin: data.requirements?.budgetMin || 0,
          budgetMax: data.requirements?.budgetMax || 0,
          preferredLocations: data.requirements?.preferredLocations || [],
          preferredConfigurations: data.requirements?.preferredConfigurations || [],
          propertyTypes: data.requirements?.propertyTypes || [],
          minSizeSqFt: data.requirements?.minSizeSqFt || 0,
          transactionType: data.requirements?.transactionType || 'Sale',
          timeline: data.requirements?.timeline || 'Immediate',
          notes: data.notes || '',
        });
      })
      .catch(err => addToast(err.message || 'Error loading lead details', 'error'))
      .finally(() => setLoading(false));

    matchApi.getForLead(id)
      .then(res => setMatches(res.data?.matches || []))
      .catch(() => {});

    teamApi.list()
      .then(res => {
        const leadAgents = (res.data || []).filter(a => 
          a.role === 'ADMIN' || 
          a.subRole === 'LEAD_AGENT' || 
          a.subRole === 'PROPERTY_LEAD_AGENT'
        );
        setAgents(leadAgents);
      })
      .catch(() => {});

    propertyApi.list()
      .then(res => setProperties(res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadLead();
  }, [id]);

  // Close property search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowPropertySearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- HANDLERS (ALL OLD) ----
  const handleStatusChange = async (newStatus) => {
    try {
      await leadApi.update(id, { status: newStatus });
      addToast(`Status updated to ${newStatus}`);
      loadLead();
    } catch (err) {
      addToast(err.message || 'Error updating status', 'error');
    }
  };

  const handleAssignAgent = async (e) => {
    e.preventDefault();
    try {
      await leadApi.update(id, { assignedAgentId: selectedAgentId || null });
      addToast('Lead assignment updated successfully!');
      setShowAssignModal(false);
      loadLead();
    } catch (err) {
      addToast(err.message || 'Error assigning agent', 'error');
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    try {
      await leadApi.update(id, {
        nextAction: followUpText,
        nextFollowUpDate: new Date(followUpDate),
      });
      addToast('Follow-up scheduled');
      setShowFollowUpModal(false);
      loadLead();
    } catch (err) {
      addToast(err.message || 'Error saving follow-up', 'error');
    }
  };

  const handleScheduleViewing = async (e) => {
    e.preventDefault();
    try {
      await viewingApi.schedule({
        propertyId: viewingForm.propertyId || lead.interestedPropertyId?._id,
        leadId: id,
        scheduledDate: viewingForm.scheduledDate,
        scheduledTime: viewingForm.scheduledTime,
        notes: viewingForm.notes,
      });
      addToast('Viewing appointment scheduled!');
      setShowViewingModal(false);
      loadLead();
    } catch (err) {
      addToast(err.message || 'Error scheduling viewing', 'error');
    }
  };

  const handleSaveRequirements = async () => {
    try {
      await leadApi.update(id, {
        requirements: {
          budgetMin: Number(editData.budgetMin),
          budgetMax: Number(editData.budgetMax),
          preferredLocations: editData.preferredLocations || [],
          preferredConfigurations: editData.preferredConfigurations || [],
          propertyTypes: editData.propertyTypes || [],
          minSizeSqFt: Number(editData.minSizeSqFt),
          transactionType: editData.transactionType || 'Sale',
          timeline: editData.timeline || 'Immediate',
        },
        notes: editData.notes,
      });
      addToast('Requirements updated successfully');
      setIsEditingRequirements(false);
      loadLead();
    } catch (err) {
      addToast(err.message || 'Failed to update requirements', 'error');
    }
  };

  const handleUpdateInterestedProperty = async (propertyId) => {
    if (!propertyId) return;
    setIsUpdatingProperty(true);
    try {
      await leadApi.update(id, { interestedPropertyId: propertyId });
      addToast('Property updated successfully');
      setShowPropertySearch(false);
      loadLead();
    } catch (err) {
      addToast(err.message || 'Failed to update property', 'error');
    } finally {
      setIsUpdatingProperty(false);
    }
  };

  const filteredProperties = properties.filter(p =>
    p.projectName?.toLowerCase().includes(propertySearchTerm.toLowerCase()) ||
    p.propertyCode?.toLowerCase().includes(propertySearchTerm.toLowerCase())
  );

  const handleQuickWhatsApp = () => {
    const number = lead?.phone?.replace(/[^0-9]/g, '') || '';
    if (!number) return addToast('No phone number available', 'error');
    const msg = `Hi ${lead?.name || 'Client'}, following up from DealDesk.`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCreateDeal = () => {
    navigate(`/app/deals/new?leadId=${lead._id}&propertyId=${lead.interestedPropertyId?._id || ''}`);
  };

  const handleScheduleViewingQuick = () => {
    setShowViewingModal(true);
  };

  const handleLogAction = async () => {
    if (!composerText.trim()) return addToast('Please enter a message', 'error');
    try {
      await leadApi.update(id, {
        notes: `${lead.notes || ''}\n\n[${composerTab.toUpperCase()}] ${composerText}`.trim(),
      });
      addToast(`${composerTab} logged successfully!`);
      setComposerText('');
      loadLead();
    } catch (err) {
      addToast(err.message || 'Failed to log action', 'error');
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // ---- RENDER ----
  if (loading) {
    return (
      <div className="ldp-loading-box">
        <div className="ldp-spinner"></div>
        <p>Loading client prospect profile...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="ldp-notfound-card">
        <FaUserTie className="empty-icon" />
        <h2>Lead Prospect Not Found</h2>
        <button type="button" className="ldp-btn-primary" onClick={() => navigate('/app/leads')}>
          <FaArrowLeft /> Back to Leads
        </button>
      </div>
    );
  }

  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
  const hasDeal = lead.deals && lead.deals.length > 0;
  const latestDeal = hasDeal ? lead.deals[0] : null;

  return (
    <div className="ldp-shell">
      {/* ============================================================ */}
      {/* TOP HEADER (OLD STYLE) - WITHOUT BREADCRUMB */}
      {/* ============================================================ */}
      <div className="ldp-top-header">
        <div className="ldp-header-left">
          <button type="button" className="ldp-btn-back" onClick={() => navigate('/app/leads')}>
            <FaArrowLeft /> Back
          </button>
          <div className="ldp-title-row">
            <div className="ldp-avatar">
              {lead.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="ldp-badge-row">
                <span className="ldp-id-tag">#{lead._id.slice(-6).toUpperCase()}</span>
                <span className={`ldp-temp-badge ${lead.temperature?.toLowerCase() || 'warm'}`}>
                  {lead.temperature === 'Hot' && <FaFire />}
                  {lead.temperature === 'Warm' && <FaSun />}
                  {lead.temperature === 'Cold' && <FaSnowflake />}
                  {lead.temperature || 'Warm'}
                </span>
                <span className="ldp-source-tag">{lead.source || 'Manual'}</span>
              </div>
              <h1>{lead.name}</h1>
              <div className="ldp-contacts-meta">
                <span><FaPhoneAlt /> {lead.phone}</span>
                {lead.email && <span><FaEnvelope /> {lead.email}</span>}
                <span>Agent: <strong>{lead.assignedAgentId?.name || 'Unassigned'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="ldp-header-right">
          <div className="ldp-score-box">
            <span className="score-lbl">Deal Score</span>
            <div className="score-meter-wrap">
              <div className="score-meter-fill" style={{ width: `${Math.min(100, lead.score || 75)}%` }}></div>
            </div>
            <span className="score-val">{lead.score || 75} pts</span>
          </div>

          <div className="ldp-quick-actions">
            {lead.phone && (
              <a href={`tel:${cleanPhone}`} className="ldp-btn-action call" title="Call">
                <FaPhoneAlt />
              </a>
            )}
            {lead.phone && (
              <button className="ldp-btn-action whatsapp" onClick={handleQuickWhatsApp} title="WhatsApp">
                <FaWhatsapp />
              </button>
            )}
            <button className="ldp-btn-action assign" onClick={() => setShowAssignModal(true)} title="Assign Agent">
              <FaUserCheck />
            </button>
            <button className="ldp-btn-action viewing" onClick={handleScheduleViewingQuick} title="Schedule Viewing">
              <FaCalendarAlt />
            </button>
            <button className="ldp-btn-action followup" onClick={() => setShowFollowUpModal(true)} title="Follow-Up">
              <FaClock />
            </button>
            <button className="ldp-btn-action deal" onClick={handleCreateDeal} title="Create Deal">
              <FaHandshake />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2-COLUMN ASYMMETRIC GRID */}
      {/* ============================================================ */}
      <div className="ldp-grid-2col">

        {/* ========================================================== */}
        {/* LEFT COLUMN (60%) – CONTEXT + TABS */}
        {/* ========================================================== */}
        <div className="ldp-left-col">

          {/* ---- TABS (ABOVE-THE-FOLD) ---- */}
          <div className="ldp-tabs-wrapper">
            <div className="ldp-tabs-bar">
              <button 
                className={`ldp-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                <FaHistory /> Activity
              </button>
              <button 
                className={`ldp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FaUserTie /> Overview
              </button>
              <button 
                className={`ldp-tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
                onClick={() => setActiveTab('properties')}
              >
                <FaBuilding /> Property
              </button>
              <button 
                className={`ldp-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
                onClick={() => setActiveTab('matches')}
              >
                <FaBolt /> Matches {matches.length > 0 && <span className="ldp-tab-badge">{matches.length}</span>}
              </button>
              <button 
                className={`ldp-tab-btn ${activeTab === 'viewings' ? 'active' : ''}`}
                onClick={() => setActiveTab('viewings')}
              >
                <FaCalendarAlt /> Viewings
              </button>
              <button 
                className={`ldp-tab-btn ${activeTab === 'communications' ? 'active' : ''}`}
                onClick={() => setActiveTab('communications')}
              >
                <FaCommentDots /> Comms
              </button>
            </div>
          </div>

          {/* ---- TAB CONTENT ---- */}
          <div className="ldp-tab-content">

            {/* ACTIVITY TIMELINE */}
            {activeTab === 'activity' && (
              <div className="ldp-activity-timeline">
                {(!lead.activities || lead.activities.length === 0) ? (
                  <div className="ldp-empty-state">
                    <FaHistory className="empty-icon" />
                    <h4>No activity logged yet</h4>
                    <p>Activities will appear here as you interact with this lead.</p>
                  </div>
                ) : (
                  lead.activities.map((act, idx) => (
                    <div key={idx} className="ldp-timeline-item">
                      <div className="ldp-timeline-icon">
                        {act.action === 'CALL' && <FaPhoneAlt />}
                        {act.action === 'EMAIL' && <FaEnvelopeSolid />}
                        {act.action === 'VIEWING' && <FaCalendarAlt />}
                        {act.action === 'NOTE' && <FaStickyNote />}
                        {act.action === 'PROPERTY_SHARED' && <FaBuilding />}
                        {act.action === 'DEAL' && <FaHandshake />}
                        {act.action === 'STATUS_CHANGE' && <FaTag />}
                        {!['CALL','EMAIL','VIEWING','NOTE','PROPERTY_SHARED','DEAL','STATUS_CHANGE'].includes(act.action) && <FaClock />}
                      </div>
                      <div className="ldp-timeline-content">
                        <div className="ldp-timeline-header">
                          <span className="ldp-timeline-time">{new Date(act.timestamp || act.createdAt).toLocaleString()}</span>
                          <span className="ldp-timeline-action">{act.action || 'Activity'}</span>
                        </div>
                        <p className="ldp-timeline-desc">{act.description || act.details || 'Activity logged'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* OVERVIEW & REQUIREMENTS (with inline edit) */}
            {activeTab === 'overview' && (
              <div className="ldp-overview-tab">
                <div className="ldp-card">
                  <div className="ldp-card-header">
                    <h3>Buyer Requirements</h3>
                    {!isEditingRequirements ? (
                      <button className="ldp-btn-icon" onClick={() => setIsEditingRequirements(true)}>
                        <FaEdit /> Edit
                      </button>
                    ) : (
                      <div className="ldp-edit-actions">
                        <button className="ldp-btn-icon save" onClick={handleSaveRequirements}>
                          <FaSave /> Save
                        </button>
                        <button className="ldp-btn-icon cancel" onClick={() => { setIsEditingRequirements(false); loadLead(); }}>
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingRequirements ? (
                    <div className="ldp-edit-form">
                      <div className="ldp-form-row">
                        <div className="ldp-form-group">
                          <label>Budget (Min)</label>
                          <input type="number" value={editData.budgetMin} onChange={(e) => handleEditChange('budgetMin', Number(e.target.value))} />
                        </div>
                        <div className="ldp-form-group">
                          <label>Budget (Max)</label>
                          <input type="number" value={editData.budgetMax} onChange={(e) => handleEditChange('budgetMax', Number(e.target.value))} />
                        </div>
                      </div>
                      <div className="ldp-form-group">
                        <label>Preferred Locations (comma separated)</label>
                        <input type="text" value={editData.preferredLocations?.join(', ') || ''} onChange={(e) => handleEditChange('preferredLocations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                      </div>
                      <div className="ldp-form-group">
                        <label>Configurations (comma separated)</label>
                        <input type="text" value={editData.preferredConfigurations?.join(', ') || ''} onChange={(e) => handleEditChange('preferredConfigurations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                      </div>
                      <div className="ldp-form-group">
                        <label>Property Types (comma separated)</label>
                        <input type="text" value={editData.propertyTypes?.join(', ') || ''} onChange={(e) => handleEditChange('propertyTypes', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                      </div>
                      <div className="ldp-form-row">
                        <div className="ldp-form-group">
                          <label>Min Size (sq.ft)</label>
                          <input type="number" value={editData.minSizeSqFt} onChange={(e) => handleEditChange('minSizeSqFt', Number(e.target.value))} />
                        </div>
                        <div className="ldp-form-group">
                          <label>Transaction</label>
                          <select value={editData.transactionType} onChange={(e) => handleEditChange('transactionType', e.target.value)}>
                            <option value="Sale">Sale</option>
                            <option value="Rent">Rent</option>
                            <option value="Lease">Lease</option>
                          </select>
                        </div>
                      </div>
                      <div className="ldp-form-group">
                        <label>Timeline</label>
                        <select value={editData.timeline} onChange={(e) => handleEditChange('timeline', e.target.value)}>
                          <option value="Immediate">Immediate</option>
                          <option value="1-3 Months">1-3 Months</option>
                          <option value="3-6 Months">3-6 Months</option>
                          <option value="6+ Months">6+ Months</option>
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>
                      <div className="ldp-form-group">
                        <label>Notes</label>
                        <textarea rows={3} value={editData.notes} onChange={(e) => handleEditChange('notes', e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    <div className="ldp-requirements-display">
                      <div className="ldp-req-item">
                        <span className="ldp-req-label">Budget</span>
                        <span>{getDisplayPrice(lead.requirements?.budgetMin || 0, lead.interestedPropertyId?.currency || 'USD')} - {getDisplayPrice(lead.requirements?.budgetMax || 0, lead.interestedPropertyId?.currency || 'USD')}</span>
                      </div>
                      <div className="ldp-req-item">
                        <span className="ldp-req-label">Locations</span>
                        <span>{lead.requirements?.preferredLocations?.join(', ') || 'Any'}</span>
                      </div>
                      <div className="ldp-req-item">
                        <span className="ldp-req-label">Configurations</span>
                        <span>{lead.requirements?.preferredConfigurations?.join(', ') || 'Any'}</span>
                      </div>
                      <div className="ldp-req-item">
                        <span className="ldp-req-label">Property Types</span>
                        <span>{lead.requirements?.propertyTypes?.join(', ') || 'Any'}</span>
                      </div>
                      <div className="ldp-req-item">
                        <span className="ldp-req-label">Size</span>
                        <span>{lead.requirements?.minSizeSqFt || 0} sq.ft</span>
                      </div>
                      <div className="ldp-req-item">
                        <span className="ldp-req-label">Transaction</span>
                        <span>{lead.requirements?.transactionType || 'Sale'}</span>
                      </div>
                      <div className="ldp-req-item">
                        <span className="ldp-req-label">Timeline</span>
                        <span>{lead.requirements?.timeline || 'Immediate'}</span>
                      </div>
                      {lead.notes && (
                        <div className="ldp-req-item full">
                          <span className="ldp-req-label">Notes</span>
                          <span>{lead.notes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="ldp-card">
                  <h3>Status & Next Action</h3>
                  <div className="ldp-status-selector-row">
                    <label>Status:</label>
                    <select value={lead.status} onChange={(e) => handleStatusChange(e.target.value)} className="ldp-select-status">
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Viewing Scheduled">Viewing Scheduled</option>
                      <option value="Viewing Completed">Viewing Completed</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                  <div className="ldp-next-action-box">
                    <div className="box-top">
                      <FaClock /> Next Action:
                    </div>
                    <strong>{lead.nextAction || 'Call client to review matching listings'}</strong>
                    {lead.nextFollowUpDate && (
                      <span className="due-date">Due: {new Date(lead.nextFollowUpDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <button className="ldp-btn-secondary full-width" onClick={() => setShowFollowUpModal(true)}>
                    Update Next Action
                  </button>
                </div>
              </div>
            )}

            {/* PROPERTY TAB */}
            {activeTab === 'properties' && (
              <div className="ldp-tab-surface">
                {lead.interestedPropertyId ? (
                  <div className="ldp-property-featured-card">
                    <div className="prop-left">
                      <img 
                        src={lead.interestedPropertyId.photos?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'} 
                        alt={lead.interestedPropertyId.projectName} 
                      />
                    </div>
                    <div className="prop-content">
                      <span className="code-tag">{lead.interestedPropertyId.propertyCode}</span>
                      <h4>{lead.interestedPropertyId.projectName}</h4>
                      <p className="address">{lead.interestedPropertyId.address}</p>
                      <div className="specs">
                        <span>{lead.interestedPropertyId.configuration}</span>
                        <span>{getDisplayPrice(lead.interestedPropertyId.askingPrice, lead.interestedPropertyId.currency || 'USD')}</span>
                        <span className={`status ${lead.interestedPropertyId.status?.toLowerCase()}`}>{lead.interestedPropertyId.status}</span>
                      </div>
                      <Link to={`/app/properties/${lead.interestedPropertyId._id}`} className="ldp-btn-primary" style={{ marginTop: 12 }}>
                        <FaExternalLinkAlt /> View Details
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="ldp-empty-state">
                    <FaBuilding className="empty-icon" />
                    <h4>No property assigned</h4>
                    <p>Use the search below to select an interested property.</p>
                  </div>
                )}

                <div className="ldp-property-assign-box" ref={searchRef}>
                  <h4>Assign / Change Interested Property</h4>
                  <div className="ldp-search-dropdown">
                    <button className="ldp-btn-outline" onClick={() => setShowPropertySearch(!showPropertySearch)}>
                      {lead.interestedPropertyId ? 'Change Property' : 'Select Property'} <FaSearch />
                    </button>
                    {showPropertySearch && (
                      <div className="ldp-property-search-dropdown">
                        <div className="ldp-search-box">
                          <FaSearch className="ldp-search-icon" />
                          <input
                            type="text"
                            placeholder="Search properties..."
                            value={propertySearchTerm}
                            onChange={e => setPropertySearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="ldp-property-list">
                          {filteredProperties.length === 0 ? (
                            <div className="ldp-no-property">No properties found</div>
                          ) : (
                            filteredProperties.map(p => (
                              <div
                                key={p._id}
                                className={`ldp-property-option ${lead.interestedPropertyId?._id === p._id ? 'selected' : ''}`}
                                onClick={() => handleUpdateInterestedProperty(p._id)}
                              >
                                <span>{p.projectName} ({p.propertyCode})</span>
                                {lead.interestedPropertyId?._id === p._id && <FaCheck className="ldp-check" />}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MATCHES TAB */}
            {activeTab === 'matches' && (
              <div className="ldp-tab-surface">
                {matches.length === 0 ? (
                  <div className="ldp-empty-state">
                    <FaBolt className="empty-icon" />
                    <h4>No matching inventory</h4>
                    <p>Our 7-factor engine will run automatically against active inventory.</p>
                  </div>
                ) : (
                  <div className="ldp-matches-list">
                    {matches.map((m, idx) => (
                      <div key={idx} className="ldp-match-row-card">
                        <div className="match-score-badge">
                          <span className="score">{m.score}%</span>
                          <span className="txt">MATCH</span>
                        </div>
                        <div className="match-info">
                          <h4>{m.property?.projectName} ({m.property?.propertyCode})</h4>
                          <p>{m.property?.configuration} • {getDisplayPrice(m.property?.askingPrice, m.property?.currency || 'USD')}</p>
                          <div className="match-breakdown-chips">
                            <span>Budget: {m.breakdown?.budget || 0}%</span>
                            <span>Config: {m.breakdown?.config || 0}%</span>
                            <span>Location: {m.breakdown?.location || 0}%</span>
                          </div>
                        </div>
                        <div className="match-action">
                          <Link to={`/app/properties/${m.property?._id}`} className="ldp-btn-secondary">View</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEWINGS TAB */}
            {activeTab === 'viewings' && (
              <div className="ldp-tab-surface">
                <div className="ldp-section-header">
                  <h3>Scheduled Walkthroughs</h3>
                  <button className="ldp-btn-primary" onClick={() => setShowViewingModal(true)}>
                    <FaPlus /> Schedule
                  </button>
                </div>
                {(!lead.viewings || lead.viewings.length === 0) ? (
                  <div className="ldp-empty-state">
                    <FaCalendarAlt className="empty-icon" />
                    <h4>No viewings scheduled</h4>
                    <button className="ldp-btn-primary" onClick={() => setShowViewingModal(true)}>
                      Schedule First Walkthrough
                    </button>
                  </div>
                ) : (
                  <div className="ldp-table-card">
                    <table className="ldp-table">
                      <thead>
                        <tr><th>Date/Time</th><th>Property</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {lead.viewings.map(v => (
                          <tr key={v._id}>
                            <td><strong>{v.scheduledDate}</strong> <br/><span className="ldp-time">{v.scheduledTime}</span></td>
                            <td>{v.propertyId?.projectName || 'General'}</td>
                            <td><span className="ldp-status-pill">{v.status || 'Scheduled'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* COMMUNICATIONS TAB */}
            {activeTab === 'communications' && (
              <div className="ldp-tab-surface">
                <div className="ldp-section-header">
                  <h3>Logged Communications</h3>
                  <Link to="/app/communications" className="ldp-btn-secondary">Open Studio →</Link>
                </div>
                {(!lead.communications || lead.communications.length === 0) ? (
                  <div className="ldp-empty-state">
                    <FaCommentDots className="empty-icon" />
                    <h4>No communications logged</h4>
                  </div>
                ) : (
                  <div className="ldp-comms-list">
                    {lead.communications.map(c => (
                      <div key={c._id} className="ldp-comm-item">
                        <div className="comm-top">
                          <span className="channel-tag">{c.channel}</span>
                          <span className="time">{new Date(c.sentAt).toLocaleString()}</span>
                        </div>
                        <p>{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN (40%) – ACTION & DEAL VELOCITY ENGINE */}
        {/* ========================================================== */}
        <div className="ldp-right-col">

          {/* ---- STATUS & NEXT ACTION CARD ---- */}
          <div className="ldp-card ldp-status-card">
            <div className="ldp-status-header">
              <span className="ldp-status-label">Pipeline Stage</span>
              <select 
                value={lead.status} 
                onChange={(e) => handleStatusChange(e.target.value)} 
                className="ldp-status-select"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Viewing Scheduled">Viewing Scheduled</option>
                <option value="Viewing Completed">Viewing Completed</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Under Contract">Under Contract</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="ldp-next-action-box">
              <label>Next Action</label>
              <input 
                type="text" 
                value={lead.nextAction || 'Escrow inspection follow-up with lender'} 
                onChange={(e) => {
                  // Simple local update - would need API call to persist
                }}
                placeholder="Set next action..."
                className="ldp-next-action-input"
              />
              <div className="ldp-due-date-badge">
                <FaClock /> Due: {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleString() : 'Today, 4:00 PM'}
              </div>
            </div>

            <button className="ldp-btn-primary full-width" onClick={() => setShowFollowUpModal(true)}>
              <FaCheck /> Mark Complete
            </button>
          </div>

          {/* ---- QUICK ACTION COMPOSER ---- */}
          <div className="ldp-card ldp-composer-card">
            <div className="ldp-composer-tabs">
              <button 
                className={`ldp-composer-tab ${composerTab === 'call' ? 'active' : ''}`}
                onClick={() => setComposerTab('call')}
              >
                <FaPhone /> Call
              </button>
              <button 
                className={`ldp-composer-tab ${composerTab === 'sms' ? 'active' : ''}`}
                onClick={() => setComposerTab('sms')}
              >
                <FaSms /> SMS
              </button>
              <button 
                className={`ldp-composer-tab ${composerTab === 'email' ? 'active' : ''}`}
                onClick={() => setComposerTab('email')}
              >
                <FaEnvelopeSolid /> Email
              </button>
              <button 
                className={`ldp-composer-tab ${composerTab === 'note' ? 'active' : ''}`}
                onClick={() => setComposerTab('note')}
              >
                <FaStickyNote /> Note
              </button>
              <button 
                className={`ldp-composer-tab ${composerTab === 'viewing' ? 'active' : ''}`}
                onClick={() => setComposerTab('viewing')}
              >
                <FaCalendarAlt /> Showing
              </button>
            </div>

            <textarea 
              className="ldp-composer-textarea"
              placeholder={`Log a ${composerTab}...`}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              rows={3}
            />

            <div className="ldp-composer-footer">
              <select className="ldp-composer-template">
                <option value="">Quick Template</option>
                <option value="hi">Hi [Name], following up...</option>
                <option value="viewing">I have a new property...</option>
                <option value="contract">Contract has been signed...</option>
              </select>
              <button className="ldp-btn-primary" onClick={handleLogAction}>
                <FaCheck /> Log {composerTab.charAt(0).toUpperCase() + composerTab.slice(1)}
              </button>
            </div>
          </div>

          {/* ---- CONSOLIDATED DEAL CARD ---- */}
          <div className="ldp-card ldp-deal-card-consolidated">
            <div className="ldp-deal-card-header">
              <h3>Active Deal</h3>
              <span className="ldp-deal-status-badge">Active</span>
            </div>

            {hasDeal ? (
              <>
                <h4 className="ldp-deal-title">{latestDeal.title || lead.interestedPropertyId?.projectName || '742 Evergreen Terrace'}</h4>
                <div className="ldp-deal-financials-row">
                  <div className="ldp-fin-item">
                    <span className="label">Deal Value</span>
                    <span className="value">{getDisplayPrice(latestDeal.dealValue || lead.interestedPropertyId?.askingPrice || 485000, lead.interestedPropertyId?.currency || 'USD')}</span>
                  </div>
                  <div className="ldp-fin-item">
                    <span className="label">Est. Commission (3%)</span>
                    <span className="value">{getDisplayPrice((latestDeal.dealValue || 485000) * 0.03, lead.interestedPropertyId?.currency || 'USD')}</span>
                  </div>
                </div>
                <div className="ldp-deal-closing-date">
                  <FaCalendarAlt /> Closing: {latestDeal.expectedClosingDate ? new Date(latestDeal.expectedClosingDate).toLocaleDateString() : 'Nov 28, 2026'}
                </div>
                <div className="ldp-deal-stepper-mini">
                  <span className="ldp-step completed">Offer Accepted</span>
                  <span className="ldp-step active">Inspection</span>
                  <span className="ldp-step">Appraisal</span>
                  <span className="ldp-step">Closing</span>
                </div>
              </>
            ) : (
              <div className="ldp-empty-state-mini">
                <p>No active deal</p>
                <button className="ldp-btn-primary-sm" onClick={handleCreateDeal}>
                  <FaPlus /> Create Deal
                </button>
              </div>
            )}
          </div>

          {/* ---- PROPERTY MATCH PREFERENCES ---- */}
          <div className="ldp-card ldp-preferences-card">
            <h3>Property Match Preferences</h3>
            <div className="ldp-pref-grid">
              <div className="ldp-pref-item">
                <FaDollarSign className="ldp-pref-icon" />
                <div>
                  <span className="ldp-pref-label">Budget</span>
                  <span className="ldp-pref-value">
                    {getDisplayPrice(lead.requirements?.budgetMin || 450000, lead.interestedPropertyId?.currency || 'USD')} - {getDisplayPrice(lead.requirements?.budgetMax || 525000, lead.interestedPropertyId?.currency || 'USD')}
                  </span>
                </div>
              </div>
              <div className="ldp-pref-item">
                <FaBed className="ldp-pref-icon" />
                <div>
                  <span className="ldp-pref-label">Beds</span>
                  <span className="ldp-pref-value">{lead.requirements?.preferredConfigurations?.[0] || '3+'} Beds</span>
                </div>
              </div>
              <div className="ldp-pref-item">
                <FaBath className="ldp-pref-icon" />
                <div>
                  <span className="ldp-pref-label">Baths</span>
                  <span className="ldp-pref-value">{lead.requirements?.preferredConfigurations?.[0]?.match(/\d+/)?.[0] || '2+'} Baths</span>
                </div>
              </div>
              <div className="ldp-pref-item">
                <FaMapMarkerAlt className="ldp-pref-icon" />
                <div>
                  <span className="ldp-pref-label">Target Area</span>
                  <span className="ldp-pref-value">{lead.requirements?.preferredLocations?.[0] || 'South Congress, Austin TX'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODALS (ALL OLD) */}
      {/* ============================================================ */}

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div className="ldp-modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="ldp-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ldp-modal-header">
              <h3>Assign Lead</h3>
              <button className="btn-close" onClick={() => setShowAssignModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAssignAgent} className="ldp-modal-form">
              <div className="form-group">
                <label>Select Agent</label>
                <select value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {agents.map(a => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="ldp-modal-footer">
                <button type="button" className="ldp-btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="ldp-btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEWING MODAL */}
      {showViewingModal && (
        <div className="ldp-modal-backdrop" onClick={() => setShowViewingModal(false)}>
          <div className="ldp-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ldp-modal-header">
              <h3>Schedule Viewing</h3>
              <button className="btn-close" onClick={() => setShowViewingModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleScheduleViewing} className="ldp-modal-form">
              <div className="form-group">
                <label>Date *</label>
                <input type="date" required value={viewingForm.scheduledDate} onChange={e => setViewingForm({ ...viewingForm, scheduledDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Time *</label>
                <input type="time" required value={viewingForm.scheduledTime} onChange={e => setViewingForm({ ...viewingForm, scheduledTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea rows={2} value={viewingForm.notes} onChange={e => setViewingForm({ ...viewingForm, notes: e.target.value })} />
              </div>
              <div className="ldp-modal-footer">
                <button type="button" className="ldp-btn-secondary" onClick={() => setShowViewingModal(false)}>Cancel</button>
                <button type="submit" className="ldp-btn-primary">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOLLOW-UP MODAL */}
      {showFollowUpModal && (
        <div className="ldp-modal-backdrop" onClick={() => setShowFollowUpModal(false)}>
          <div className="ldp-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ldp-modal-header">
              <h3>Schedule Follow-Up</h3>
              <button className="btn-close" onClick={() => setShowFollowUpModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddFollowUp} className="ldp-modal-form">
              <div className="form-group">
                <label>Action *</label>
                <input type="text" required placeholder="e.g. Call client with pricing" value={followUpText} onChange={e => setFollowUpText(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Due Date *</label>
                <input type="date" required value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
              </div>
              <div className="ldp-modal-footer">
                <button type="button" className="ldp-btn-secondary" onClick={() => setShowFollowUpModal(false)}>Cancel</button>
                <button type="submit" className="ldp-btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

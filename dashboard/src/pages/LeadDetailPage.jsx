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
import { 
  FaArrowLeft, FaUserTie, FaPhoneAlt, FaEnvelope, FaWhatsapp, FaFire, 
  FaSun, FaSnowflake, FaBuilding, FaBolt, FaCalendarAlt, FaCommentDots, 
  FaHistory, FaEdit, FaUserCheck, FaShareAlt, FaPlus, FaCheck, FaTimes,
  FaExternalLinkAlt, FaClock, FaMapMarkerAlt, FaSave, FaSearch,
  FaHandshake
} from 'react-icons/fa';
import './LeadDetailPage.css';

export const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [lead, setLead] = useState(null);
  const [matches, setMatches] = useState([]);
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  const loadLead = () => {
    setLoading(true);
    leadApi.get(id)
      .then(res => {
        const data = res.data;
        setLead(data);
        setSelectedAgentId(data.assignedAgentId?._id || '');
        // Initialize edit data
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

  // ============================================================
  // HANDLERS
  // ============================================================
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

  // ============================================================
  // REQUIREMENTS EDIT
  // ============================================================
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

  // ============================================================
  // PROPERTY UPDATE (Searchable)
  // ============================================================
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

  // ============================================================
  // QUICK ACTIONS
  // ============================================================
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

  // ============================================================
  // RENDER
  // ============================================================
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

  // Helper for edit data
  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="ldp-shell">
      {/* ============================================================ */}
      {/* TOP HEADER CARD */}
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
      {/* TABS NAVIGATION */}
      {/* ============================================================ */}
      <div className="ldp-tabs-bar">
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
          <FaBolt /> Matches
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
        <button 
          className={`ldp-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <FaHistory /> Activity
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & REQUIREMENTS (with inline edit) */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="ldp-tab-grid">
          {/* Left Column: Requirements */}
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
                  <span>{lead.requirements?.budgetMin || 0} - {lead.requirements?.budgetMax || 0}</span>
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

          {/* Right Column: Status & Next Action */}
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

      {/* ============================================================ */}
      {/* TAB 2: PROPERTY (with searchable assign) */}
      {/* ============================================================ */}
      {activeTab === 'properties' && (
        <div className="ldp-tab-surface">
          {/* Current Property */}
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
                  <span>${lead.interestedPropertyId.askingPrice?.toLocaleString()}</span>
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

          {/* Searchable Property Assign */}
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

      {/* ============================================================ */}
      {/* TAB 3: MATCHES */}
      {/* ============================================================ */}
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
                    <p>{m.property?.configuration} • ${m.property?.askingPrice?.toLocaleString()}</p>
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

      {/* ============================================================ */}
      {/* TAB 4: VIEWINGS */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* TAB 5: COMMUNICATIONS */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* TAB 6: ACTIVITY */}
      {/* ============================================================ */}
      {activeTab === 'activity' && (
        <div className="ldp-tab-surface">
          <div className="ldp-activity-timeline">
            {(!lead.activities || lead.activities.length === 0) ? (
              <div className="ldp-empty-state">
                <FaHistory className="empty-icon" />
                <p>No activity logged yet.</p>
              </div>
            ) : (
              lead.activities.map((act, idx) => (
                <div key={idx} className="ldp-timeline-row">
                  <div className="dot"></div>
                  <div className="content">
                    <div className="meta">
                      <span className="action">{act.action}</span>
                      <span className="time">{new Date(act.timestamp || act.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{act.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS */}
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
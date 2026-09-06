import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { leadApi, propertyApi, billingApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { UpgradePlanModal } from '../components/UpgradePlanModal.jsx';
import { 
  FaPlus, 
  FaSearch, 
  FaUserTie, 
  FaFire, 
  FaSnowflake, 
  FaSun, 
  FaPhoneAlt, 
  FaEnvelope,
  FaInfoCircle,
  FaShieldAlt,
  FaQrcode,
  FaLink,
  FaDoorOpen,
  FaUserPlus,
  FaWhatsapp,
  FaEye,
  FaTimes,
  FaBuilding
} from 'react-icons/fa';
import './LeadsPage.css';

export const LeadsPage = () => {
  const { addToast } = useToast();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [tempFilter, setTempFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState(null);

  // Limit & upgrade states
  const [leadLimitExceeded, setLeadLimitExceeded] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Manual', // ✅ FIXED: 'Manual' instead of 'MANUAL'
    interestedPropertyId: '',
    budgetMax: 500000,
    notes: '',
  });

  // ============================================================
  // LOAD DATA & CHECK LIMIT
  // ============================================================
  const loadLeads = () => {
    setLoading(true);
    const params = { status: statusFilter, temperature: tempFilter, search };
    leadApi.list(params)
      .then(res => {
        let allLeads = res.data || [];
        if (!isAdmin) {
          allLeads = allLeads.filter(l => l.assignedAgentId?._id === user._id || l.assignedAgentId === user._id);
        }
        setLeads(allLeads);
        checkLeadLimit();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeads();
    propertyApi.list().then(r => setProperties(r.data || [])).catch(() => {});
  }, [statusFilter, tempFilter, search]);

  const checkLeadLimit = async () => {
    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.leads;
      if (usage) {
        setLeadLimitExceeded(usage.exceeded || false);
        setLimitInfo(usage);
      }
    } catch (error) {}
  };

  const handleUpgradeSuccess = async () => {
    await checkLeadLimit();
    addToast('✅ Plan upgraded! You can now capture more leads.');
  };

  // ============================================================
  // CREATE LEAD (with limit check)
  // ============================================================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      addToast('Name and phone are required', 'error');
      return;
    }

    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.leads;
      if (usage && usage.exceeded) {
        setLeadLimitExceeded(true);
        setLimitInfo(usage);
        setShowUpgradeModal(true);
        return;
      }
    } catch (error) {}

    try {
      // ✅ FIX: Convert empty interestedPropertyId to null to avoid ObjectId cast error
      const payload = {
        ...formData,
        interestedPropertyId: formData.interestedPropertyId || null,
        source: 'Manual', // ✅ Ensure 'Manual' (matches enum)
      };
      await leadApi.create(payload);
      addToast('Lead recorded with initial baseline score');
      setShowAddModal(false);
      setFormData({ 
        name: '', 
        phone: '', 
        email: '', 
        source: 'Manual', 
        interestedPropertyId: '', 
        budgetMax: 500000, 
        notes: '' 
      });
      loadLeads();
    } catch (err) {
      if (err?.data?.suggestion) {
        setLeadLimitExceeded(true);
        setLimitInfo(err.data);
        setShowUpgradeModal(true);
        addToast(err.message || 'Lead limit reached', 'error');
      } else {
        addToast(err.message || 'Error creating lead', 'error');
      }
    }
  };

  // ============================================================
  // SOURCE ICON HELPER
  // ============================================================
  const getSourceIcon = (source) => {
    switch (source) {
      case 'Smart QR': return <FaQrcode className="ld-source-icon qr" />;
      case 'SOCIAL_LINK': return <FaLink className="ld-source-icon social" />;
      case 'Open House': return <FaDoorOpen className="ld-source-icon openhouse" />;
      case 'Manual': return <FaUserPlus className="ld-source-icon manual" />;
      default: return <FaUserPlus className="ld-source-icon manual" />;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'Smart QR': return 'Smart QR';
      case 'SOCIAL_LINK': return 'Social Link';
      case 'Open House': return 'Open House';
      case 'Manual': return 'Manual Entry';
      default: return source || 'Manual';
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="ld-page">
      {/* Header */}
      <div className="ld-header">
        <div>
          <h1>Smart Leads</h1>
          <p className="ld-subtitle">High-intent buyer inquiries with temperature tracking and source attribution.</p>
          <button 
            className="ld-howto-btn"
            onClick={() => setShowHowTo(!showHowTo)}
          >
            <FaInfoCircle /> {showHowTo ? 'Hide Guide' : 'How It Works'}
          </button>
        </div>
        <button className="ld-btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Capture Lead
        </button>
      </div>

      {/* How-to Guide */}
      {showHowTo && (
        <div className="ld-howto-card">
          <div className="ld-howto-grid">
            <div>
              <span className="ld-howto-step">1</span>
              <h4>Lead Capture</h4>
              <p>Leads come automatically from Smart QR scans, Social Links, Open Houses, or manual entry.</p>
            </div>
            <div>
              <span className="ld-howto-step">2</span>
              <h4>Smart Scoring</h4>
              <p>Each lead gets a score (0-100) and temperature (Hot/Warm/Cold) based on activity and interest.</p>
            </div>
            <div>
              <span className="ld-howto-step">3</span>
              <h4>Match & Engage</h4>
              <p>Use Smart Match to find the best property for each lead. WhatsApp/Email directly from the CRM.</p>
            </div>
            <div>
              <span className="ld-howto-step">4</span>
              <h4>Track & Convert</h4>
              <p>Follow up, schedule viewings, file reports, and move leads to the Deal pipeline.</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Banner */}
      <div className={`ld-usage-banner ${leadLimitExceeded ? 'limit-reached' : ''}`}>
        <div className="ld-usage-info">
          <span className="ld-usage-label">Leads (this month):</span>
          <strong>{leads.length}</strong>
          <span className="ld-usage-separator">/</span>
          <span className={`ld-usage-limit ${leadLimitExceeded ? 'exceeded' : ''}`}>
            {limitInfo?.limit === -1 ? 'Unlimited' : limitInfo?.limit || 'Unlimited'}
          </span>
          {leadLimitExceeded && (
            <span className="ld-usage-badge limit-exceeded">⚠️ Limit Reached</span>
          )}
        </div>
        {leadLimitExceeded && (
          <button className="ld-btn-upgrade" onClick={() => setShowUpgradeModal(true)}>
            <FaShieldAlt /> Upgrade Plan
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="ld-filters">
        <div className="ld-search">
          <FaSearch className="ld-search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
          />
        </div>
        <div className="ld-filter-group">
          <select value={tempFilter} onChange={e => setTempFilter(e.target.value)}>
            <option value="">All Temperatures</option>
            <option value="Hot">🔥 Hot</option>
            <option value="Warm">☀️ Warm</option>
            <option value="Cold">❄️ Cold</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Viewing Scheduled">Viewing Scheduled</option>
            <option value="Viewing Completed">Viewing Completed</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="ld-loading">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="ld-empty">
          <FaUserTie className="ld-empty-icon" />
          <h3>No leads captured yet</h3>
          <p>Leads from Smart QR scans, Social Links, Open Houses, and manual entries appear here.</p>
          <button className="ld-btn-primary" onClick={() => setShowAddModal(true)}>Capture First Lead</button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="ld-table-wrap">
            <table className="ld-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Property</th>
                  <th>Score</th>
                  <th>Temp</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l._id} className="ld-row" onClick={() => navigate(`/app/leads/${l._id}`)}>
                    <td>
                      <div className="ld-lead-name">
                        <strong>{l.name}</strong>
                        <span className="ld-lead-agent">Agent: {l.assignedAgentId?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="ld-contact">
                        <span><FaPhoneAlt /> {l.phone}</span>
                        {l.email && <span><FaEnvelope /> {l.email}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="ld-source-tag">
                        {getSourceIcon(l.source)}
                        <span>{getSourceLabel(l.source)}</span>
                      </div>
                    </td>
                    <td>{l.interestedPropertyId?.projectName || 'Open'}</td>
                    <td>
                      <div className="ld-score">
                        <div className="ld-score-bar" style={{ width: `${Math.min(l.score, 100)}%` }}></div>
                        <span>{l.score || 0} pts</span>
                      </div>
                    </td>
                    <td>
                      <span className={`ld-temp ld-temp-${l.temperature?.toLowerCase() || 'cold'}`}>
                        {l.temperature === 'Hot' && <FaFire />}
                        {l.temperature === 'Warm' && <FaSun />}
                        {l.temperature === 'Cold' && <FaSnowflake />}
                        {l.temperature || 'Cold'}
                      </span>
                    </td>
                    <td>
                      <span className="ld-status">{l.status || 'New'}</span>
                    </td>
                    <td>
                      <div className="ld-actions">
                        <Link to={`/app/leads/${l._id}`} className="ld-btn-view">View</Link>
                        <a 
                          href={`https://wa.me/${(l.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${l.name}, following up from DealDesk.`)}`}
                          target="_blank" 
                          rel="noreferrer" 
                          className="ld-btn-wa"
                        >
                          WA
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="ld-cards">
            {leads.map(l => (
              <div key={l._id} className="ld-card" onClick={() => navigate(`/app/leads/${l._id}`)}>
                <div className="ld-card-top">
                  <div className="ld-card-name">
                    <strong>{l.name}</strong>
                    <span className={`ld-temp ld-temp-${l.temperature?.toLowerCase() || 'cold'}`}>
                      {l.temperature === 'Hot' && <FaFire />}
                      {l.temperature === 'Warm' && <FaSun />}
                      {l.temperature === 'Cold' && <FaSnowflake />}
                      {l.temperature || 'Cold'}
                    </span>
                  </div>
                  <span className="ld-status">{l.status || 'New'}</span>
                </div>
                <div className="ld-card-contact">
                  <span><FaPhoneAlt /> {l.phone}</span>
                  {l.email && <span><FaEnvelope /> {l.email}</span>}
                </div>
                <div className="ld-card-meta">
                  <span className="ld-card-source">
                    {getSourceIcon(l.source)}
                    {getSourceLabel(l.source)}
                  </span>
                  <span className="ld-card-property">{l.interestedPropertyId?.projectName || 'Open'}</span>
                  <span className="ld-card-score">Score: {l.score || 0} pts</span>
                </div>
                <div className="ld-card-actions" onClick={e => e.stopPropagation()}>
                  <Link to={`/app/leads/${l._id}`} className="ld-btn-view">View</Link>
                  <a 
                    href={`https://wa.me/${(l.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${l.name}, following up from DealDesk.`)}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="ld-btn-wa"
                  >
                    WA
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CAPTURE LEAD MODAL */}
      {showAddModal && (
        <div className="ld-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ld-modal ld-modal-create" onClick={e => e.stopPropagation()}>
            <div className="ld-modal-header">
              <h3>Capture New Lead</h3>
              <button type="button" className="ld-modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="ld-modal-form">
              <div className="ld-form-group">
                <label>Full Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Client name" />
              </div>
              <div className="ld-form-row">
                <div className="ld-form-group">
                  <label>Phone *</label>
                  <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div className="ld-form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="client@email.com" />
                </div>
              </div>
              <div className="ld-form-row">
                <div className="ld-form-group">
                  <label>Source</label>
                  <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                    <option value="Manual">Manual Entry</option>
                    <option value="Smart QR">Smart QR</option>
                    <option value="SOCIAL_LINK">Social Link</option>
                    <option value="Open House">Open House</option>
                    <option value="Website">Website</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div className="ld-form-group">
                  <label>Budget ($)</label>
                  <input type="number" value={formData.budgetMax} onChange={e => setFormData({ ...formData, budgetMax: Number(e.target.value) })} />
                </div>
              </div>
              <div className="ld-form-group">
                <label>Interested Property (Optional)</label>
                <select value={formData.interestedPropertyId} onChange={e => setFormData({ ...formData, interestedPropertyId: e.target.value })}>
                  <option value="">None</option>
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.projectName} ({p.propertyCode})</option>
                  ))}
                </select>
              </div>

              <div className="ld-usage-info-modal">
                <FaUserTie className="ld-usage-icon" />
                <span>
                  <strong>{leads.length}</strong> of <strong>{limitInfo?.limit === -1 ? 'Unlimited' : limitInfo?.limit || 'Unlimited'}</strong> leads this month
                </span>
              </div>

              <div className="ld-modal-actions">
                <button type="button" className="ld-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="ld-btn-primary">
                  {leadLimitExceeded ? '🔒 Upgrade Required' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPGRADE MODAL */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
        title="Lead Limit Reached"
        message="You've reached the maximum number of leads in your current plan. Upgrade to capture more leads and grow your business."
        feature="Leads"
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { viewingApi, propertyApi, leadApi, billingApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { UpgradePlanModal } from '../components/UpgradePlanModal.jsx';
import { 
  FaCalendarPlus, 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaSearch,
  FaFilter,
  FaEye,
  FaTimes,
  FaBuilding,
  FaUserTie,
  FaClock,
  FaMapMarkerAlt,
  FaFileAlt,
  FaInfoCircle,
  FaShieldAlt
} from 'react-icons/fa';
import './ViewingsPage.css';

export const ViewingsPage = () => {
  const { addToast } = useToast();
  const { user, isAdmin } = useAuth();

  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeViewingForReport, setActiveViewingForReport] = useState(null);
  const [selectedViewingDetail, setSelectedViewingDetail] = useState(null);

  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);

  // Limit & upgrade states
  const [viewLimitExceeded, setViewLimitExceeded] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const [scheduleData, setScheduleData] = useState({
    propertyId: '',
    leadId: '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '15:00',
    notes: 'Site inspection walkthrough.',
  });

  const [reportData, setReportData] = useState({
    overallInterest: 'High',
    clientDecision: 'Interested',
    likedAspects: 'Natural lighting, layout, and finishings',
    dislikedAspects: 'Negotiating maintenance charges',
    nextAction: 'Prepare draft letter of intent',
  });

  // ============================================================
  // LOAD DATA & CHECK LIMIT
  // ============================================================
  const loadViewings = () => {
    setLoading(true);
    viewingApi.list()
      .then(res => {
        const allViewings = res.data || [];
        // Role-based: Admin sees all, Agent sees only their own viewings
        let filtered = allViewings;
        if (!isAdmin) {
          filtered = allViewings.filter(v => v.agentId?._id === user._id || v.agentId === user._id);
        }
        setViewings(filtered);
        checkViewingsLimit();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadViewings();
    propertyApi.list().then(r => setProperties(r.data || [])).catch(() => {});
    leadApi.list().then(r => setLeads(r.data || [])).catch(() => {});
  }, []);

  const checkViewingsLimit = async () => {
    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.viewings;
      if (usage) {
        setViewLimitExceeded(usage.exceeded || false);
        setLimitInfo(usage);
      }
    } catch (error) {}
  };

  const handleUpgradeSuccess = async () => {
    await checkViewingsLimit();
    addToast('✅ Plan upgraded! You can now schedule more viewings.');
  };

  // ============================================================
  // SCHEDULE VIEWING (with limit check)
  // ============================================================
  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleData.propertyId || !scheduleData.leadId) {
      addToast('Please select both property and lead', 'error');
      return;
    }

    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.viewings;
      if (usage && usage.exceeded) {
        setViewLimitExceeded(true);
        setLimitInfo(usage);
        setShowUpgradeModal(true);
        return;
      }
    } catch (error) {}

    try {
      await viewingApi.schedule(scheduleData);
      addToast('Site viewing scheduled successfully!');
      setShowScheduleModal(false);
      loadViewings();
      // Reset form
      setScheduleData({
        propertyId: '',
        leadId: '',
        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        scheduledTime: '15:00',
        notes: 'Site inspection walkthrough.',
      });
    } catch (err) {
      if (err?.data?.suggestion) {
        setViewLimitExceeded(true);
        setLimitInfo(err.data);
        setShowUpgradeModal(true);
        addToast(err.message || 'Viewing limit reached', 'error');
      } else {
        addToast(err.message || 'Error scheduling viewing', 'error');
      }
    }
  };

  // ============================================================
  // REPORT SUBMIT
  // ============================================================
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await viewingApi.submitReport(activeViewingForReport._id, reportData);
      addToast('Viewing report filed! Prospect score and temperature updated.');
      setShowReportModal(false);
      loadViewings();
      if (selectedViewingDetail && selectedViewingDetail._id === activeViewingForReport._id) {
        setSelectedViewingDetail({ ...selectedViewingDetail, hasReport: true, status: 'Completed' });
      }
    } catch (err) {
      addToast(err.message || 'Error submitting viewing report', 'error');
    }
  };

  // ============================================================
  // FILTER
  // ============================================================
  const filteredViewings = viewings.filter(v => {
    const matchesStatus = !statusFilter || v.status === statusFilter;
    const query = search.toLowerCase();
    const matchesSearch = !search || 
      v.propertyId?.projectName?.toLowerCase().includes(query) ||
      v.leadId?.name?.toLowerCase().includes(query) ||
      v.scheduledDate?.includes(query);
    return matchesStatus && matchesSearch;
  });

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="view-page">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1>Viewings Management</h1>
          <p className="view-subtitle">Coordinate buyer walkthroughs, manage inspection reports, and track physical property visits.</p>
          <button 
            className="view-howto-btn"
            onClick={() => setShowHowTo(!showHowTo)}
          >
            <FaInfoCircle /> {showHowTo ? 'Hide Guide' : 'How It Works'}
          </button>
        </div>
        <button className="view-btn-primary" onClick={() => setShowScheduleModal(true)}>
          <FaCalendarPlus /> Schedule Viewing
        </button>
      </div>

      {/* How-to Guide */}
      {showHowTo && (
        <div className="view-howto-card">
          <div className="view-howto-grid">
            <div>
              <span className="view-howto-step">1</span>
              <h4>Schedule Visit</h4>
              <p>Select a property and lead, set date/time. System blocks overlap automatically.</p>
            </div>
            <div>
              <span className="view-howto-step">2</span>
              <h4>Conduct Walkthrough</h4>
              <p>Meet the client at the site, show the property, gather feedback.</p>
            </div>
            <div>
              <span className="view-howto-step">3</span>
              <h4>File Inspection Report</h4>
              <p>Log client interest, likes/dislikes, and next action. Lead score updates automatically.</p>
            </div>
            <div>
              <span className="view-howto-step">4</span>
              <h4>Move to Deal</h4>
              <p>If interested, the lead moves to Deal pipeline. If not, follow-up accordingly.</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Banner */}
      <div className={`view-usage-banner ${viewLimitExceeded ? 'limit-reached' : ''}`}>
        <div className="view-usage-info">
          <span className="view-usage-label">Viewings (this month):</span>
          <strong>{viewings.length}</strong>
          <span className="view-usage-separator">/</span>
          <span className={`view-usage-limit ${viewLimitExceeded ? 'exceeded' : ''}`}>
            {limitInfo?.limit === -1 ? 'Unlimited' : limitInfo?.limit || 'Unlimited'}
          </span>
          {viewLimitExceeded && (
            <span className="view-usage-badge limit-exceeded">⚠️ Limit Reached</span>
          )}
        </div>
        {viewLimitExceeded && (
          <button className="view-btn-upgrade" onClick={() => setShowUpgradeModal(true)}>
            <FaShieldAlt /> Upgrade Plan
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="view-filters">
        <div className="view-search">
          <FaSearch className="view-search-icon" />
          <input 
            type="text" 
            placeholder="Search by property, client, or date..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="view-filter-group">
          <FaFilter className="view-filter-icon" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>
        </div>
      </div>

      {/* Viewings List */}
      {loading ? (
        <div className="view-loading">Loading viewings...</div>
      ) : filteredViewings.length === 0 ? (
        <div className="view-empty">
          <FaCalendarAlt className="view-empty-icon" />
          <h3>No scheduled viewings match your criteria</h3>
          <p>Book private property walkthroughs with qualified prospects.</p>
          <button className="view-btn-primary" onClick={() => setShowScheduleModal(true)}>Schedule Viewing</button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="view-table-wrap">
            <table className="view-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Property</th>
                  <th>Client</th>
                  <th>Advisor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredViewings.map(v => (
                  <tr key={v._id} className="view-row">
                    <td onClick={() => setSelectedViewingDetail(v)}>
                      <strong>{v.scheduledDate}</strong>
                      <div className="view-time"><FaClock /> {v.scheduledTime}</div>
                    </td>
                    <td onClick={() => setSelectedViewingDetail(v)}>
                      <strong className="view-prop-name">{v.propertyId?.projectName || 'Property'}</strong>
                      <div className="view-prop-code">{v.propertyId?.propertyCode}</div>
                    </td>
                    <td onClick={() => setSelectedViewingDetail(v)}>
                      <strong>{v.leadId?.name || 'Prospect'}</strong>
                      <div className="view-client-phone">{v.leadId?.phone}</div>
                    </td>
                    <td onClick={() => setSelectedViewingDetail(v)}>{v.agentId?.name || 'Listing Advisor'}</td>
                    <td onClick={() => setSelectedViewingDetail(v)}>
                      <span className={`view-status view-status-${v.status?.toLowerCase() || 'scheduled'}`}>
                        {v.status || 'Scheduled'}
                      </span>
                    </td>
                    <td>
                      <div className="view-actions">
                        <button 
                          type="button" 
                          className="view-btn-detail" 
                          onClick={() => setSelectedViewingDetail(v)}
                        >
                          <FaEye /> Details
                        </button>
                        {v.hasReport ? (
                          <span className="view-badge-report"><FaCheckCircle /> Filed</span>
                        ) : (
                          <button 
                            type="button"
                            className="view-btn-report"
                            onClick={() => {
                              setActiveViewingForReport(v);
                              setShowReportModal(true);
                            }}
                          >
                            <FaFileAlt /> Report
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="view-cards">
            {filteredViewings.map(v => (
              <div key={v._id} className="view-card" onClick={() => setSelectedViewingDetail(v)}>
                <div className="view-card-top">
                  <div>
                    <strong className="view-card-date">{v.scheduledDate}</strong>
                    <span className="view-card-time"><FaClock /> {v.scheduledTime}</span>
                  </div>
                  <span className={`view-status view-status-${v.status?.toLowerCase() || 'scheduled'}`}>
                    {v.status || 'Scheduled'}
                  </span>
                </div>
                <div className="view-card-prop">
                  <FaBuilding className="view-card-icon" />
                  <span>{v.propertyId?.projectName || 'Property'} ({v.propertyId?.propertyCode})</span>
                </div>
                <div className="view-card-client">
                  <FaUserTie className="view-card-icon" />
                  <span>{v.leadId?.name || 'Prospect'} • {v.leadId?.phone}</span>
                </div>
                <div className="view-card-bottom">
                  <span className="view-card-advisor">Advisor: {v.agentId?.name || 'Unassigned'}</span>
                  <div className="view-card-actions">
                    <button 
                      type="button" 
                      className="view-btn-detail" 
                      onClick={(e) => { e.stopPropagation(); setSelectedViewingDetail(v); }}
                    >
                      <FaEye /> Details
                    </button>
                    {!v.hasReport && (
                      <button 
                        type="button"
                        className="view-btn-report"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveViewingForReport(v);
                          setShowReportModal(true);
                        }}
                      >
                        <FaFileAlt /> Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SCHEDULE VIEWING MODAL (box-style) */}
      {showScheduleModal && (
        <div className="view-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="view-modal view-modal-schedule" onClick={e => e.stopPropagation()}>
            <div className="view-modal-header">
              <h3>Schedule Site Tour</h3>
              <button type="button" className="view-modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <form onSubmit={handleSchedule} className="view-modal-form">
              <div className="view-form-group">
                <label>Property *</label>
                <select required value={scheduleData.propertyId} onChange={e => setScheduleData({ ...scheduleData, propertyId: e.target.value })}>
                  <option value="">Select Property...</option>
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.projectName} ({p.propertyCode})</option>
                  ))}
                </select>
              </div>

              <div className="view-form-group">
                <label>Lead Prospect *</label>
                <select required value={scheduleData.leadId} onChange={e => setScheduleData({ ...scheduleData, leadId: e.target.value })}>
                  <option value="">Select Lead...</option>
                  {leads.map(l => (
                    <option key={l._id} value={l._id}>{l.name} ({l.phone})</option>
                  ))}
                </select>
              </div>

              <div className="view-form-row">
                <div className="view-form-group">
                  <label>Date *</label>
                  <input type="date" required value={scheduleData.scheduledDate} onChange={e => setScheduleData({ ...scheduleData, scheduledDate: e.target.value })} />
                </div>
                <div className="view-form-group">
                  <label>Time *</label>
                  <input type="time" required value={scheduleData.scheduledTime} onChange={e => setScheduleData({ ...scheduleData, scheduledTime: e.target.value })} />
                </div>
              </div>

              <div className="view-form-group">
                <label>Notes</label>
                <textarea rows={2} value={scheduleData.notes} onChange={e => setScheduleData({ ...scheduleData, notes: e.target.value })} />
              </div>

              <div className="view-usage-info-modal">
                <FaCalendarAlt className="view-usage-icon" />
                <span>
                  <strong>{viewings.length}</strong> of <strong>{limitInfo?.limit === -1 ? 'Unlimited' : limitInfo?.limit || 'Unlimited'}</strong> viewings this month
                </span>
              </div>

              <div className="view-modal-actions">
                <button type="button" className="view-btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button type="submit" className="view-btn-primary">
                  {viewLimitExceeded ? '🔒 Upgrade Required' : 'Confirm Viewing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEWING DETAILS MODAL */}
      {selectedViewingDetail && (
        <div className="view-modal-overlay" onClick={() => setSelectedViewingDetail(null)}>
          <div className="view-modal view-modal-detail" onClick={e => e.stopPropagation()}>
            <div className="view-modal-header">
              <div>
                <h3>Viewing Record</h3>
                <p className="view-modal-subtitle">#{selectedViewingDetail._id.slice(-6).toUpperCase()}</p>
              </div>
              <button type="button" className="view-modal-close" onClick={() => setSelectedViewingDetail(null)}><FaTimes /></button>
            </div>

            <div className="view-modal-body">
              <div className="view-modal-grid">
                <div className="view-modal-item">
                  <span className="view-modal-label">Date & Time</span>
                  <strong>{selectedViewingDetail.scheduledDate} at {selectedViewingDetail.scheduledTime}</strong>
                </div>
                <div className="view-modal-item">
                  <span className="view-modal-label">Status</span>
                  <span className={`view-status view-status-${selectedViewingDetail.status?.toLowerCase() || 'scheduled'}`}>
                    {selectedViewingDetail.status || 'Scheduled'}
                  </span>
                </div>
              </div>

              <div className="view-modal-card">
                <div className="view-modal-card-header">
                  <FaBuilding className="view-modal-card-icon" />
                  <h4>{selectedViewingDetail.propertyId?.projectName || 'Property'}</h4>
                </div>
                <p className="view-modal-card-sub">{selectedViewingDetail.propertyId?.address || 'Address not available'}</p>
                {selectedViewingDetail.propertyId && (
                  <Link to={`/app/properties/${selectedViewingDetail.propertyId._id}`} className="view-modal-link">
                    Open Property Details →
                  </Link>
                )}
              </div>

              <div className="view-modal-card">
                <div className="view-modal-card-header">
                  <FaUserTie className="view-modal-card-icon" />
                  <h4>{selectedViewingDetail.leadId?.name || 'Prospect'}</h4>
                </div>
                <p className="view-modal-card-sub">{selectedViewingDetail.leadId?.phone || 'Contact not available'}</p>
                {selectedViewingDetail.leadId && (
                  <Link to={`/app/leads/${selectedViewingDetail.leadId._id}`} className="view-modal-link">
                    Open Lead Details →
                  </Link>
                )}
              </div>

              {selectedViewingDetail.hasReport && (
                <div className="view-modal-report">
                  <FaCheckCircle className="view-modal-report-icon" />
                  <div>
                    <strong>Inspection Report Completed</strong>
                    <p>Client feedback and temperature adjustments have been synced with lead intelligence.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="view-modal-actions">
              {!selectedViewingDetail.hasReport && (
                <button 
                  type="button" 
                  className="view-btn-primary" 
                  onClick={() => {
                    setActiveViewingForReport(selectedViewingDetail);
                    setShowReportModal(true);
                  }}
                >
                  <FaFileAlt /> File Report
                </button>
              )}
              <button type="button" className="view-btn-secondary" onClick={() => setSelectedViewingDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION REPORT MODAL */}
      {showReportModal && (
        <div className="view-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="view-modal view-modal-report-form" onClick={e => e.stopPropagation()}>
            <div className="view-modal-header">
              <div>
                <h3>Inspection Report</h3>
                <p className="view-modal-subtitle">{activeViewingForReport?.propertyId?.projectName || 'Property Walkthrough'}</p>
              </div>
              <button type="button" className="view-modal-close" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <form onSubmit={handleReportSubmit} className="view-modal-form">
              <div className="view-form-row">
                <div className="view-form-group">
                  <label>Overall Interest</label>
                  <select value={reportData.overallInterest} onChange={e => setReportData({ ...reportData, overallInterest: e.target.value })}>
                    <option value="High">🔥 High (+25 pts)</option>
                    <option value="Medium">☀️ Medium (+10 pts)</option>
                    <option value="Low">❄️ Low (-10 pts)</option>
                  </select>
                </div>
                <div className="view-form-group">
                  <label>Client Decision</label>
                  <select value={reportData.clientDecision} onChange={e => setReportData({ ...reportData, clientDecision: e.target.value })}>
                    <option value="Ready to Proceed">Ready to Proceed</option>
                    <option value="Interested">Interested</option>
                    <option value="Considering">Considering</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
              </div>

              <div className="view-form-group">
                <label>What did client like?</label>
                <input type="text" value={reportData.likedAspects} onChange={e => setReportData({ ...reportData, likedAspects: e.target.value })} />
              </div>

              <div className="view-form-group">
                <label>What did client dislike?</label>
                <input type="text" value={reportData.dislikedAspects} onChange={e => setReportData({ ...reportData, dislikedAspects: e.target.value })} />
              </div>

              <div className="view-form-group">
                <label>Recommended Next Action *</label>
                <input type="text" required value={reportData.nextAction} onChange={e => setReportData({ ...reportData, nextAction: e.target.value })} />
              </div>

              <div className="view-modal-actions">
                <button type="button" className="view-btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="view-btn-primary">Save Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPGRADE PLAN MODAL */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
        title="Viewing Limit Reached"
        message="You've reached the maximum number of viewings in your current plan. Upgrade to schedule more site tours and close more deals."
        feature="Viewings"
      />
    </div>
  );
};
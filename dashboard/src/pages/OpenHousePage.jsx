import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { openHouseApi, propertyApi, billingApi, leadApi } from '../services/api/services.js'; // ✅ Added leadApi
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { UpgradePlanModal } from '../components/UpgradePlanModal.jsx';
import { 
  FaDoorOpen, 
  FaPlus, 
  FaQrcode, 
  FaUsers, 
  FaCalendarAlt,
  FaEye,
  FaTimes,
  FaExternalLinkAlt,
  FaClock,
  FaBuilding,
  FaUserCheck,
  FaUserFriends,
  FaPhoneAlt,
  FaEnvelope,
  FaUserTie,
  FaCheckCircle,
  FaShieldAlt,
  FaInfoCircle
} from 'react-icons/fa';
import './OpenHousePage.css';

export const OpenHousePage = () => {
  const { addToast } = useToast();
  const { user, isAdmin } = useAuth();

  const [events, setEvents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [eventLeads, setEventLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [ohLimitExceeded, setOhLimitExceeded] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [showHowTo, setShowHowTo] = useState(false);

  const [formData, setFormData] = useState({
    propertyId: '',
    title: 'VIP Weekend Preview Tour',
    eventDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '16:00',
  });

  // ============================================================
  // LOAD DATA & CHECK LIMIT
  // ============================================================
  const loadEvents = () => {
    setLoading(true);
    openHouseApi.list()
      .then(res => {
        const allEvents = res.data || [];
        let filteredEvents = allEvents;
        if (!isAdmin) {
          filteredEvents = allEvents.filter(e => e.hostAgentId?._id === user._id || e.hostAgentId === user._id);
        }
        setEvents(filteredEvents);
        checkOpenHouseLimit();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
    propertyApi.list().then(r => setProperties(r.data || [])).catch(() => {});
    // ✅ Fetch all leads with source OPEN_HOUSE to get counts
    leadApi.list({ source: 'OPEN_HOUSE' })
      .then(r => setLeads(r.data || []))
      .catch(() => {});
  }, []);

  const checkOpenHouseLimit = async () => {
    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.openHouses;
      if (usage) {
        setOhLimitExceeded(usage.exceeded || false);
        setLimitInfo(usage);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleUpgradeSuccess = async () => {
    await checkOpenHouseLimit();
    addToast('✅ Plan upgraded! You can now create more Open Houses.');
  };

  // ============================================================
  // CREATE OPEN HOUSE (with limit check)
  // ============================================================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.propertyId) {
      addToast('Please select a property', 'error');
      return;
    }

    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.openHouses;
      if (usage && usage.exceeded) {
        setOhLimitExceeded(true);
        setLimitInfo(usage);
        setShowUpgradeModal(true);
        return;
      }
    } catch (error) {
      // Proceed anyway
    }

    try {
      await openHouseApi.create(formData);
      addToast('Open House scheduled and attendee registration QR activated!');
      setShowModal(false);
      loadEvents();
      setFormData({
        propertyId: '',
        title: 'VIP Weekend Preview Tour',
        eventDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        startTime: '11:00',
        endTime: '16:00',
      });
    } catch (err) {
      if (err?.data?.suggestion) {
        setOhLimitExceeded(true);
        setLimitInfo(err.data);
        setShowUpgradeModal(true);
        addToast(err.message || 'Open House limit reached', 'error');
      } else {
        addToast(err.message || 'Error creating Open House', 'error');
      }
    }
  };

  // ============================================================
  // VIEW EVENT DETAILS (with leads)
  // ============================================================
  const handleViewDetails = async (event) => {
    setSelectedEventDetail(event);
    setLeadsLoading(true);
    try {
      const res = await leadApi.list({ 
        source: 'OPEN_HOUSE',
        sourceEventId: event._id,
        limit: 100 
      });
      setEventLeads(res.data || []);
    } catch {
      setEventLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="oh-page">
      {/* Header */}
      <div className="oh-header">
        <div>
          <h1>Open House Events</h1>
          <p className="oh-subtitle">Host property showcase days with contactless QR check-in and automatic lead routing.</p>
          <button 
            className="oh-howto-btn"
            onClick={() => setShowHowTo(!showHowTo)}
          >
            <FaInfoCircle /> {showHowTo ? 'Hide Guide' : 'How It Works'}
          </button>
        </div>
        <button className="oh-btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Schedule Open House
        </button>
      </div>

      {/* How-to Guide */}
      {showHowTo && (
        <div className="oh-howto-card">
          <div className="oh-howto-grid">
            <div>
              <span className="oh-howto-step">1</span>
              <h4>Schedule Event</h4>
              <p>Select a property, set date/time, and give it a title. Unique QR generated automatically.</p>
            </div>
            <div>
              <span className="oh-howto-step">2</span>
              <h4>Print & Display QR</h4>
              <p>Print the event QR code and place it at the reception/entrance desk for visitors to scan.</p>
            </div>
            <div>
              <span className="oh-howto-step">3</span>
              <h4>Visitors Check In</h4>
              <p>Visitors scan QR, fill name/phone/email → check-in complete. No manual entry needed.</p>
            </div>
            <div>
              <span className="oh-howto-step">4</span>
              <h4>Leads Auto-Created</h4>
              <p>Every check-in creates a lead in CRM with source <code>OPEN_HOUSE</code>. Follow up instantly.</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Banner */}
      <div className={`oh-usage-banner ${ohLimitExceeded ? 'limit-reached' : ''}`}>
        <div className="oh-usage-info">
          <span className="oh-usage-label">Open Houses (this month):</span>
          <strong>{events.length}</strong>
          <span className="oh-usage-separator">/</span>
          <span className={`oh-usage-limit ${ohLimitExceeded ? 'exceeded' : ''}`}>
            {limitInfo?.limit === -1 ? 'Unlimited' : limitInfo?.limit || 'Unlimited'}
          </span>
          {ohLimitExceeded && (
            <span className="oh-usage-badge limit-exceeded">⚠️ Limit Reached</span>
          )}
        </div>
        {ohLimitExceeded && (
          <button className="oh-btn-upgrade" onClick={() => setShowUpgradeModal(true)}>
            <FaShieldAlt /> Upgrade Plan
          </button>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="oh-loading">Loading open house events...</div>
      ) : events.length === 0 ? (
        <div className="oh-empty">
          <FaDoorOpen className="oh-empty-icon" />
          <h3>No Open Houses scheduled</h3>
          <p>Organize site showcase days and let attendees register via dynamic check-in QR.</p>
          <button className="oh-btn-primary" onClick={() => setShowModal(true)}>Schedule Open House</button>
        </div>
      ) : (
        <>
          {/* Desktop Grid */}
          <div className="oh-grid">
            {events.map(ev => {
              const checkInUrl = `${window.location.origin}/oh/${ev.eventQrCode}`;
              const eventLeadCount = leads.filter(l => l.sourceEventId === ev._id).length;
              
              return (
                <div key={ev._id} className="oh-card">
                  <div className="oh-card-header">
                    <span className="oh-date-badge"><FaCalendarAlt /> {ev.eventDate}</span>
                    <span className="oh-time"><FaClock /> {ev.startTime} - {ev.endTime}</span>
                  </div>
                  <h3 className="oh-card-title">{ev.title}</h3>
                  <p className="oh-card-property">{ev.propertyId?.projectName} ({ev.propertyId?.propertyCode})</p>
                  <p className="oh-card-address">{ev.propertyId?.address}</p>

                  <div className="oh-stats">
                    <div>
                      <span className="oh-stat-num">{ev.registrationsCount || 0}</span>
                      <span className="oh-stat-label">Registered</span>
                    </div>
                    <div>
                      <span className="oh-stat-num">{eventLeadCount}</span>
                      <span className="oh-stat-label">Leads</span>
                    </div>
                    <div>
                      <span className="oh-stat-num">{ev.status || 'Upcoming'}</span>
                      <span className="oh-stat-label">Status</span>
                    </div>
                  </div>

                  <div className="oh-card-footer">
                    <button 
                      type="button" 
                      className="oh-btn-detail"
                      onClick={() => handleViewDetails(ev)}
                    >
                      <FaEye /> Details
                    </button>
                    <a 
                      href={checkInUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="oh-btn-qr"
                    >
                      <FaExternalLinkAlt /> Check-In
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Cards */}
          <div className="oh-cards-mobile">
            {events.map(ev => {
              const checkInUrl = `${window.location.origin}/oh/${ev.eventQrCode}`;
              const eventLeadCount = leads.filter(l => l.sourceEventId === ev._id).length;
              
              return (
                <div key={ev._id} className="oh-card-mobile">
                  <div className="oh-card-mobile-top">
                    <span className="oh-date-badge"><FaCalendarAlt /> {ev.eventDate}</span>
                    <span className="oh-time"><FaClock /> {ev.startTime}</span>
                  </div>
                  <h4 className="oh-card-mobile-title">{ev.title}</h4>
                  <p className="oh-card-mobile-prop">{ev.propertyId?.projectName}</p>
                  <div className="oh-card-mobile-stats">
                    <span>👤 {ev.registrationsCount || 0} registered</span>
                    <span>📊 {eventLeadCount} leads</span>
                  </div>
                  <div className="oh-card-mobile-footer">
                    <button 
                      type="button" 
                      className="oh-btn-detail"
                      onClick={() => handleViewDetails(ev)}
                    >
                      <FaEye /> Details
                    </button>
                    <a 
                      href={checkInUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="oh-btn-qr"
                    >
                      <FaExternalLinkAlt /> Check-In
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* SCHEDULE OPEN HOUSE MODAL */}
      {showModal && (
        <div className="oh-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="oh-modal oh-modal-schedule" onClick={e => e.stopPropagation()}>
            <div className="oh-modal-header">
              <h3>Schedule Open House</h3>
              <button type="button" className="oh-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="oh-modal-form">
              <div className="oh-form-group">
                <label>Property Listing *</label>
                <select required value={formData.propertyId} onChange={e => setFormData({ ...formData, propertyId: e.target.value })}>
                  <option value="">Select Property...</option>
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.projectName} ({p.propertyCode})</option>
                  ))}
                </select>
              </div>

              <div className="oh-form-group">
                <label>Event Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div className="oh-form-row">
                <div className="oh-form-group">
                  <label>Date *</label>
                  <input type="date" required value={formData.eventDate} onChange={e => setFormData({ ...formData, eventDate: e.target.value })} />
                </div>
                <div className="oh-form-group">
                  <label>Start Time *</label>
                  <input type="time" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                </div>
                <div className="oh-form-group">
                  <label>End Time *</label>
                  <input type="time" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                </div>
              </div>

              <div className="oh-usage-info-modal">
                <FaDoorOpen className="oh-usage-icon" />
                <span>
                  <strong>{events.length}</strong> of <strong>{limitInfo?.limit === -1 ? 'Unlimited' : limitInfo?.limit || 'Unlimited'}</strong> Open Houses this month
                </span>
              </div>

              <div className="oh-modal-actions">
                <button type="button" className="oh-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="oh-btn-primary">
                  {ohLimitExceeded ? '🔒 Upgrade Required' : 'Generate Event QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPEN HOUSE DETAILS MODAL */}
      {selectedEventDetail && (
        <div className="oh-modal-overlay" onClick={() => setSelectedEventDetail(null)}>
          <div className="oh-modal oh-modal-detail" onClick={e => e.stopPropagation()}>
            <div className="oh-modal-header">
              <div>
                <h3>{selectedEventDetail.title}</h3>
                <p className="oh-modal-subtitle">{selectedEventDetail.eventDate} ({selectedEventDetail.startTime} - {selectedEventDetail.endTime})</p>
              </div>
              <button type="button" className="oh-modal-close" onClick={() => setSelectedEventDetail(null)}><FaTimes /></button>
            </div>

            <div className="oh-modal-body">
              <div className="oh-qr-box">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=8&data=${encodeURIComponent(`${window.location.origin}/oh/${selectedEventDetail.eventQrCode}`)}`} 
                  alt="Open House Check-In QR"
                />
                <div>
                  <strong>Contactless Check-In QR</strong>
                  <p>Display at the entrance desk for visitors to register on arrival.</p>
                  <code className="oh-qr-code">{selectedEventDetail.eventQrCode}</code>
                </div>
              </div>

              <div className="oh-detail-grid">
                <div className="oh-detail-item">
                  <span className="oh-detail-label">Property</span>
                  <strong>{selectedEventDetail.propertyId?.projectName || 'N/A'}</strong>
                  <span className="oh-detail-sub">{selectedEventDetail.propertyId?.address || ''}</span>
                </div>
                <div className="oh-detail-item">
                  <span className="oh-detail-label">Host Agent</span>
                  <strong>{selectedEventDetail.hostAgentId?.name || 'Authorized Advisor'}</strong>
                </div>
                <div className="oh-detail-item">
                  <span className="oh-detail-label">Status</span>
                  <span className={`oh-status-badge oh-status-${selectedEventDetail.status?.toLowerCase() || 'scheduled'}`}>
                    {selectedEventDetail.status || 'Scheduled'}
                  </span>
                </div>
                <div className="oh-detail-item">
                  <span className="oh-detail-label">Registrations / Leads</span>
                  <strong>{selectedEventDetail.registrationsCount || 0} / {eventLeads.length}</strong>
                </div>
              </div>

              <div className="oh-leads-section">
                <div className="oh-leads-header">
                  <FaUserFriends className="oh-leads-icon" />
                  <h4>Leads Generated from Check-Ins</h4>
                  <span className="oh-leads-count">{eventLeads.length} leads</span>
                </div>

                {leadsLoading ? (
                  <div className="oh-leads-loading">Loading leads...</div>
                ) : eventLeads.length === 0 ? (
                  <div className="oh-leads-empty">
                    <p>No leads captured from this Open House yet.</p>
                    <p className="oh-leads-hint">Visitors who check-in via QR will appear here.</p>
                  </div>
                ) : (
                  <div className="oh-leads-list">
                    {eventLeads.map((lead, idx) => (
                      <div key={lead._id || idx} className="oh-lead-item">
                        <div className="oh-lead-info">
                          <strong className="oh-lead-name">{lead.name || 'Anonymous'}</strong>
                          <div className="oh-lead-contact">
                            {lead.phone && <span><FaPhoneAlt /> {lead.phone}</span>}
                            {lead.email && <span><FaEnvelope /> {lead.email}</span>}
                          </div>
                          <span className="oh-lead-source">{lead.source || 'OPEN_HOUSE'}</span>
                        </div>
                        <Link to={`/app/leads/${lead._id}`} className="oh-lead-link">
                          <FaEye /> View Lead
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedEventDetail.propertyId && (
                <div className="oh-detail-link-row">
                  <Link to={`/app/properties/${selectedEventDetail.propertyId._id}`} className="oh-detail-link">
                    <FaBuilding /> Open Property Details →
                  </Link>
                </div>
              )}
            </div>

            <div className="oh-modal-actions">
              <button type="button" className="oh-btn-secondary" onClick={() => setSelectedEventDetail(null)}>Close</button>
              <a 
                href={`${window.location.origin}/oh/${selectedEventDetail.eventQrCode}`} 
                target="_blank" 
                rel="noreferrer" 
                className="oh-btn-primary"
              >
                <FaExternalLinkAlt /> Check-In Terminal
              </a>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE PLAN MODAL */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
        title="Open House Limit Reached"
        message="You've reached the maximum number of Open Houses in your current plan. Upgrade to host more events and capture more leads."
        feature="Open Houses"
      />
    </div>
  );
};
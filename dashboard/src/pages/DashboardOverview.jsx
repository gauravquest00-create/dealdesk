import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardApi } from '../services/api/services.js';
import {
  FaBuilding,
  FaUserFriends,
  FaCalendarAlt,
  FaDoorOpen,
  FaHandshake,
  FaExclamationCircle,
  FaBolt,
  FaQrcode,
  FaArrowRight,
  FaPhoneAlt,
  FaCheckCircle,
  FaTimes,
  FaRocket,
  FaUsersCog,
  FaWallet
} from 'react-icons/fa';
import './DashboardOverview.css';

export const DashboardOverview = () => {
  const { user, business, isAdmin } = useAuth();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Role detection
  const subRole = user?.subRole || '';
  const isPropertyAgent = !isAdmin && (subRole === 'PROPERTY_AGENT' || subRole === 'PROPERTY_LEAD_AGENT' || !subRole);
  const isLeadAgent = !isAdmin && (subRole === 'LEAD_AGENT' || subRole === 'PROPERTY_LEAD_AGENT' || !subRole);

  // Welcome section state from query param or localStorage
  const [showWelcome, setShowWelcome] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('welcome') === 'true' || localStorage.getItem('dealdesk_show_welcome') === 'true';
  });

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.removeItem('dealdesk_show_welcome');
    const url = new URL(window.location.href);
    url.searchParams.delete('welcome');
    window.history.replaceState({}, '', url.pathname);
  };

  useEffect(() => {
    dashboardApi.getMetrics()
      .then(res => setData(res.data))
      .catch(() => {}) // Silently fail - no console
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-loading-skeleton">Loading workspace intelligence...</div>;
  }

  const counts = data?.counts || {};
  const actionReq = data?.actionRequired || {};
  const todayVisits = data?.todayViewings || [];

  // ==========================================================
  // KPI CONFIGURATION - Role Based
  // ==========================================================
  const allKpis = [
    { id: 'properties', label: isAdmin ? 'Live Properties' : 'My Properties', value: counts.properties || 0, icon: FaBuilding, color: 'blue', path: '/app/properties', show: isAdmin || isPropertyAgent },
    { id: 'leads', label: isAdmin ? 'Active Leads' : 'My Leads', value: counts.leads || 0, icon: FaUserFriends, color: 'green', path: '/app/leads', show: isAdmin || isLeadAgent },
    { id: 'matches', label: 'Smart Matches', value: 'Live', icon: FaBolt, color: 'cyan', path: '/app/matches', show: isAdmin || isLeadAgent },
    { id: 'viewings', label: 'Scheduled Viewings', value: counts.viewings || 0, icon: FaCalendarAlt, color: 'purple', path: '/app/viewings', show: isAdmin || isLeadAgent },
    { id: 'openHouses', label: 'Open Houses', value: counts.openHouses || 0, icon: FaDoorOpen, color: 'orange', path: '/app/open-houses', show: isAdmin || isPropertyAgent },
    { id: 'qr', label: 'Smart QRs', value: counts.activeQRs || 0, icon: FaQrcode, color: 'teal', path: '/app/qr', show: isAdmin || isPropertyAgent },
    { id: 'deals', label: 'Active Deals', value: counts.deals || 0, icon: FaHandshake, color: 'amber', path: '/app/deals', show: isAdmin || isLeadAgent },
  ];

  // Admin-only KPIs
  const adminKpis = [
    { id: 'team', label: 'Team Members', value: counts.teamMembers || 0, icon: FaUsersCog, color: 'indigo', path: '/app/team' },
    { id: 'revenue', label: 'Revenue (MTD)', value: counts.revenue || '$0', icon: FaWallet, color: 'violet', path: '/app/settings' },
  ];

  // Filter KPIs based on role
  let visibleKpis = allKpis.filter(k => k.show !== false);
  if (isAdmin) {
    visibleKpis = [...visibleKpis, ...adminKpis];
  }

  return (
    <div className="overview-page">
      {/* Onboarding Welcome Section */}
      {showWelcome && (
        <div className="onboarding-welcome-banner">
          <div className="welcome-icon-box">
            <FaRocket />
          </div>
          <div className="welcome-text-content">
            <h3>Welcome to your new DealDesk Deal Workspace, {user?.name}! 🎉</h3>
            <p>
              Your brokerage workspace <strong>{business?.name || 'DealDesk'}</strong> is live. 
              Sample luxury inventory, reassignable Smart QR codes, and 7-factor smart matches have been initialized.
            </p>
            <div className="welcome-quick-steps">
              <span>✓ Data Isolation Active</span>
              <span>✓ Entitlement: {business?.entitlementStatus || 'Active'}</span>
              <span>✓ Smart QR Codes Ready</span>
            </div>
          </div>
          <button className="btn-dismiss-welcome" onClick={dismissWelcome} aria-label="Dismiss welcome banner">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Main Greeting Bar */}
      <div className="overview-header-surface">
        <div>
          <h1 className="overview-greeting">
            {isAdmin ? `Brokerage Snapshot: ${business?.name || 'DealDesk'}` : `Welcome back, ${user?.name}`}
          </h1>
          <p className="overview-subline">
            {isAdmin
              ? 'Real-time performance, urgent deal actions, and operational activity across your team.'
              : 'Here are your active assigned properties, client follow-ups, and scheduled site visits for today.'}
          </p>
        </div>
        <div className="header-badge-role">
          <span>{isAdmin ? 'ADMINISTRATOR' : 'AGENT WORKSPACE'}</span>
        </div>
      </div>

      {/* KPI Metrics Row - Role Based */}
      <div className="kpi-grid">
        {visibleKpis.map((kpi) => (
          <Link key={kpi.id} to={kpi.path} className="kpi-card clickable" title={`View ${kpi.label}`}>
            <div className={`kpi-icon-box ${kpi.color}`}>
              <kpi.icon />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">{kpi.label}</span>
              <h3 className="kpi-value">{kpi.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Action Required Section - Only for Admin or Lead Agents */}
      {(isAdmin || isLeadAgent) && (
        <div className="section-panel action-required-panel">
          <div className="panel-title-bar">
            <div className="title-with-icon">
              <FaExclamationCircle className="urgent-icon" />
              <h2>Action Required</h2>
            </div>
            <span className="action-counter">
              {(actionReq.followUpsDueCount || 0) + (actionReq.hotLeadsCount || 0) + (actionReq.pendingReportsCount || 0)} Items Pending
            </span>
          </div>

          <div className="action-cards-row">
            {/* Follow-ups Due */}
            <div className="action-sub-panel">
              <h4>Follow-ups Due Today ({actionReq.followUpsDueCount || 0})</h4>
              {actionReq.followUpsDue && actionReq.followUpsDue.length > 0 ? (
                <ul className="action-item-list">
                  {actionReq.followUpsDue.map(l => (
                    <li key={l._id}>
                      <div className="item-main">
                        <strong>{l.name}</strong>
                        <p>{l.nextAction || 'Call client'}</p>
                      </div>
                      <Link to="/app/leads" className="btn-action-link">View</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="clean-empty-state">No overdue follow-ups</p>
              )}
            </div>

            {/* Hot Leads Not Contacted */}
            <div className="action-sub-panel">
              <h4>Hot Leads Awaiting Outreach ({actionReq.hotLeadsCount || 0})</h4>
              {actionReq.hotLeadsNotContacted && actionReq.hotLeadsNotContacted.length > 0 ? (
                <ul className="action-item-list">
                  {actionReq.hotLeadsNotContacted.map(l => (
                    <li key={l._id}>
                      <div className="item-main">
                        <strong>{l.name}</strong>
                        <span className="hot-tag">Hot ({l.score} pts)</span>
                      </div>
                      <Link to="/app/communications" className="btn-action-link">Message</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="clean-empty-state">All high-intent leads contacted</p>
              )}
            </div>

            {/* Viewing Reports Pending */}
            <div className="action-sub-panel">
              <h4>Viewing Reports Pending ({actionReq.pendingReportsCount || 0})</h4>
              {actionReq.pendingViewingReports && actionReq.pendingViewingReports.length > 0 ? (
                <ul className="action-item-list">
                  {actionReq.pendingViewingReports.map(v => (
                    <li key={v._id}>
                      <div className="item-main">
                        <strong>{v.propertyId?.projectName || 'Property'}</strong>
                        <p>Client: {v.leadId?.name || 'Visitor'}</p>
                      </div>
                      <Link to="/app/viewings" className="btn-action-link">Fill Report</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="clean-empty-state">All reports filed</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Today's Schedule & Quick Links */}
      <div className="split-panel-row">
        <div className="section-panel flex-2">
          <div className="panel-title-bar">
            <h2>Today's Site Viewings ({todayVisits.length})</h2>
            <Link to="/app/viewings" className="link-see-all">Calendar View <FaArrowRight /></Link>
          </div>

          {todayVisits.length > 0 ? (
            <div className="table-container">
              <table className="dealdesk-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Property</th>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayVisits.map(v => (
                    <tr key={v._id}>
                      <td className="font-semibold">{v.scheduledTime}</td>
                      <td>{v.propertyId?.projectName} ({v.propertyId?.propertyCode})</td>
                      <td>{v.leadId?.name}</td>
                      <td>{v.leadId?.phone}</td>
                      <td><span className="status-badge scheduled">{v.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-schedule-box">
              <p>No site visits scheduled for today yet.</p>
              <Link to="/app/viewings" className="btn-table-cta">Schedule Viewing</Link>
            </div>
          )}
        </div>

        <div className="section-panel flex-1">
          <div className="panel-title-bar">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-action-list">
            {(isAdmin || isPropertyAgent) && (
              <Link to="/app/properties" className="quick-btn">
                <FaBuilding /> <span>Add New Property</span>
              </Link>
            )}
            {(isAdmin || isLeadAgent) && (
              <Link to="/app/leads" className="quick-btn">
                <FaUserFriends /> <span>Capture New Lead</span>
              </Link>
            )}
            {(isAdmin || isPropertyAgent) && (
              <Link to="/app/qr" className="quick-btn">
                <FaQrcode /> <span>Generate Dynamic Smart QR</span>
              </Link>
            )}
            {(isAdmin || isLeadAgent) && (
              <Link to="/app/communications" className="quick-btn">
                <FaPhoneAlt /> <span>Compose WhatsApp Outreach</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
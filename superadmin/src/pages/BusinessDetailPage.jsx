import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { superadminApi } from '../services/api/superadminApi.js';
import {
  FaBuilding,
  FaUserFriends,
  FaHome,
  FaQrcode,
  FaHandshake,
  FaCalendarAlt,
  FaShieldAlt,
  FaHeadset,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaTag,
  FaCreditCard,
  FaReceipt,
  FaHistory,
  FaUserTie,
  FaUsers,
  FaDatabase,
  FaTimes,
  FaUserCheck
} from 'react-icons/fa';
import './BusinessDetailPage.css';

export const BusinessDetailPage = () => {
  const { id } = useParams();
  const { setSupportMode } = useOutletContext();
  const [biz, setBiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [suspendModal, setSuspendModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [reason, setReason] = useState('');

  const loadData = () => {
    setLoading(true);
    superadminApi.getBusinessDetail(id)
      .then(res => setBiz(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleToggleSuspend = async () => {
    const suspend = biz.accountStatus === 'ACTIVE';
    if (suspend && !reason) {
      alert('A specific suspension reason is mandatory!');
      return;
    }
    try {
      await superadminApi.toggleSuspension(biz._id, { suspend, reason });
      setSuspendModal(false);
      setReason('');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update account status');
    }
  };

  const handleStartSupportAccess = async () => {
    if (!reason || reason.length < 5) {
      alert('A valid operational reason is required for Support Access Mode.');
      return;
    }
    try {
      const res = await superadminApi.startSupportAccess(biz._id, { reason, durationMinutes: 60 });
      sessionStorage.setItem('dealdesk_support_session', JSON.stringify(res.data));
      setSupportMode(res.data);
      setSupportModal(false);
      setReason('');
      alert(`Support Access Mode activated for ${biz.name}. All diagnostic actions will be audited.`);
    } catch (err) {
      alert(err.message || 'Support Access activation failed');
    }
  };

  if (loading) {
    return (
      <div className="sa-bd-loading">
        <div className="sa-bd-loader"></div>
        <p>Loading business workspace profile...</p>
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="sa-bd-error">
        <FaExclamationTriangle className="sa-bd-error-icon" />
        <h2>Business not found</h2>
        <Link to="/admin/businesses" className="sa-bd-btn sa-bd-btn-primary">Back to Businesses</Link>
      </div>
    );
  }

  const analytics = biz.analytics || {};

  return (
    <div className="sa-bd-page">
      {/* Top Bar */}
      <div className="sa-bd-top-bar">
        <Link to="/admin/businesses" className="sa-bd-back-btn">
          <FaArrowLeft /> All Businesses
        </Link>
        <div className="sa-bd-top-actions">
          <button className="sa-bd-btn sa-bd-btn-support" onClick={() => setSupportModal(true)}>
            <FaHeadset /> Support Access
          </button>
          <button 
            className={`sa-bd-btn ${biz.accountStatus === 'ACTIVE' ? 'sa-bd-btn-danger' : 'sa-bd-btn-success'}`}
            onClick={() => setSuspendModal(true)}
          >
            {biz.accountStatus === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="sa-bd-hero">
        <div className="sa-bd-hero-left">
          <div className="sa-bd-avatar">
            <FaBuilding />
          </div>
          <div>
            <h1 className="sa-bd-name">{biz.name}</h1>
            <div className="sa-bd-meta">
              <span>ID: <code>{biz._id}</code></span>
              <span>Slug: <strong>{biz.slug}</strong></span>
              <span>Created: {new Date(biz.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="sa-bd-hero-right">
          <span className={`sa-bd-status-pill ${biz.accountStatus?.toLowerCase()}`}>
            {biz.accountStatus}
          </span>
          <span className={`sa-bd-status-pill ${biz.entitlementStatus?.toLowerCase()}`}>
            {biz.entitlementStatus}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="sa-bd-kpi-grid">
        <div className="sa-bd-kpi-item">
          <FaHome className="sa-bd-kpi-icon blue" />
          <div>
            <span className="sa-bd-kpi-value">{analytics.totalProperties || 0}</span>
            <span className="sa-bd-kpi-label">Properties</span>
          </div>
        </div>
        <div className="sa-bd-kpi-item">
          <FaUserFriends className="sa-bd-kpi-icon green" />
          <div>
            <span className="sa-bd-kpi-value">{analytics.totalAgents || 0}</span>
            <span className="sa-bd-kpi-label">Agents</span>
          </div>
        </div>
        <div className="sa-bd-kpi-item">
          <FaUsers className="sa-bd-kpi-icon purple" />
          <div>
            <span className="sa-bd-kpi-value">{analytics.totalLeads || 0}</span>
            <span className="sa-bd-kpi-label">Leads</span>
          </div>
        </div>
        <div className="sa-bd-kpi-item">
          <FaQrcode className="sa-bd-kpi-icon amber" />
          <div>
            <span className="sa-bd-kpi-value">{analytics.totalQRs || 0}</span>
            <span className="sa-bd-kpi-label">QR Codes</span>
          </div>
        </div>
        <div className="sa-bd-kpi-item">
          <FaHandshake className="sa-bd-kpi-icon red" />
          <div>
            <span className="sa-bd-kpi-value">{analytics.totalDeals || 0}</span>
            <span className="sa-bd-kpi-label">Deals</span>
          </div>
        </div>
        <div className="sa-bd-kpi-item">
          <FaCalendarAlt className="sa-bd-kpi-icon teal" />
          <div>
            <span className="sa-bd-kpi-value">{analytics.totalViewings || 0}</span>
            <span className="sa-bd-kpi-label">Viewings</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sa-bd-tabs">
        <button 
          className={`sa-bd-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaDatabase /> Overview
        </button>
        <button 
          className={`sa-bd-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUserTie /> Users & Agents ({biz.users?.length || 0})
        </button>
        <button 
          className={`sa-bd-tab ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <FaCreditCard /> Billing & Payments ({biz.payments?.length || 0})
        </button>
        <button 
          className={`sa-bd-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <FaHistory /> Audit Trail ({biz.auditLogs?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="sa-bd-tab-content">
        {activeTab === 'overview' && (
          <div className="sa-bd-overview-grid">
            <div className="sa-bd-overview-col">
              <h4>Contact & Location</h4>
              <div className="sa-bd-detail-item">
                <FaEnvelope className="sa-bd-detail-icon" />
                <span><strong>Email:</strong> {biz.email}</span>
              </div>
              <div className="sa-bd-detail-item">
                <FaPhone className="sa-bd-detail-icon" />
                <span><strong>Phone:</strong> {biz.phone || 'N/A'}</span>
              </div>
              <div className="sa-bd-detail-item">
                <FaMapMarkerAlt className="sa-bd-detail-icon" />
                <span><strong>Location:</strong> {biz.city}, {biz.country}</span>
              </div>
              <div className="sa-bd-detail-item">
                <FaGlobe className="sa-bd-detail-icon" />
                <span><strong>Website:</strong> {biz.website || 'N/A'}</span>
              </div>
            </div>
            <div className="sa-bd-overview-col">
              <h4>Workspace Configuration</h4>
              <div className="sa-bd-detail-item">
                <FaTag className="sa-bd-detail-icon" />
                <span><strong>Currency:</strong> {biz.currency || 'USD'}</span>
              </div>
              <div className="sa-bd-detail-item">
                <FaClock className="sa-bd-detail-icon" />
                <span><strong>Timezone:</strong> {biz.timezone || 'Asia/Kolkata'}</span>
              </div>
              <div className="sa-bd-detail-item">
                <FaCreditCard className="sa-bd-detail-icon" />
                <span><strong>Plan:</strong> {biz.planId?.toUpperCase() || 'Starter'} ({biz.billingCycle || 'monthly'})</span>
              </div>
              <div className="sa-bd-detail-item">
                <FaClock className="sa-bd-detail-icon" />
                <span><strong>Trial Expiry:</strong> {biz.trialEndsAt ? new Date(biz.trialEndsAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              {biz.suspensionReason && (
                <div className="sa-bd-detail-item danger">
                  <FaExclamationTriangle className="sa-bd-detail-icon" />
                  <span><strong>Suspension Reason:</strong> {biz.suspensionReason}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="sa-bd-table-wrap">
            <table className="sa-bd-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {biz.users?.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td><code>{u.username}</code></td>
                    <td><span className="sa-bd-status-pill available">{u.role}</span></td>
                    <td>{u.email}</td>
                    <td><span className={`sa-bd-status-pill ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="sa-bd-billing">
            <div className="sa-bd-subscription-box">
              <h4>Active Subscription</h4>
              <div className="sa-bd-subscription-details">
                <span><strong>Plan:</strong> {biz.subscription?.planId?.toUpperCase() || biz.planId?.toUpperCase()}</span>
                <span><strong>Cycle:</strong> {biz.subscription?.billingCycle || 'monthly'}</span>
                <span><strong>Amount:</strong> ${biz.subscription?.amount || 0} {biz.subscription?.currency || 'USD'}</span>
                <span><strong>Provider:</strong> {biz.subscription?.provider || 'Razorpay'}</span>
                <span><strong>Subscription ID:</strong> <code>{biz.subscription?.providerSubscriptionId || 'N/A'}</code></span>
              </div>
            </div>

            <h4 className="sa-bd-section-title">Payment History</h4>
            <div className="sa-bd-table-wrap">
              <table className="sa-bd-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Provider Ref</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {biz.payments?.map(p => (
                    <tr key={p._id}>
                      <td><strong>{p.invoiceId || 'N/A'}</strong></td>
                      <td>${p.amount} {p.currency}</td>
                      <td><code>{p.providerPaymentId}</code></td>
                      <td><span className="sa-bd-status-pill available">{p.status}</span></td>
                      <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="sa-bd-table-wrap">
            <table className="sa-bd-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {biz.auditLogs?.map(l => (
                  <tr key={l._id}>
                    <td>{new Date(l.timestamp).toLocaleString()}</td>
                    <td><strong>{l.who}</strong></td>
                    <td>{l.role}</td>
                    <td><code>{l.action}</code></td>
                    <td>{l.reason || 'Standard event'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {suspendModal && (
        <div className="sa-bd-modal-overlay" onClick={() => setSuspendModal(false)}>
          <div className="sa-bd-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-bd-modal-header">
              <h3>{biz.accountStatus === 'ACTIVE' ? 'Suspend Business' : 'Reactivate Business'}</h3>
              <button className="sa-bd-modal-close" onClick={() => setSuspendModal(false)}><FaTimes /></button>
            </div>
            <div className="sa-bd-modal-body">
              <p>
                {biz.accountStatus === 'ACTIVE'
                  ? 'Suspension will immediately block workspace login and API access for all agents. A mandatory reason is required.'
                  : 'Reactivating will restore instant workspace access.'}
              </p>
              {biz.accountStatus === 'ACTIVE' && (
                <div className="sa-bd-form-group">
                  <label>Suspension Reason *</label>
                  <input
                    type="text"
                    placeholder="e.g., Terms violation, chargeback investigation, manual review"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="sa-bd-modal-footer">
              <button className="sa-bd-btn sa-bd-btn-secondary" onClick={() => setSuspendModal(false)}>Cancel</button>
              <button className="sa-bd-btn sa-bd-btn-danger" onClick={handleToggleSuspend}>
                Confirm Status Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Access Modal */}
      {supportModal && (
        <div className="sa-bd-modal-overlay" onClick={() => setSupportModal(false)}>
          <div className="sa-bd-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-bd-modal-header">
              <h3>Activate Support Access</h3>
              <button className="sa-bd-modal-close" onClick={() => setSupportModal(false)}><FaTimes /></button>
            </div>
            <div className="sa-bd-modal-body">
              <p>
                Temporary 60-minute diagnostic session for troubleshooting. An amber banner will be shown, and every action is audited.
              </p>
              <div className="sa-bd-form-group">
                <label>Troubleshooting Reason *</label>
                <input
                  type="text"
                  placeholder="e.g., Investigating QR code redirection logic"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>
            </div>
            <div className="sa-bd-modal-footer">
              <button className="sa-bd-btn sa-bd-btn-secondary" onClick={() => setSupportModal(false)}>Cancel</button>
              <button className="sa-bd-btn sa-bd-btn-primary" onClick={handleStartSupportAccess}>
                Activate Support Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
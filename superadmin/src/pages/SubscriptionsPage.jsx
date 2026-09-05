import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superadminApi } from '../services/api/superadminApi.js';
import { 
  FaSearch, 
  FaSync, 
  FaCreditCard, 
  FaCalendarAlt, 
  FaDollarSign,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaBuilding
} from 'react-icons/fa';
import './SubscriptionsPage.css';

export const SubscriptionsPage = () => {
  const [subs, setSubs] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSubscriptions = () => {
    setLoading(true);
    superadminApi.listSubscriptions()
      .then(res => {
        setSubs(res.data || []);
        setFilteredSubs(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  // Filter subscriptions based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSubs(subs);
      return;
    }
    const term = searchTerm.toLowerCase().trim();
    const filtered = subs.filter(s => 
      s.businessId?.name?.toLowerCase().includes(term) ||
      s.planId?.toLowerCase().includes(term) ||
      s.status?.toLowerCase().includes(term) ||
      s.billingCycle?.toLowerCase().includes(term)
    );
    setFilteredSubs(filtered);
  }, [searchTerm, subs]);

  const handleRefresh = () => {
    loadSubscriptions();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'active_subscription':
        return 'sa-sub-status-active';
      case 'trialing':
      case 'trial':
        return 'sa-sub-status-trial';
      case 'expired':
        return 'sa-sub-status-expired';
      case 'cancelled':
      case 'canceled':
        return 'sa-sub-status-cancelled';
      default:
        return 'sa-sub-status-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'active_subscription':
        return <FaCheckCircle className="sa-sub-status-icon" />;
      case 'trialing':
      case 'trial':
        return <FaClock className="sa-sub-status-icon" />;
      case 'expired':
        return <FaExclamationTriangle className="sa-sub-status-icon" />;
      default:
        return null;
    }
  };

  // Summary stats
  const total = subs.length;
  const active = subs.filter(s => s.status === 'active' || s.status === 'ACTIVE_SUBSCRIPTION').length;
  const trialing = subs.filter(s => s.status === 'trialing' || s.status === 'TRIAL').length;
  const expired = subs.filter(s => s.status === 'expired' || s.status === 'EXPIRED').length;

  if (loading) {
    return (
      <div className="sa-sub-loading">
        <div className="sa-sub-loader"></div>
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="sa-sub-page">
      {/* Header */}
      <div className="sa-sub-header">
        <div>
          <h1>All Customer Subscriptions</h1>
          <p className="sa-sub-subtitle">Platform billing status, plans, and renewal periods.</p>
        </div>
        <button className="sa-sub-btn sa-sub-btn-refresh" onClick={handleRefresh} title="Refresh">
          <FaSync /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="sa-sub-summary">
        <div className="sa-sub-stat">
          <span className="sa-sub-stat-label">Total</span>
          <span className="sa-sub-stat-value">{total}</span>
        </div>
        <div className="sa-sub-stat active">
          <FaCheckCircle className="sa-sub-stat-icon" />
          <span className="sa-sub-stat-label">Active</span>
          <span className="sa-sub-stat-value">{active}</span>
        </div>
        <div className="sa-sub-stat trialing">
          <FaClock className="sa-sub-stat-icon" />
          <span className="sa-sub-stat-label">Trialing</span>
          <span className="sa-sub-stat-value">{trialing}</span>
        </div>
        <div className="sa-sub-stat expired">
          <FaExclamationTriangle className="sa-sub-stat-icon" />
          <span className="sa-sub-stat-label">Expired</span>
          <span className="sa-sub-stat-value">{expired}</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sa-sub-toolbar">
        <div className="sa-sub-search">
          <FaSearch className="sa-sub-search-icon" />
          <input
            type="text"
            placeholder="Search by business, plan, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="sa-sub-search-clear"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="sa-sub-toolbar-right">
          <span className="sa-sub-count">{filteredSubs.length} of {total} subscriptions</span>
        </div>
      </div>

      {/* Table */}
      <div className="sa-sub-table-card">
        {filteredSubs.length === 0 ? (
          <div className="sa-sub-empty">
            <FaCreditCard className="sa-sub-empty-icon" />
            <h3>No subscriptions found</h3>
            <p>
              {searchTerm ? 'Try adjusting your search terms.' : 'No active or historical subscriptions yet.'}
            </p>
          </div>
        ) : (
          <div className="sa-sub-table-wrap">
            <table className="sa-sub-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Plan</th>
                  <th>Cycle</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Renewal Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="sa-sub-business">
                        <FaBuilding className="sa-sub-business-icon" />
                        <span>{s.businessId?.name || 'Workspace'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sa-sub-plan">{s.planId?.toUpperCase() || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="sa-sub-cycle">{s.billingCycle || 'monthly'}</span>
                    </td>
                    <td>
                      <span className="sa-sub-amount">
                        {s.currency === 'INR' ? '₹' : '$'}{s.amount?.toLocaleString()} {s.currency || 'USD'}
                      </span>
                    </td>
                    <td>
                      <span className={`sa-sub-status ${getStatusBadgeClass(s.status)}`}>
                        {getStatusIcon(s.status)}
                        {s.status || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className="sa-sub-date">
                        {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredSubs.length > 0 && (
        <div className="sa-sub-footer">
          <span>Showing {filteredSubs.length} of {subs.length} subscriptions</span>
        </div>
      )}
    </div>
  );
};
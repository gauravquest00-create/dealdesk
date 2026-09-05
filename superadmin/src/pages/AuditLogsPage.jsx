import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superadminApi } from '../services/api/superadminApi.js';
import { 
  FaSearch, 
  FaSync, 
  FaHistory, 
  FaUserShield,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaBuilding,
  FaUser,
  FaTag,
  FaCreditCard,
  FaTimes
} from 'react-icons/fa';
import './AuditLogsPage.css';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadLogs = () => {
    setLoading(true);
    superadminApi.listAuditLogs()
      .then(res => {
        setLogs(res.data || []);
        setFilteredLogs(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filter logs based on search term and action filter
  useEffect(() => {
    let filtered = logs;
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(l => 
        l.who?.toLowerCase().includes(term) ||
        l.action?.toLowerCase().includes(term) ||
        l.targetType?.toLowerCase().includes(term) ||
        l.reason?.toLowerCase().includes(term) ||
        l.role?.toLowerCase().includes(term)
      );
    }
    
    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(l => l.action === actionFilter);
    }
    
    setFilteredLogs(filtered);
  }, [searchTerm, actionFilter, logs]);

  const handleRefresh = () => {
    loadLogs();
  };

  // Get unique actions for filter dropdown
  const uniqueActions = [...new Set(logs.map(l => l.action).filter(Boolean))];

  // Summary stats
  const total = logs.length;
  const recent = logs.slice(0, 7).length;

  // Get action icon
  const getActionIcon = (action) => {
    if (action?.toLowerCase().includes('login')) return <FaUser className="sa-audit-action-icon" />;
    if (action?.toLowerCase().includes('business') || action?.toLowerCase().includes('workspace')) return <FaBuilding className="sa-audit-action-icon" />;
    if (action?.toLowerCase().includes('subscription') || action?.toLowerCase().includes('payment') || action?.toLowerCase().includes('billing')) return <FaCreditCard className="sa-audit-action-icon" />;
    if (action?.toLowerCase().includes('plan')) return <FaTag className="sa-audit-action-icon" />;
    if (action?.toLowerCase().includes('support')) return <FaUserShield className="sa-audit-action-icon" />;
    return <FaHistory className="sa-audit-action-icon" />;
  };

  if (loading) {
    return (
      <div className="sa-audit-loading">
        <div className="sa-audit-loader"></div>
        <p>Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="sa-audit-page">
      {/* Header */}
      <div className="sa-audit-header">
        <div>
          <h1>Security & Platform Audit Logs</h1>
          <p className="sa-audit-subtitle">Immutable record of sensitive administrative, subscription, and support actions.</p>
        </div>
        <button className="sa-audit-btn sa-audit-btn-refresh" onClick={handleRefresh} title="Refresh">
          <FaSync /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="sa-audit-summary">
        <div className="sa-audit-stat">
          <span className="sa-audit-stat-label">Total Logs</span>
          <span className="sa-audit-stat-value">{total}</span>
        </div>
        <div className="sa-audit-stat recent">
          <FaClock className="sa-audit-stat-icon" />
          <span className="sa-audit-stat-label">Recent</span>
          <span className="sa-audit-stat-value">{recent}</span>
        </div>
        <div className="sa-audit-stat actions">
          <FaHistory className="sa-audit-stat-icon" />
          <span className="sa-audit-stat-label">Unique Actions</span>
          <span className="sa-audit-stat-value">{uniqueActions.length}</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sa-audit-toolbar">
        <div className="sa-audit-search">
          <FaSearch className="sa-audit-search-icon" />
          <input
            type="text"
            placeholder="Search by actor, action, target, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="sa-audit-search-clear"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="sa-audit-filter-group">
          <select 
            value={actionFilter} 
            onChange={(e) => setActionFilter(e.target.value)}
            className="sa-audit-filter-select"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <span className="sa-audit-count">{filteredLogs.length} of {logs.length} logs</span>
        </div>
      </div>

      {/* Table */}
      <div className="sa-audit-table-card">
        {filteredLogs.length === 0 ? (
          <div className="sa-audit-empty">
            <FaHistory className="sa-audit-empty-icon" />
            <h3>No audit logs found</h3>
            <p>
              {searchTerm || actionFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No audit logs recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="sa-audit-table-wrap">
            <table className="sa-audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Reason / Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <span className="sa-audit-timestamp">
                        {l.timestamp ? new Date(l.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="sa-audit-actor">
                        <FaUser className="sa-audit-actor-icon" />
                        <span>{l.who || 'System'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sa-audit-role">{l.role || 'Unknown'}</span>
                    </td>
                    <td>
                      <div className="sa-audit-action">
                        {getActionIcon(l.action)}
                        <span className="sa-audit-action-label">{l.action || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sa-audit-target">{l.targetType || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="sa-audit-reason">{l.reason || 'Normal operation'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredLogs.length > 0 && (
        <div className="sa-audit-footer">
          <span>Showing {filteredLogs.length} of {logs.length} audit logs</span>
        </div>
      )}
    </div>
  );
};
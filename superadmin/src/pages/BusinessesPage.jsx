import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superadminApi } from '../services/api/superadminApi.js';
import { 
  FaBuilding, 
  FaHeadset, 
  FaEye, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaSync,
  FaUserCheck,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import './BusinessesPage.css';

export const BusinessesPage = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadBusinesses = () => {
    setLoading(true);
    superadminApi.listBusinesses()
      .then(res => {
        setBusinesses(res.data || []);
        setFilteredBusinesses(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  // Apply filters whenever searchTerm or statusFilter or businesses change
  useEffect(() => {
    let filtered = businesses;
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(b =>
        b.name?.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term) ||
        b.slug?.toLowerCase().includes(term) ||
        b.city?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => 
        b.entitlementStatus?.toLowerCase() === statusFilter.toLowerCase() ||
        b.accountStatus?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    setFilteredBusinesses(filtered);
  }, [searchTerm, statusFilter, businesses]);

  const handleCreateBusiness = () => {
    navigate('/admin/businesses/new');
  };

  const handleRefresh = () => {
    loadBusinesses();
  };

  // Get counts for status summary
  const total = businesses.length;
  const active = businesses.filter(b => b.accountStatus === 'ACTIVE').length;
  const trialing = businesses.filter(b => b.entitlementStatus === 'TRIAL').length;
  const expired = businesses.filter(b => b.entitlementStatus === 'EXPIRED').length;
  const suspended = businesses.filter(b => b.accountStatus === 'SUSPENDED').length;

  if (loading) {
    return (
      <div className="sa-biz-loading">
        <div className="sa-biz-loader"></div>
        <p>Loading businesses...</p>
      </div>
    );
  }

  return (
    <div className="sa-biz-page">
      {/* Header */}
      <div className="sa-biz-header">
        <div>
          <h1>Customer Workspaces</h1>
          <p className="sa-biz-subtitle">Manage all subscribed and trialing business accounts across the platform.</p>
        </div>
        <div className="sa-biz-header-actions">
          <button className="sa-biz-btn sa-biz-btn-primary" onClick={handleCreateBusiness}>
            <FaPlus /> Create New Business
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="sa-biz-summary">
        <div className="sa-biz-stat">
          <span className="sa-biz-stat-label">Total</span>
          <span className="sa-biz-stat-value">{total}</span>
        </div>
        <div className="sa-biz-stat active">
          <FaCheckCircle className="sa-biz-stat-icon" />
          <span className="sa-biz-stat-label">Active</span>
          <span className="sa-biz-stat-value">{active}</span>
        </div>
        <div className="sa-biz-stat trial">
          <FaHourglassHalf className="sa-biz-stat-icon" />
          <span className="sa-biz-stat-label">Trial</span>
          <span className="sa-biz-stat-value">{trialing}</span>
        </div>
        <div className="sa-biz-stat expired">
          <FaExclamationTriangle className="sa-biz-stat-icon" />
          <span className="sa-biz-stat-label">Expired</span>
          <span className="sa-biz-stat-value">{expired}</span>
        </div>
        <div className="sa-biz-stat suspended">
          <FaUserCheck className="sa-biz-stat-icon" />
          <span className="sa-biz-stat-label">Suspended</span>
          <span className="sa-biz-stat-value">{suspended}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sa-biz-filters">
        <div className="sa-biz-search">
          <FaSearch className="sa-biz-search-icon" />
          <input
            type="text"
            placeholder="Search by business name, email, slug, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="sa-biz-search-clear"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="sa-biz-filter-group">
          <FaFilter className="sa-biz-filter-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="sa-biz-refresh-btn" onClick={handleRefresh} title="Refresh list">
            <FaSync />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="sa-biz-table-card">
        {filteredBusinesses.length === 0 ? (
          <div className="sa-biz-empty">
            <FaBuilding className="sa-biz-empty-icon" />
            <h3>No businesses found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Create your first business workspace to get started.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button className="sa-biz-btn sa-biz-btn-primary" onClick={handleCreateBusiness}>
                <FaPlus /> Create New Business
              </button>
            )}
          </div>
        ) : (
          <div className="sa-biz-table-wrap">
            <table className="sa-biz-table">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Location</th>
                  <th>Contact Email</th>
                  <th>Entitlement</th>
                  <th>Account Status</th>
                  <th>Inventory</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((b) => (
                  <tr 
                    key={b._id} 
                    className="sa-biz-row"
                    onClick={() => navigate(`/admin/businesses/${b._id}`)}
                  >
                    <td>
                      <div className="sa-biz-name-cell">
                        <strong>{b.name}</strong>
                        <span className="sa-biz-slug">{b.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sa-biz-location">
                        {b.city || 'N/A'}, {b.country || 'N/A'}
                      </span>
                    </td>
                    <td>{b.email}</td>
                    <td>
                      <span className={`sa-biz-status-pill ${b.entitlementStatus?.toLowerCase()}`}>
                        {b.entitlementStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`sa-biz-status-pill ${b.accountStatus?.toLowerCase()}`}>
                        {b.accountStatus}
                      </span>
                    </td>
                    <td>
                      <span className="sa-biz-count-hint">
                        {b.counts?.properties || 0} Props • {b.counts?.agents || 0} Agents
                      </span>
                    </td>
                    <td>
                      <button 
                        className="sa-biz-btn-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/businesses/${b._id}`);
                        }}
                        title="View Business Details"
                      >
                        <FaEye /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer: showing count */}
      {filteredBusinesses.length > 0 && (
        <div className="sa-biz-footer">
          <span>Showing {filteredBusinesses.length} of {businesses.length} businesses</span>
        </div>
      )}
    </div>
  );
};
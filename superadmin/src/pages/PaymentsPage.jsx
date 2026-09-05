import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superadminApi } from '../services/api/superadminApi.js';
import { 
  FaSearch, 
  FaSync, 
  FaReceipt, 
  FaDollarSign,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaBuilding,
  FaTimes
} from 'react-icons/fa';
import './PaymentsPage.css';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPayments = () => {
    setLoading(true);
    superadminApi.listPayments()
      .then(res => {
        setPayments(res.data || []);
        setFilteredPayments(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Filter payments based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPayments(payments);
      return;
    }
    const term = searchTerm.toLowerCase().trim();
    const filtered = payments.filter(p => 
      p.businessId?.name?.toLowerCase().includes(term) ||
      p.invoiceId?.toLowerCase().includes(term) ||
      p.providerPaymentId?.toLowerCase().includes(term) ||
      p.status?.toLowerCase().includes(term)
    );
    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const handleRefresh = () => {
    loadPayments();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'captured':
      case 'verified':
        return 'sa-pay-status-captured';
      case 'pending':
        return 'sa-pay-status-pending';
      case 'failed':
        return 'sa-pay-status-failed';
      case 'refunded':
        return 'sa-pay-status-refunded';
      default:
        return 'sa-pay-status-default';
    }
  };

  // Summary stats
  const total = payments.length;
  const captured = payments.filter(p => p.status?.toLowerCase() === 'captured' || p.status?.toLowerCase() === 'verified').length;
  const pending = payments.filter(p => p.status?.toLowerCase() === 'pending').length;
  const failed = payments.filter(p => p.status?.toLowerCase() === 'failed').length;

  return (
    <div className="sa-pay-page">
      {/* Header */}
      <div className="sa-pay-header">
        <div>
          <h1>Payments Ledger</h1>
          <p className="sa-pay-subtitle">All payment transactions across the platform.</p>
        </div>
        <button className="sa-pay-btn sa-pay-btn-refresh" onClick={handleRefresh} title="Refresh">
          <FaSync /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="sa-pay-summary">
        <div className="sa-pay-stat">
          <span className="sa-pay-stat-label">Total</span>
          <span className="sa-pay-stat-value">{total}</span>
        </div>
        <div className="sa-pay-stat captured">
          <FaCheckCircle className="sa-pay-stat-icon" />
          <span className="sa-pay-stat-label">Captured</span>
          <span className="sa-pay-stat-value">{captured}</span>
        </div>
        <div className="sa-pay-stat pending">
          <FaClock className="sa-pay-stat-icon" />
          <span className="sa-pay-stat-label">Pending</span>
          <span className="sa-pay-stat-value">{pending}</span>
        </div>
        <div className="sa-pay-stat failed">
          <FaExclamationTriangle className="sa-pay-stat-icon" />
          <span className="sa-pay-stat-label">Failed</span>
          <span className="sa-pay-stat-value">{failed}</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sa-pay-toolbar">
        <div className="sa-pay-search">
          <FaSearch className="sa-pay-search-icon" />
          <input
            type="text"
            placeholder="Search by business, invoice, payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="sa-pay-search-clear"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="sa-pay-toolbar-right">
          <span className="sa-pay-count">{filteredPayments.length} of {payments.length} payments</span>
        </div>
      </div>

      {/* Table */}
      <div className="sa-pay-table-card">
        {filteredPayments.length === 0 ? (
          <div className="sa-pay-empty">
            <FaReceipt className="sa-pay-empty-icon" />
            <h3>No payments found</h3>
            <p>
              {searchTerm ? 'Try adjusting your search terms.' : 'No payment transactions yet.'}
            </p>
          </div>
        ) : (
          <div className="sa-pay-table-wrap">
            <table className="sa-pay-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Business</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Payment ID</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="sa-pay-invoice">{p.invoiceId || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="sa-pay-business">
                        <FaBuilding className="sa-pay-business-icon" />
                        <span>{p.businessId?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="sa-pay-amount">
                        {p.currency === 'INR' ? '₹' : '$'}{p.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="sa-pay-currency">{p.currency || 'USD'}</span>
                    </td>
                    <td>
                      <code className="sa-pay-payment-id">{p.providerPaymentId?.slice(0, 16)}...</code>
                    </td>
                    <td>
                      <span className={`sa-pay-status ${getStatusBadgeClass(p.status)}`}>
                        {p.status || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className="sa-pay-date">
                        {p.paidAt || p.createdAt ? new Date(p.paidAt || p.createdAt).toLocaleDateString('en-IN', {
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
      {filteredPayments.length > 0 && (
        <div className="sa-pay-footer">
          <span>Showing {filteredPayments.length} of {payments.length} payments</span>
        </div>
      )}
    </div>
  );
};
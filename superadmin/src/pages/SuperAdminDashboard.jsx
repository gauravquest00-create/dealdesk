import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superadminApi } from '../services/api/superadminApi.js';
import { 
  FaBuilding, 
  FaDollarSign, 
  FaUserCheck, 
  FaHourglassHalf, 
  FaCreditCard,
  FaArrowRight,
  FaChartLine,
  FaUsers,
  FaReceipt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import './SuperAdminDashboard.css';

export const SuperAdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superadminApi.getMetrics()
      .then(res => setMetrics(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="sa-dash-loading">
        <div className="sa-dash-loader"></div>
        <p>Loading platform metrics...</p>
      </div>
    );
  }

  // 🔥 Filter only Razorpay verified/captured payments
  const verifiedPayments = metrics?.recentPayments?.filter(p => 
    p.status === 'Captured' || p.status === 'verified' || p.status === 'Verified'
  ) || [];

  // KPI Cards
  const kpiCards = [
    {
      id: 'mrr',
      label: 'Monthly Recurring Revenue',
      value: `$${metrics?.mrr?.toLocaleString() || 0}`,
      icon: <FaDollarSign />,
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.08)',
      link: '/admin/subscriptions',
      hint: `${metrics?.activeSubscriptions || 0} Active Subscriptions`
    },
    {
      id: 'businesses',
      label: 'Total Businesses',
      value: metrics?.totalBusinesses || 0,
      icon: <FaBuilding />,
      color: '#2563eb',
      bg: 'rgba(37, 99, 235, 0.08)',
      link: '/admin/businesses',
      hint: `${metrics?.activeBusinesses || 0} Active Workspaces`
    },
    {
      id: 'trials',
      label: 'Active 3-Day Trials',
      value: metrics?.activeTrialsCount || 0,
      icon: <FaHourglassHalf />,
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.08)',
      link: '/admin/businesses?status=TRIAL_ACTIVE',
      hint: `${metrics?.trialConversionRate || 0}% Conversion Rate`
    },
    {
      id: 'plans',
      label: 'Plan Catalog',
      value: 'Active',
      icon: <FaCreditCard />,
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.08)',
      link: '/admin/plans',
      hint: 'Manage Subscription Tiers'
    },
    {
      id: 'users',
      label: 'Total Users',
      value: metrics?.totalUsers || 0,
      icon: <FaUsers />,
      color: '#0891b2',
      bg: 'rgba(8, 145, 178, 0.08)',
      link: '/admin/businesses',
      hint: 'Across all businesses'
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: `$${metrics?.totalRevenue?.toLocaleString() || 0}`,
      icon: <FaChartLine />,
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.08)',
      link: '/admin/payments',
      hint: 'Lifetime platform revenue'
    },
  ];

  return (
    <div className="sa-dash-page">
      {/* Header */}
      <div className="sa-dash-header">
        <div>
          <h1>Platform Intelligence & KPIs</h1>
          <p className="sa-dash-subtitle">Global operations overview across all DealDesk brokerage workspaces.</p>
        </div>
        <div className="sa-dash-header-actions">
          <span className="sa-dash-live-badge">
            <span className="sa-dash-live-dot"></span>
            Live
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="sa-dash-kpi-grid">
        {kpiCards.map((card) => (
          <Link key={card.id} to={card.link} className="sa-dash-kpi-card">
            <div className="sa-dash-kpi-top">
              <div className="sa-dash-kpi-icon" style={{ backgroundColor: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <span className="sa-dash-kpi-arrow">
                <FaArrowRight />
              </span>
            </div>
            <div className="sa-dash-kpi-content">
              <span className="sa-dash-kpi-label">{card.label}</span>
              <h2 className="sa-dash-kpi-value">{card.value}</h2>
              <span className="sa-dash-kpi-hint">{card.hint} →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Verified Payments Section */}
      <div className="sa-dash-card">
        <div className="sa-dash-card-header">
          <div className="sa-dash-card-title">
            <FaReceipt className="sa-dash-card-icon" />
            <h3>Recent Verified Payments (Razorpay)</h3>
          </div>
          <Link to="/admin/payments" className="sa-dash-card-link">
            View All <FaArrowRight />
          </Link>
        </div>

        {verifiedPayments.length === 0 ? (
          <div className="sa-dash-empty">
            <FaCheckCircle className="sa-dash-empty-icon" />
            <p>No verified payments recorded yet.</p>
          </div>
        ) : (
          <div className="sa-dash-table-wrap">
            <table className="sa-dash-table">
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
                {verifiedPayments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="sa-dash-invoice">{p.invoiceId || 'N/A'}</span>
                    </td>
                    <td>{p.businessName || 'N/A'}</td>
                    <td>
                      <span className="sa-dash-amount">
                        {p.currency === 'INR' ? '₹' : '$'}{p.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td>{p.currency || 'USD'}</td>
                    <td>
                      <code className="sa-dash-code">{p.providerPaymentId?.slice(0, 16)}...</code>
                    </td>
                    <td>
                      <span className={`sa-dash-status ${p.status?.toLowerCase() === 'captured' || p.status?.toLowerCase() === 'verified' ? 'captured' : 'pending'}`}>
                        {p.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className="sa-dash-date">
                        {new Date(p.paidAt || p.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="sa-dash-footer-stats">
        <div className="sa-dash-footer-item">
          <FaClock className="sa-dash-footer-icon" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
        <div className="sa-dash-footer-item">
          <FaCheckCircle className="sa-dash-footer-icon success" />
          <span>All systems operational</span>
        </div>
      </div>
    </div>
  );
};
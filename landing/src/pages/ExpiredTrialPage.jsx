import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';
import { UpgradePlanModal } from '../components/UpgradePlanModal.jsx';
import { FaLock, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import './ExpiredTrialPage.css';

export const ExpiredTrialPage = () => {
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in via localStorage
  useEffect(() => {
    const token = localStorage.getItem('dealdesk_token');
    setIsLoggedIn(!!token);
    setLoading(false);

    // Auto-open modal if user is logged in
    if (token) {
      setShowUpgradeModal(true);
    }
  }, []);

  const handleUpgradeSuccess = () => {
    setUpgradeSuccess(true);
    // Redirect to dashboard after successful upgrade
    setTimeout(() => {
      const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173';
      window.location.href = `${dashboardUrl}/app`;
    }, 1500);
  };

  // If still loading, show nothing
  if (loading) {
    return (
      <div className="expired-loading">
        <div className="expired-loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="expired-page">
      <Navbar />
      <main className="expired-main">
        <div className="expired-container">
          <div className="expired-card">
            {/* Icon */}
            <div className="expired-icon-wrapper">
              <FaLock className="expired-icon" />
            </div>

            <h1 className="expired-title">Your Access Has Expired</h1>
            <p className="expired-desc">
              Your DealDesk workspace, inventory, leads, and historical QR analytics are safe.
              To continue managing active real estate deals without interruption, select a subscription plan.
            </p>

            <div className="expired-preserve-badge">
              <FaShieldAlt /> All workspace data preserved
            </div>

            <div className="expired-actions">
              <button 
                className="expired-btn-primary"
                onClick={() => setShowUpgradeModal(true)}
              >
                <FaArrowRight /> Upgrade Now
              </button>
              <Link to="/contact" className="expired-btn-secondary">
                Contact Support
              </Link>
            </div>

            {upgradeSuccess && (
              <div className="expired-success-msg">
                ✅ Upgrade successful! Redirecting to dashboard...
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
        title="Upgrade Your Plan"
        message="Choose a plan that fits your needs and continue managing your real estate deals."
        feature="Plan Expired"
      />

      <Footer />
    </div>
  );
};
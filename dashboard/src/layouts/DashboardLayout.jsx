import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { MobileBottomNav } from './MobileBottomNav.jsx';
import { Breadcrumbs } from './Breadcrumbs.jsx';
import { UpgradePlanModal } from '../components/UpgradePlanModal.jsx'; // ✅ Reuse
import { useAuth } from '../context/AuthContext.jsx';
import './DashboardLayout.css';

export const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { trialExpired, setTrialExpired } = useAuth();
  const navigate = useNavigate();

  const handleUpgradeSuccess = () => {
    // Refresh status to update trialExpired
    setTrialExpired(false);
    window.location.reload();
  };

  return (
    <div className={`dashboard-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`dashboard-main-wrapper ${sidebarCollapsed ? 'main-expanded' : ''}`}>
        <Header collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main className="dashboard-content-area">
          <Breadcrumbs />
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>

      {/* ✅ Use UpgradePlanModal for trial expiry */}
      <UpgradePlanModal
        isOpen={trialExpired}
        onClose={() => setTrialExpired(false)}
        onSuccess={handleUpgradeSuccess}
        title="Your 3-Day Free Trial Has Expired"
        message="Your workspace and data are completely safe. Continue using DealDesk by choosing a subscription plan."
        feature="Trial Expired"
      />
    </div>
  );
};

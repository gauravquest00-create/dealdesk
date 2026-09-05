import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { MobileBottomNav } from './MobileBottomNav.jsx';
import { Breadcrumbs } from './Breadcrumbs.jsx';
import { TrialLockModal } from './TrialLockModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './DashboardLayout.css';

export const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { trialExpired, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={`dashboard-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`dashboard-main-wrapper ${sidebarCollapsed ? 'main-expanded' : ''}`}>
        <Header collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        <main className="dashboard-content-area">
          <Breadcrumbs />
          <Outlet context={{ user, isAdmin }} />
        </main>

        <MobileBottomNav />
      </div>

      {trialExpired && (
        <TrialLockModal onChoosePlan={() => navigate('/app/settings#billing')} />
      )}
    </div>
  );
};
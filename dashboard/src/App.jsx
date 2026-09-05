import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { DashboardOverview } from './pages/DashboardOverview.jsx';
import { PropertiesPage } from './pages/PropertiesPage.jsx';
import { PropertyDetailPage } from './pages/PropertyDetailPage.jsx';
import { LeadsPage } from './pages/LeadsPage.jsx';
import { LeadDetailPage } from './pages/LeadDetailPage.jsx';
import { SmartMatchPage } from './pages/SmartMatchPage.jsx';
import { ViewingsPage } from './pages/ViewingsPage.jsx';
import { OpenHousePage } from './pages/OpenHousePage.jsx';
import { SmartQRPage } from './pages/SmartQRPage.jsx';
import { DocumentsPage } from './pages/DocumentsPage.jsx';
import { CommunicationsPage } from './pages/CommunicationsPage.jsx';
import { DealsPage } from './pages/DealsPage.jsx';
import { TeamPage } from './pages/TeamPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { PublicQRResolver } from './pages/PublicQRResolver.jsx';
import { PublicOpenHouseReg } from './pages/PublicOpenHouseReg.jsx';
import { PublicSocialForm } from './pages/PublicSocialForm.jsx';
import { SocialLinksPage } from './pages/SocialLinksPage.jsx';

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        color: '#64748b',
        fontSize: '18px'
      }}>
        Loading your workspace...
      </div>
    );
  }

  if (!user) {
    const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:5175/login';
    window.location.href = loginUrl;
    return null;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* 🔓 Public Routes */}
      <Route path="/qr/:qrId" element={<PublicQRResolver />} />
      <Route path="/oh/:eventQrCode" element={<PublicOpenHouseReg />} />
      <Route path="/social/:slug" element={<PublicSocialForm />} />

      {/* 🔒 Private Workspace Routes */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/:id" element={<PropertyDetailPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/:id" element={<LeadDetailPage />} />
        <Route path="matches" element={<SmartMatchPage />} />
        <Route path="viewings" element={<ViewingsPage />} />
        <Route path="open-houses" element={<OpenHousePage />} />
        <Route path="qr" element={<SmartQRPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="communications" element={<CommunicationsPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="social-links" element={<SocialLinksPage />} />
      </Route>

      {/* Root Path */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Navigate to="/app" replace />
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
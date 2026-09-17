import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SuperAdminLayout } from './layouts/SuperAdminLayout.jsx';
import { SuperAdminLogin } from './pages/SuperAdminLogin.jsx';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard.jsx';
import { BusinessesPage } from './pages/BusinessesPage.jsx';
import { BusinessDetailPage } from './pages/BusinessDetailPage.jsx';
import { SubscriptionsPage } from './pages/SubscriptionsPage.jsx';
import { PlansPage } from './pages/PlansPage.jsx';
import { AuditLogsPage } from './pages/AuditLogsPage.jsx';
import { SuperAdminProfile } from './pages/SuperAdminProfile.jsx';
import { CreateBusinessPage } from './pages/CreateBusinessPage.jsx';
import { PaymentsPage } from './pages/PaymentsPage.jsx';
import { ResetBusinessPassword } from './pages/ResetBusinessPassword.jsx';

export const App = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<SuperAdminLogin />} />

      <Route path="/admin" element={<SuperAdminLayout />}>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="businesses" element={<BusinessesPage />} />
        <Route path="businesses/new" element={<CreateBusinessPage />} />
        <Route path="businesses/:id" element={<BusinessDetailPage />} />
        <Route path="businesses/reset-password" element={<ResetBusinessPassword />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="profile" element={<SuperAdminProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

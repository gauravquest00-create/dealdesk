// src/components/RequirePropertyAccess.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const RequirePropertyAccess = ({ children }) => {
  const { user } = useAuth();
  const subRole = user?.subRole;

  // Allow access if:
  // - User is ADMIN, OR
  // - subRole is PROPERTY_AGENT, OR
  // - subRole is PROPERTY_LEAD_AGENT (Dual Agent)
  const canAccess =
    user?.role === 'ADMIN' ||
    subRole === 'PROPERTY_AGENT' ||
    subRole === 'PROPERTY_LEAD_AGENT';

  if (!canAccess) {
    // Redirect to Access Denied page (instead of dashboard)
    return <Navigate to="/app/access-denied" replace />;
  }

  return children;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api/services.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // SessionStorage se initial state load karo (Har tab ka alag data)
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('dealdesk_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [business, setBusiness] = useState(() => {
    const stored = sessionStorage.getItem('dealdesk_business');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [trialExpired, setTrialExpired] = useState(false);

  useEffect(() => {
    const initializeAuth = () => {
      // URL se token grab karo (agar login se redirect ho rahe hain)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        sessionStorage.setItem('dealdesk_token', tokenFromUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = sessionStorage.getItem('dealdesk_token');
      if (!token) {
        setLoading(false);
        return;
      }

      authApi.me()
        .then(res => {
          setUser(res.data.user);
          setBusiness(res.data.business);
          sessionStorage.setItem('dealdesk_user', JSON.stringify(res.data.user));
          if (res.data.business) {
            sessionStorage.setItem('dealdesk_business', JSON.stringify(res.data.business));
            if (res.data.business.entitlementStatus === 'EXPIRED') {
              setTrialExpired(true);
            }
          }
        })
        .catch(() => {
          // Agar API fail ho (jaise server down ya network issue), toh session clear mat karo,
          // Sirf state null karo taaki loading complete ho aur user redirect ho jaye.
          // Note: 401 status ko apiClient already handle kar leta hai (redirect).
          setUser(null);
          setBusiness(null);
        })
        .finally(() => setLoading(false));
    };

    initializeAuth();

    // Trial expired event listener (SuperAdmin / Billing se aata hai)
    const handleTrialExpiredEvent = () => setTrialExpired(true);
    window.addEventListener('dealdesk:trial_expired', handleTrialExpiredEvent);

    return () => {
      window.removeEventListener('dealdesk:trial_expired', handleTrialExpiredEvent);
    };
  }, []);

  const logout = () => {
    sessionStorage.removeItem('dealdesk_token');
    sessionStorage.removeItem('dealdesk_user');
    sessionStorage.removeItem('dealdesk_business');
    setUser(null);
    setBusiness(null);
    const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:5175/login';
    window.location.href = loginUrl;
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      business,
      setBusiness,
      loading,
      logout,
      isAdmin,
      isAgent,
      isSuperAdmin,
      trialExpired,
      setTrialExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
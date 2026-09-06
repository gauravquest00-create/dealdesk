import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { notificationApi } from '../services/api/services.js';
import { 
  FaSearch, 
  FaBell, 
  FaMoon, 
  FaSun, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaCog, 
  FaCreditCard, 
  FaGlobe, 
  FaMoneyBillWave,
  FaCheckDouble,
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa';
import './Header.css';

export const Header = () => {
  const { user, business, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage } = useLanguage();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ---- Mobile/Tab Detection (CSS nahi touch karna) ----
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Load Notifications
  const loadNotifications = () => {
    notificationApi.list()
      .then(res => {
        if (res.data) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      })
      .catch(err => console.warn('[Notifications] Could not fetch:', err.message));
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ---- Sync preferences from user object (initial load only) ----
  useEffect(() => {
    if (user) {
      if (user.preferredCurrency && user.preferredCurrency !== currency) {
        setCurrency(user.preferredCurrency);
      }
      if (user.preferredLanguage && user.preferredLanguage !== language) {
        setLanguage(user.preferredLanguage);
      }
    }
  }, [user]); // sirf tab chale jab user object change ho (login ke baad)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await notificationApi.markAsRead(id);
      loadNotifications();
      if (link) {
        setNotifOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value.trim();
    if (query) {
      navigate(`/app/search?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
    }
  };

  // ---- Currency/Language Change Handlers (bass context update, localStorage providers handle karenge) ----
  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <>
      <header className="dashboard-header">
        {/* Search Bar - Desktop */}
        <div className="header-search desktop-search">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search properties, leads, QR codes, deals..." 
            aria-label="Global search"
          />
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Search Toggle - Mobile */}
          <button 
            type="button"
            className="header-icon-btn mobile-search-toggle"
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search"
          >
            <FaSearch />
          </button>

          {/* Support Access Banner */}
          {business?.supportAccessActive && (
            <div className="support-mode-pill">
              <span>🛠️ SUPPORT ACCESS</span>
            </div>
          )}

          {/* Currency Selector - Desktop (CSS hide karega mobile par) */}
          <div className="header-select-pill" title="Workspace Currency">
            <FaMoneyBillWave className="select-pill-icon" />
            <select 
              value={currency} 
              onChange={handleCurrencyChange}
              aria-label="Select Currency"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="AED">AED</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="CAD">CAD (CA$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>

          {/* Language Selector - Desktop (CSS hide karega mobile par) */}
          <div className="header-select-pill" title="Interface Language">
            <FaGlobe className="select-pill-icon" />
            <select 
              value={language} 
              onChange={handleLanguageChange}
              aria-label="Select Language"
            >
              <option value="en">EN</option>
              <option value="ar">العربية</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="de">DE</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button 
            type="button"
            className="header-icon-btn" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          {/* Notification Bell */}
          <div className="header-notif-container" ref={notifRef}>
            <button 
              type="button"
              className="header-icon-btn notification-btn" 
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
              aria-expanded={notifOpen}
            >
              <FaBell />
              {unreadCount > 0 && <span className="badge-dot-num">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {notifOpen && (
              <div className="notif-dropdown-menu">
                <div className="notif-menu-header">
                  <div>
                    <h4>Notifications</h4>
                    <span className="unread-summary">{unreadCount} Unread</span>
                  </div>
                  {unreadCount > 0 && (
                    <button type="button" className="btn-mark-all" onClick={handleMarkAllRead}>
                      <FaCheckDouble /> Mark read
                    </button>
                  )}
                </div>

                <div className="notif-list-body">
                  {notifications.length === 0 ? (
                    <div className="notif-empty-box">
                      <FaInfoCircle />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n._id} 
                        className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                        onClick={() => handleMarkAsRead(n._id, n.link)}
                      >
                        <div className="notif-item-content">
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                          <span className="notif-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {!n.isRead && <span className="notif-unread-dot"></span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
              USER PROFILE DROPDOWN - Mobile/Tab mein Currency/Language yahan dikhenge
              ============================================================ */}
          <div className="profile-dropdown-container" ref={profileRef}>
            <button 
              type="button"
              className="profile-trigger" 
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
            >
              <div className="avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="profile-info-text">
                <span className="profile-name">{user?.name || 'User'}</span>
                <span className="profile-role">{user?.role}</span>
              </div>
            </button>

            {profileOpen && (
              <div className="profile-menu">
                {/* Menu Header */}
                <div className="menu-header">
                  <p className="menu-user-name">{user?.name}</p>
                  <p className="menu-user-email">{user?.email}</p>
                </div>

                <div className="menu-divider"></div>

                {/* ==========================================================
                    🆕 MOBILE/TAB: Currency + Language Selectors (CSS Touch Nahi)
                    ========================================================== */}
                {isMobile && (
                  <>
                    {/* Currency Selector */}
                    <div style={{ padding: '8px 10px 4px 10px', borderBottom: '1px solid var(--color-border-light, #f1f5f9)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <FaMoneyBillWave style={{ color: 'var(--color-text-muted, #64748b)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main, #0f172a)' }}>Currency</span>
                      </div>
                      <select 
                        value={currency} 
                        onChange={handleCurrencyChange}
                        style={{ 
                          width: '100%', padding: '6px 8px', borderRadius: '6px', 
                          border: '1px solid var(--color-border, #e2e8f0)', 
                          background: 'var(--color-surface, #ffffff)', 
                          color: 'var(--color-text-main, #0f172a)', 
                          fontSize: '0.8125rem', outline: 'none' 
                        }}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="AED">AED</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="CAD">CAD (CA$)</option>
                        <option value="AUD">AUD (A$)</option>
                      </select>
                    </div>

                    {/* Language Selector */}
                    <div style={{ padding: '8px 10px 12px 10px', borderBottom: '1px solid var(--color-border-light, #f1f5f9)', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <FaGlobe style={{ color: 'var(--color-text-muted, #64748b)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main, #0f172a)' }}>Language</span>
                      </div>
                      <select 
                        value={language} 
                        onChange={handleLanguageChange}
                        style={{ 
                          width: '100%', padding: '6px 8px', borderRadius: '6px', 
                          border: '1px solid var(--color-border, #e2e8f0)', 
                          background: 'var(--color-surface, #ffffff)', 
                          color: 'var(--color-text-main, #0f172a)', 
                          fontSize: '0.8125rem', outline: 'none' 
                        }}
                      >
                        <option value="en">EN</option>
                        <option value="ar">العربية</option>
                        <option value="fr">FR</option>
                        <option value="es">ES</option>
                        <option value="de">DE</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Regular Menu Items */}
                <Link to="/app/profile" className="menu-item" onClick={() => setProfileOpen(false)}>
                  <FaUserCircle /> <span>My Profile</span>
                </Link>

                {isAdmin && (
                  <>
                    <Link to="/app/settings" className="menu-item" onClick={() => setProfileOpen(false)}>
                      <FaCog /> <span>Settings</span>
                    </Link>
                    <Link to="/app/settings#billing" className="menu-item" onClick={() => setProfileOpen(false)}>
                      <FaCreditCard /> <span>Subscription & Billing</span>
                    </Link>
                  </>
                )}

                <div className="menu-divider"></div>

                <button type="button" className="menu-item logout-btn" onClick={logout}>
                  <FaSignOutAlt /> <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Search Modal - Mobile */}
      {searchOpen && (
        <div className="search-overlay" ref={searchRef}>
          <div className="search-overlay-content">
            <button 
              type="button" 
              className="search-close-btn" 
              onClick={() => setSearchOpen(false)}
            >
              <FaTimes />
            </button>
            <form onSubmit={handleSearchSubmit} className="search-overlay-form">
              <FaSearch className="search-overlay-icon" />
              <input 
                type="text" 
                name="search"
                placeholder="Search properties, leads, QR codes, deals..." 
                autoFocus
                aria-label="Search"
              />
              <button type="submit" className="search-overlay-submit">Search</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

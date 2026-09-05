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
  FaInfoCircle
} from 'react-icons/fa';
import './Header.css';

export const Header = () => {
  const { user, business, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { lang, setLang } = useLanguage();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
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
    const interval = setInterval(loadNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
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

  return (
    <header className="dashboard-header">
      {/* Search Bar */}
      <div className="header-search">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Search properties, leads, QR codes, deals..." 
          aria-label="Global search"
        />
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Support Access Banner if active */}
        {business?.supportAccessActive && (
          <div className="support-mode-pill">
            <span>🛠️ SUPPORT ACCESS MODE</span>
          </div>
        )}

        {/* Currency Selector */}
        <div className="header-select-pill" title="Workspace Currency">
          <FaMoneyBillWave className="select-pill-icon" />
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Select Currency"
          >
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="AED">AED (AED)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
            <option value="CAD">CAD (CA$)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
        </div>

        {/* Language Selector */}
        <div className="header-select-pill" title="Interface Language">
          <FaGlobe className="select-pill-icon" />
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
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

        {/* Notification Bell with Live Dropdown */}
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

        {/* User Profile Dropdown */}
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
              <div className="menu-header">
                <p className="menu-user-name">{user?.name}</p>
                <p className="menu-user-email">{user?.email}</p>
              </div>

              <div className="menu-divider"></div>

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
  );
};

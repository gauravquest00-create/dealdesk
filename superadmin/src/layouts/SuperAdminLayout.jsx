import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  FaShieldAlt,
  FaChartLine,
  FaBuilding,
  FaCreditCard,
  FaReceipt,
  FaTags,
  FaHistory,
  FaUserShield,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaBell,
  FaUserCircle,
  FaSearch,
  FaCog,
  FaCheckCircle,
  FaClock,
  FaTimes
} from 'react-icons/fa';
import './SuperAdminLayout.css';

export const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [supportMode, setSupportMode] = useState(
    JSON.parse(sessionStorage.getItem('dealdesk_support_session') || 'null')
  );
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New business "Palm Residency" registered', time: '2 min ago', read: false },
    { id: 2, message: 'Payment of $129 received from "Luxury Homes"', time: '1 hour ago', read: false },
    { id: 3, message: 'Subscription expired for "Green Valley Realty"', time: '3 hours ago', read: true },
    { id: 4, message: 'Support access session ended for "ABC Agency"', time: '5 hours ago', read: true },
  ]);
  const notificationRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('dealdesk_superadmin_token');
    if (!token) {
      navigate('/admin/login');
    }
    const userData = localStorage.getItem('dealdesk_superadmin_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
    // Click outside to close notification dropdown
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('dealdesk_superadmin_token');
    localStorage.removeItem('dealdesk_superadmin_user');
    sessionStorage.removeItem('dealdesk_support_session');
    navigate('/admin/login');
  };

  const handleExitSupport = () => {
    sessionStorage.removeItem('dealdesk_support_session');
    setSupportMode(null);
  };

  const handleNotificationClick = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Optionally navigate or perform action
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`sa-shell ${collapsed ? 'sa-collapsed' : ''}`}>
      {/* Support Access Mode Banner */}
      {supportMode && (
        <div className="sa-support-banner">
          <div className="sa-support-banner-text">
            <FaExclamationTriangle className="sa-support-icon" />
            <span>
              <strong>SUPPORT ACCESS MODE:</strong> Connected to {supportMode.businessName} (Reason: {supportMode.reason})
            </span>
          </div>
          <button className="sa-support-exit-btn" onClick={handleExitSupport}>
            Exit Support Mode
          </button>
        </div>
      )}

      <div className="sa-body">
        {/* Sidebar */}
        <aside className={`sa-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
          <div className="sa-sidebar-brand">
            <DealDeskLogo 
              size="md" 
              collapsed={collapsed} 
              theme="dark" 
              subtext={collapsed ? '' : 'SUPERADMIN'}
            />
            {!collapsed && (
              <button 
                className="sa-sidebar-collapse-btn"
                onClick={() => setCollapsed(true)}
                title="Collapse Sidebar"
              >
                <FaAngleDoubleLeft />
              </button>
            )}
            {collapsed && (
              <button 
                className="sa-sidebar-expand-btn"
                onClick={() => setCollapsed(false)}
                title="Expand Sidebar"
              >
                <FaAngleDoubleRight />
              </button>
            )}
          </div>

          <nav className="sa-nav">
            {!collapsed && <div className="sa-nav-section-label">OVERVIEW</div>}
            <NavLink to="/admin" end className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}>
              <FaChartLine className="sa-nav-icon" />
              {!collapsed && <span className="sa-nav-label">Dashboard</span>}
            </NavLink>

            {!collapsed && <div className="sa-nav-section-label">CUSTOMERS</div>}
            <NavLink to="/admin/businesses" className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}>
              <FaBuilding className="sa-nav-icon" />
              {!collapsed && <span className="sa-nav-label">Businesses</span>}
            </NavLink>

            {!collapsed && <div className="sa-nav-section-label">BILLING</div>}
            <NavLink to="/admin/plans" className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}>
              <FaTags className="sa-nav-icon" />
              {!collapsed && <span className="sa-nav-label">Plan Management</span>}
            </NavLink>
            <NavLink to="/admin/subscriptions" className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}>
              <FaCreditCard className="sa-nav-icon" />
              {!collapsed && <span className="sa-nav-label">Subscriptions</span>}
            </NavLink>
            <NavLink to="/admin/payments" className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}>
              <FaReceipt className="sa-nav-icon" />
              {!collapsed && <span className="sa-nav-label">Payments Ledger</span>}
            </NavLink>

            {!collapsed && <div className="sa-nav-section-label">SECURITY</div>}
            <NavLink to="/admin/audit-logs" className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}>
              <FaHistory className="sa-nav-icon" />
              {!collapsed && <span className="sa-nav-label">Audit Logs</span>}
            </NavLink>

            {!collapsed && <div className="sa-nav-section-label">ADMIN</div>}
            <NavLink to="/admin/profile" className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}>
              <FaUserShield className="sa-nav-icon" />
              {!collapsed && <span className="sa-nav-label">Profile</span>}
            </NavLink>
          </nav>

          <div className="sa-sidebar-footer">
            <button className="sa-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt className="sa-nav-icon" />
              {!collapsed && <span className="sa-nav-label">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Wrapper */}
        <div className={`sa-main-wrapper ${collapsed ? 'sa-main-expanded' : ''}`}>
          {/* Header */}
          <header className="sa-header">
            <div className="sa-header-left">
              <button 
                className="sa-header-toggle"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {collapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
              </button>
              <div className="sa-header-search">
                <FaSearch className="sa-search-icon" />
                <input type="text" placeholder="Search businesses, plans, payments..." />
              </div>
            </div>
            <div className="sa-header-right">
              {/* Notifications */}
              <div className="sa-notification-wrapper" ref={notificationRef}>
                <button 
                  className="sa-header-btn sa-notification-btn" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Notifications"
                >
                  <FaBell />
                  {unreadCount > 0 && <span className="sa-notification-dot">{unreadCount}</span>}
                </button>
                {showNotifications && (
                  <div className="sa-notification-dropdown">
                    <div className="sa-notification-header">
                      <span className="sa-notification-title">Notifications</span>
                      <button className="sa-notification-mark-all" onClick={markAllRead}>Mark all read</button>
                    </div>
                    <div className="sa-notification-list">
                      {notifications.length === 0 ? (
                        <div className="sa-notification-empty">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`sa-notification-item ${n.read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(n.id)}
                          >
                            <div className="sa-notification-message">{n.message}</div>
                            <div className="sa-notification-time">{n.time}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <Link to="/admin/settings" className="sa-header-btn" title="Settings">
                <FaCog />
              </Link>

              {/* Profile */}
              <Link to="/admin/profile" className="sa-header-user">
                <FaUserCircle className="sa-user-icon" />
                <div className="sa-user-info">
                  <span className="sa-user-name">{user?.name || 'SuperAdmin'}</span>
                  <span className="sa-user-role">Platform Administrator</span>
                </div>
              </Link>
            </div>
          </header>

          {/* Content */}
          <main className="sa-content-area">
            <Outlet context={{ supportMode, setSupportMode }} />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="sa-mobile-nav">
        <NavLink to="/admin" end className={({ isActive }) => `sa-mobile-tab ${isActive ? 'active' : ''}`}>
          <FaChartLine />
          <span>Home</span>
        </NavLink>
        <NavLink to="/admin/businesses" className={({ isActive }) => `sa-mobile-tab ${isActive ? 'active' : ''}`}>
          <FaBuilding />
          <span>Clients</span>
        </NavLink>
        <NavLink to="/admin/plans" className={({ isActive }) => `sa-mobile-tab ${isActive ? 'active' : ''}`}>
          <FaTags />
          <span>Plans</span>
        </NavLink>
        <NavLink to="/admin/subscriptions" className={({ isActive }) => `sa-mobile-tab ${isActive ? 'active' : ''}`}>
          <FaCreditCard />
          <span>Billing</span>
        </NavLink>
        <NavLink to="/admin/profile" className={({ isActive }) => `sa-mobile-tab ${isActive ? 'active' : ''}`}>
          <FaUserShield />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};
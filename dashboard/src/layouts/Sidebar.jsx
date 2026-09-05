import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import {
  FaChartPie,
  FaBuilding,
  FaUserFriends,
  FaBolt,
  FaCalendarAlt,
  FaDoorOpen,
  FaQrcode,
  FaFolder,
  FaCommentDots,
  FaHandshake,
  FaUsersCog,
  FaUserCircle,
  FaCog,
  FaLink,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa';
import './Sidebar.css';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, business, isAdmin } = useAuth();

  const subRole = user?.subRole || '';
  const isPropertyAgent = !isAdmin && (subRole === 'PROPERTY_AGENT' || subRole === 'PROPERTY_LEAD_AGENT' || !subRole);
  const isLeadAgent = !isAdmin && (subRole === 'LEAD_AGENT' || subRole === 'PROPERTY_LEAD_AGENT' || !subRole);

  return (
    <aside className={`dashboard-sidebar-fixed ${collapsed ? 'is-collapsed' : ''}`}>
      {/* Top Bar */}
      <div className="sidebar-top-bar">
        <div className="sidebar-brand-box">
          {!collapsed ? (
            <DealDeskLogo 
              size="md" 
              collapsed={collapsed} 
              theme="dark" 
              subtext={business?.name ? business.name.toUpperCase().slice(0, 16) : 'WORKSPACE'} 
            />
          ) : (
            <button 
              type="button"
              className="sidebar-expand-btn"
              onClick={() => setCollapsed(false)}
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <FaAngleDoubleRight />
            </button>
          )}
        </div>
        {!collapsed && (
          <button 
            type="button"
            className="sidebar-collapse-btn-top"
            onClick={() => setCollapsed(true)}
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <FaAngleDoubleLeft />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav-container">
        {isAdmin ? (
          <>
            {!collapsed && <div className="nav-section-label">OVERVIEW</div>}
            <NavLink to="/app" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Dashboard">
              <FaChartPie className="link-icon" />
              {!collapsed && <span className="link-label">Dashboard</span>}
            </NavLink>

            {!collapsed && <div className="nav-section-label">WORKSPACE</div>}
            <NavLink to="/app/properties" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Properties">
              <FaBuilding className="link-icon" />
              {!collapsed && <span className="link-label">Properties</span>}
            </NavLink>

            <NavLink to="/app/leads" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Smart Leads">
              <FaUserFriends className="link-icon" />
              {!collapsed && <span className="link-label">Smart Leads</span>}
            </NavLink>

            <NavLink to="/app/matches" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Smart Match">
              <FaBolt className="link-icon" />
              {!collapsed && <span className="link-label">Smart Match</span>}
            </NavLink>

            <NavLink to="/app/viewings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Viewings">
              <FaCalendarAlt className="link-icon" />
              {!collapsed && <span className="link-label">Viewings</span>}
            </NavLink>

            <NavLink to="/app/open-houses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Open House">
              <FaDoorOpen className="link-icon" />
              {!collapsed && <span className="link-label">Open House</span>}
            </NavLink>

            <NavLink to="/app/qr" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Smart QR">
              <FaQrcode className="link-icon" />
              {!collapsed && <span className="link-label">Smart QR</span>}
            </NavLink>
<NavLink to="/app/social-links" className="sidebar-link">
  <FaLink className="link-icon" />
  {!collapsed && <span className="link-label">Social Links</span>}
</NavLink>
            <NavLink to="/app/documents" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Documents">
              <FaFolder className="link-icon" />
              {!collapsed && <span className="link-label">Documents</span>}
            </NavLink>

            <NavLink to="/app/communications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Communications">
              <FaCommentDots className="link-icon" />
              {!collapsed && <span className="link-label">Communications</span>}
            </NavLink>

            <NavLink to="/app/deals" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Deals Pipeline">
              <FaHandshake className="link-icon" />
              {!collapsed && <span className="link-label">Deals Pipeline</span>}
            </NavLink>

            {!collapsed && <div className="nav-section-label">MANAGEMENT</div>}
            <NavLink to="/app/team" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Team & Agents">
              <FaUsersCog className="link-icon" />
              {!collapsed && <span className="link-label">Team & Agents</span>}
            </NavLink>
          </>
        ) : (
          <>
            {!collapsed && <div className="nav-section-label">MY WORK</div>}
            <NavLink to="/app" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="My Dashboard">
              <FaChartPie className="link-icon" />
              {!collapsed && <span className="link-label">Dashboard</span>}
            </NavLink>

            {isPropertyAgent && (
              <>
                <NavLink to="/app/properties" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="My Properties">
                  <FaBuilding className="link-icon" />
                  {!collapsed && <span className="link-label">My Properties</span>}
                </NavLink>

                <NavLink to="/app/qr" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Smart QR">
                  <FaQrcode className="link-icon" />
                  {!collapsed && <span className="link-label">Smart QR Fleet</span>}
                </NavLink>

                <NavLink to="/app/open-houses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Open Houses">
                  <FaDoorOpen className="link-icon" />
                  {!collapsed && <span className="link-label">Open Houses</span>}
                </NavLink>

                <NavLink to="/app/documents" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Documents">
                  <FaFolder className="link-icon" />
                  {!collapsed && <span className="link-label">Documents</span>}
                </NavLink>
              </>
            )}

            {isLeadAgent && (
              <>
                <NavLink to="/app/leads" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="My Leads">
                  <FaUserFriends className="link-icon" />
                  {!collapsed && <span className="link-label">My Leads</span>}
                </NavLink>

                <NavLink to="/app/matches" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Smart Match">
                  <FaBolt className="link-icon" />
                  {!collapsed && <span className="link-label">Smart Matches</span>}
                </NavLink>

                <NavLink to="/app/viewings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="My Viewings">
                  <FaCalendarAlt className="link-icon" />
                  {!collapsed && <span className="link-label">Viewings</span>}
                </NavLink>

                <NavLink to="/app/communications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Communications">
                  <FaCommentDots className="link-icon" />
                  {!collapsed && <span className="link-label">Communications</span>}
                </NavLink>

                <NavLink to="/app/deals" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="My Deals">
                  <FaHandshake className="link-icon" />
                  {!collapsed && <span className="link-label">My Deals</span>}
                </NavLink>
              </>
            )}
          </>
        )}

        {!collapsed && <div className="nav-section-label">PREFERENCES</div>}
        <NavLink to="/app/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Profile">
          <FaUserCircle className="link-icon" />
          {!collapsed && <span className="link-label">Profile</span>}
        </NavLink>

        {isAdmin && (
          <NavLink to="/app/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Settings">
            <FaCog className="link-icon" />
            {!collapsed && <span className="link-label">Settings</span>}
          </NavLink>
        )}
      </nav>
    </aside>
  );
};
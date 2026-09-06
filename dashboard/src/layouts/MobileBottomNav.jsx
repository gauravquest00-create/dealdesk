import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  FaChartPie, 
  FaBuilding, 
  FaUserFriends, 
  FaBolt, 
  FaCalendarAlt, 
  FaPlus, 
  FaEllipsisH,
  FaDoorOpen,
  FaQrcode,
  FaFolder,
  FaCommentDots,
  FaHandshake,
  FaUsersCog,
  FaCog,
  FaLink,
  FaTimes
} from 'react-icons/fa';
import './MobileBottomNav.css';

export const MobileBottomNav = () => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const subRole = user?.subRole || '';
  const isPropertyAgent = !isAdmin && (subRole === 'PROPERTY_AGENT' || subRole === 'PROPERTY_LEAD_AGENT' || !subRole);
  const isLeadAgent = !isAdmin && (subRole === 'LEAD_AGENT' || subRole === 'PROPERTY_LEAD_AGENT' || !subRole);

  const handleNav = (path) => {
    setShowQuickAdd(false);
    setShowMoreDrawer(false);
    navigate(path);
  };

  return (
    <>
      <nav className="mobile-bottom-nav">
        <NavLink to="/app" end className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`} title="Home">
          <FaChartPie className="mob-icon" />
          <span>Home</span>
        </NavLink>

        {isAdmin || isPropertyAgent ? (
          <NavLink to="/app/properties" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`} title="Inventory">
            <FaBuilding className="mob-icon" />
            <span>Inventory</span>
          </NavLink>
        ) : null}

        {isAdmin || isLeadAgent ? (
          <NavLink to="/app/leads" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`} title="Leads">
            <FaUserFriends className="mob-icon" />
            <span>Leads</span>
          </NavLink>
        ) : null}

        <button 
          type="button" 
          className="mobile-quick-add-btn" 
          onClick={() => setShowQuickAdd(true)}
          title="Quick Action"
          aria-label="Quick Add"
        >
          <FaPlus />
        </button>

        {isAdmin || isLeadAgent ? (
          <NavLink to="/app/matches" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`} title="Match">
            <FaBolt className="mob-icon" />
            <span>Match</span>
          </NavLink>
        ) : null}

        {isAdmin || isLeadAgent ? (
          <NavLink to="/app/viewings" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`} title="Visits">
            <FaCalendarAlt className="mob-icon" />
            <span>Visits</span>
          </NavLink>
        ) : null}

        <button 
          type="button" 
          className={`mobile-tab ${showMoreDrawer ? 'active' : ''}`} 
          onClick={() => setShowMoreDrawer(true)}
          title="More Modules"
        >
          <FaEllipsisH className="mob-icon" />
          <span>More</span>
        </button>
      </nav>

      {showQuickAdd && (
        <div className="mob-sheet-overlay" onClick={() => setShowQuickAdd(false)}>
          <div className="mob-sheet-card" onClick={e => e.stopPropagation()}>
            <div className="mob-sheet-header">
              <h4>Quick Action</h4>
              <button type="button" className="btn-close-sheet" onClick={() => setShowQuickAdd(false)}><FaTimes /></button>
            </div>
            <div className="mob-sheet-actions-grid">
              {(isAdmin || isPropertyAgent) && (
                <button type="button" className="mob-sheet-action" onClick={() => handleNav('/app/properties')}>
                  <FaBuilding className="action-ic blue" />
                  <span>Add Property</span>
                </button>
              )}
              {(isAdmin || isLeadAgent) && (
                <button type="button" className="mob-sheet-action" onClick={() => handleNav('/app/leads')}>
                  <FaUserFriends className="action-ic green" />
                  <span>Capture Lead</span>
                </button>
              )}
              {(isAdmin || isLeadAgent) && (
                <button type="button" className="mob-sheet-action" onClick={() => handleNav('/app/viewings')}>
                  <FaCalendarAlt className="action-ic purple" />
                  <span>Schedule Viewing</span>
                </button>
              )}
              {(isAdmin || isLeadAgent) && (
                <button type="button" className="mob-sheet-action" onClick={() => handleNav('/app/deals')}>
                  <FaHandshake className="action-ic amber" />
                  <span>Record Deal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showMoreDrawer && (
        <div className="mob-sheet-overlay" onClick={() => setShowMoreDrawer(false)}>
          <div className="mob-sheet-card" onClick={e => e.stopPropagation()}>
            <div className="mob-sheet-header">
              <h4>More Modules</h4>
              <button type="button" className="btn-close-sheet" onClick={() => setShowMoreDrawer(false)}><FaTimes /></button>
            </div>
            <div className="mob-drawer-links">
              {(isAdmin || isPropertyAgent) && (
                <button type="button" className="mob-drawer-link" onClick={() => handleNav('/app/open-houses')}>
                  <FaDoorOpen /> <span>Open House Events</span>
                </button>
              )}
              {(isAdmin || isPropertyAgent) && (
                <button type="button" className="mob-drawer-link" onClick={() => handleNav('/app/qr')}>
                  <FaQrcode /> <span>Smart QR Codes</span>
                </button>
              )}
                {(isAdmin || isPropertyAgent || isLeadAgent) && (
                <button type="button" className="mob-drawer-link" onClick={() => handleNav('/app/social-links')}>
                  <FaLink /> <span>Social Link</span>
                </button>
              )}
              {(isAdmin || isPropertyAgent) && (
                <button type="button" className="mob-drawer-link" onClick={() => handleNav('/app/documents')}>
                  <FaFolder /> <span>Documents & Checklist</span>
                </button>
              )}
              {(isAdmin || isLeadAgent) && (
                <button type="button" className="mob-drawer-link" onClick={() => handleNav('/app/communications')}>
                  <FaCommentDots /> <span>Communications & Campaigns</span>
                </button>
              )}
              {(isAdmin || isLeadAgent) && (
                <button type="button" className="mob-drawer-link" onClick={() => handleNav('/app/deals')}>
                  <FaHandshake /> <span>Deals Pipeline</span>
                </button>
              )}
              {isAdmin && (
                <button type="button" className="mob-drawer-link" onClick={() => handleNav('/app/team')}>
                  <FaUsersCog /> <span>Team & Agents</span>
                </button>
              )}
              {isAdmin && (
                <button type="button" className="mob-drawer-link" onClick={() => handleNav('/app/settings')}>
                  <FaCog /> <span>Settings & Billing</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

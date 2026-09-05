import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { 
  FaUserCircle, 
  FaBuilding, 
  FaLock, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaCalendarAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaUserTag,
  FaGlobe,
  FaClock,
  FaKey,
  FaIdBadge
} from 'react-icons/fa';
import './ProfilePage.css';

export const ProfilePage = () => {
  const { user, business, isAdmin } = useAuth();
  const { addToast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      return addToast('New password must be at least 8 characters', 'error');
    }
    if (newPassword !== confirmPassword) {
      return addToast('New password and confirmation do not match', 'error');
    }

    setLoading(true);
    try {
      await authApi.changePassword(newPassword);
      addToast('Security password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSubRoleLabel = (subRole) => {
    if (subRole === 'PROPERTY_AGENT') return 'Property Agent';
    if (subRole === 'LEAD_AGENT') return 'Lead Agent';
    if (subRole === 'PROPERTY_LEAD_AGENT') return 'Dual Agent';
    return 'Agent';
  };

  return (
    <div className="prof-page">
      {/* Header */}
      <div className="prof-header">
        <div>
          <h1>User & Security Profile</h1>
          <p className="prof-subtitle">Manage your personal credentials, workspace security, and identity.</p>
        </div>
      </div>

      <div className="prof-grid">
        {/* Personal Details Card */}
        <div className="prof-card">
          <div className="prof-card-header">
            <FaUserCircle className="prof-card-icon" />
            <h3>Personal Identity</h3>
          </div>
          <div className="prof-details">
            <div className="prof-detail-item">
              <span className="prof-detail-label">Full Name</span>
              <strong>{user?.name || 'User'}</strong>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">Email Address</span>
              <strong>{user?.email || 'email@domain.com'}</strong>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">Username</span>
              <code className="prof-code">{user?.username || 'username'}</code>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">Role</span>
              <span className="prof-role-badge">{getSubRoleLabel(user?.subRole)}</span>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">Department</span>
              <strong>{user?.department || 'Sales'}</strong>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">Account Status</span>
              <span className="prof-status prof-status-active"><FaCheckCircle /> Active & Verified</span>
            </div>
          </div>
        </div>

        {/* Business Workspace Details */}
        <div className="prof-card">
          <div className="prof-card-header">
            <FaBuilding className="prof-card-icon" />
            <h3>Brokerage Workspace</h3>
          </div>
          <div className="prof-details">
            <div className="prof-detail-item">
              <span className="prof-detail-label">Company Name</span>
              <strong>{business?.name || 'DealDesk Workspace'}</strong>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">City / Market</span>
              <strong>{business?.city || 'Gurugram'}, {business?.country || 'India'}</strong>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">Base Currency</span>
              <strong>{business?.currency || 'USD'}</strong>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">System Timezone</span>
              <strong>{business?.timezone || 'Asia/Kolkata'}</strong>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">Subscription Plan</span>
              <strong className="prof-plan">{business?.planId?.toUpperCase() || 'STARTER'}</strong>
            </div>
            <div className="prof-detail-item">
              <span className="prof-detail-label">Data Isolation</span>
              <span className="prof-status prof-status-active"><FaShieldAlt /> Tenant Isolated</span>
            </div>
          </div>
        </div>

        {/* Security Password Change - Full Width */}
        <div className="prof-card prof-card-full">
          <div className="prof-card-header">
            <FaLock className="prof-card-icon" />
            <h3>Change Password</h3>
          </div>
          <form onSubmit={handlePasswordChange} className="prof-password-form">
            <div className="prof-form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="prof-form-group">
              <label>New Password (min 8 characters) *</label>
              <input 
                type="password" 
                required 
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="prof-form-group">
              <label>Confirm New Password *</label>
              <input 
                type="password" 
                required 
                minLength={8}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="prof-btn-primary">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
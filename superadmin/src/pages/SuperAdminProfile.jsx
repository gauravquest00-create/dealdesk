import React, { useState, useEffect } from 'react';
import { superadminApi } from '../services/api/superadminApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { 
  FaUserShield, 
  FaLock, 
  FaCheckCircle, 
  FaEnvelope, 
  FaUser, 
  FaClock, 
  FaGlobe, 
  FaKey, 
  FaMobileAlt, 
  FaShieldAlt, 
  FaHistory, 
  FaSignOutAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaServer,
  FaDatabase,
  FaBell
} from 'react-icons/fa';
import './SuperAdminProfile.css';

export const SuperAdminProfile = () => {
  const { addToast } = useToast();

  // Profile data (simulated — will be fetched from API)
  const [profile, setProfile] = useState({
    name: 'Super Admin',
    email: 'admin@dealdesk.com',
    role: 'SUPERADMIN',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timezone: 'Asia/Kolkata',
    twoFactorEnabled: false,
    sessions: [
      { id: 1, device: 'Chrome on Windows', ip: '192.168.1.1', lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString(), current: true },
      { id: 2, device: 'Safari on iPhone', ip: '192.168.1.2', lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), current: false },
    ],
    recentActivities: [
      { action: 'Logged in', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
      { action: 'Viewed audit logs', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { action: 'Updated business plan', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { action: 'Created new business', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    ],
  });

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(profile.twoFactorEnabled);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'sessions'

  // Load profile data (mocked)
  useEffect(() => {
    // In production, call superadminApi.getProfile() and set data
    // For now, we use mock data above.
  }, []);

  const handleSaveProfile = async () => {
    if (!editData.name || !editData.email) {
      addToast('Name and email are required', 'error');
      return;
    }
    setLoading(true);
    try {
      // API call: await superadminApi.updateProfile(editData)
      setTimeout(() => {
        setProfile({ ...profile, name: editData.name, email: editData.email });
        setEditing(false);
        addToast('Profile updated successfully', 'success');
        setLoading(false);
      }, 600);
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      // API call: await superadminApi.changePassword({ newPassword })
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        addToast('Password updated successfully', 'success');
        setPasswordSaving(false);
      }, 600);
    } catch (err) {
      addToast(err.message || 'Failed to update password', 'error');
      setPasswordSaving(false);
    }
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    addToast(twoFactorEnabled ? '2FA disabled' : '2FA enabled (simulated)', 'info');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="sa-prof-page">
      {/* Header */}
      <div className="sa-prof-header">
        <div>
          <h1>SuperAdmin Security Profile</h1>
          <p className="sa-prof-subtitle">Manage your master account credentials, security settings, and active sessions.</p>
        </div>
        <div className="sa-prof-header-actions">
          <span className="sa-prof-role-badge">
            <FaShieldAlt /> SuperAdmin
          </span>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="sa-prof-overview">
        <div className="sa-prof-avatar">
          <span className="sa-prof-avatar-text">{getInitials(profile.name)}</span>
        </div>
        <div className="sa-prof-overview-info">
          <h2>{profile.name}</h2>
          <div className="sa-prof-overview-meta">
            <span><FaEnvelope /> {profile.email}</span>
            <span><FaClock /> Last login: {formatDate(profile.lastLogin)}</span>
            <span><FaGlobe /> {profile.timezone}</span>
          </div>
        </div>
        <button 
          className="sa-prof-btn sa-prof-btn-primary"
          onClick={() => {
            setEditing(true);
            setEditData({ name: profile.name, email: profile.email });
          }}
        >
          <FaEdit /> Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="sa-prof-tabs">
        <button 
          className={`sa-prof-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Profile
        </button>
        <button 
          className={`sa-prof-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <FaLock /> Security
        </button>
        <button 
          className={`sa-prof-tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <FaServer /> Sessions ({profile.sessions.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="sa-prof-tab-content">
        {/* ===== PROFILE TAB ===== */}
        {activeTab === 'profile' && (
          <div className="sa-prof-panel">
            <div className="sa-prof-card">
              <div className="sa-prof-card-header">
                <FaUser className="sa-prof-card-icon" />
                <h3>Personal Information</h3>
              </div>
              {editing ? (
                <div className="sa-prof-edit-form">
                  <div className="sa-prof-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="sa-prof-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="sa-prof-form-actions">
                    <button 
                      className="sa-prof-btn sa-prof-btn-secondary"
                      onClick={() => setEditing(false)}
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button 
                      className="sa-prof-btn sa-prof-btn-primary"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? <span className="sa-prof-spinner"></span> : <><FaSave /> Save</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sa-prof-detail-list">
                  <div><span>Full Name:</span> <strong>{profile.name}</strong></div>
                  <div><span>Email:</span> <strong>{profile.email}</strong></div>
                  <div><span>Role:</span> <strong>Platform SuperAdmin</strong></div>
                  <div><span>Timezone:</span> <strong>{profile.timezone}</strong></div>
                  <div><span>Last Login:</span> <strong>{formatDate(profile.lastLogin)}</strong></div>
                </div>
              )}
            </div>

            <div className="sa-prof-card">
              <div className="sa-prof-card-header">
                <FaHistory className="sa-prof-card-icon" />
                <h3>Recent Activity</h3>
              </div>
              <div className="sa-prof-activity-list">
                {profile.recentActivities.length === 0 ? (
                  <p className="sa-prof-empty-text">No recent activity</p>
                ) : (
                  profile.recentActivities.map((act, idx) => (
                    <div key={idx} className="sa-prof-activity-item">
                      <span className="sa-prof-activity-action">{act.action}</span>
                      <span className="sa-prof-activity-time">{formatDate(act.timestamp)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== SECURITY TAB ===== */}
        {activeTab === 'security' && (
          <div className="sa-prof-panel">
            <div className="sa-prof-card">
              <div className="sa-prof-card-header">
                <FaLock className="sa-prof-card-icon" />
                <h3>Change Password</h3>
              </div>
              <form onSubmit={handlePasswordChange} className="sa-prof-password-form">
                <div className="sa-prof-form-group">
                  <label>New Password (min 8 characters)</label>
                  <div className="sa-prof-password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="sa-prof-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="sa-prof-form-group">
                  <label>Confirm New Password</label>
                  <div className="sa-prof-password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
                <button type="submit" className="sa-prof-btn sa-prof-btn-primary" disabled={passwordSaving}>
                  {passwordSaving ? <span className="sa-prof-spinner"></span> : <><FaKey /> Update Password</>}
                </button>
              </form>
            </div>

            <div className="sa-prof-card">
              <div className="sa-prof-card-header">
                <FaMobileAlt className="sa-prof-card-icon" />
                <h3>Two-Factor Authentication</h3>
              </div>
              <div className="sa-prof-2fa-section">
                <div className="sa-prof-2fa-info">
                  <p>
                    {twoFactorEnabled 
                      ? 'Two-factor authentication is currently <strong>enabled</strong>. Your account is extra secure.' 
                      : 'Two-factor authentication is <strong>disabled</strong>. Enable it for additional security.'}
                  </p>
                  <div className="sa-prof-2fa-status">
                    <span className={`sa-prof-2fa-badge ${twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                      {twoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                  </div>
                </div>
                <button 
                  className={`sa-prof-btn ${twoFactorEnabled ? 'sa-prof-btn-secondary' : 'sa-prof-btn-primary'}`}
                  onClick={toggleTwoFactor}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>

            <div className="sa-prof-card">
              <div className="sa-prof-card-header">
                <FaBell className="sa-prof-card-icon" />
                <h3>Security Alerts</h3>
              </div>
              <p className="sa-prof-text-muted">You will receive email notifications for suspicious login attempts and critical changes.</p>
              <div className="sa-prof-alert-preferences">
                <label>
                  <input type="checkbox" defaultChecked /> Login from new device
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Password changes
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Suspicious activity
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ===== SESSIONS TAB ===== */}
        {activeTab === 'sessions' && (
          <div className="sa-prof-panel">
            <div className="sa-prof-card">
              <div className="sa-prof-card-header">
                <FaServer className="sa-prof-card-icon" />
                <h3>Active Sessions</h3>
              </div>
              <p className="sa-prof-text-muted">Manage all active sessions across devices. Revoke any session you don't recognize.</p>
              <div className="sa-prof-session-list">
                {profile.sessions.map((session) => (
                  <div key={session.id} className="sa-prof-session-item">
                    <div className="sa-prof-session-info">
                      <div className="sa-prof-session-device">{session.device}</div>
                      <div className="sa-prof-session-meta">
                        <span>IP: {session.ip}</span>
                        <span>Last active: {formatDate(session.lastActive)}</span>
                      </div>
                    </div>
                    <div className="sa-prof-session-actions">
                      {session.current ? (
                        <span className="sa-prof-session-current-badge">Current Session</span>
                      ) : (
                        <button className="sa-prof-btn sa-prof-btn-danger sa-prof-btn-sm">
                          <FaTrash /> Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="sa-prof-btn sa-prof-btn-secondary sa-prof-btn-sm">
                <FaSignOutAlt /> Revoke All Other Sessions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
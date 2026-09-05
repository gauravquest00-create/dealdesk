import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamApi, billingApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { UpgradePlanModal } from '../components/UpgradePlanModal.jsx';
import { 
  FaUsersCog, 
  FaPlus, 
  FaCopy, 
  FaWhatsapp, 
  FaEye, 
  FaTimes, 
  FaUserShield,
  FaKey,
  FaUserCheck,
  FaBan,
  FaEnvelope,
  FaPhoneAlt,
  FaBuilding,
  FaUserCircle,
  FaArrowRight,
  FaLock,
  FaShieldAlt
} from 'react-icons/fa';
import './TeamPage.css';

export const TeamPage = () => {
  const { addToast } = useToast();
  const { user, business } = useAuth();

  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [agentLimitReached, setAgentLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subRole: 'PROPERTY_LEAD_AGENT',
    department: 'Sales',
  });

  const loadTeam = () => {
    setLoading(true);
    teamApi.list()
      .then(res => setTeam(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeam();
    checkAgentLimit();
  }, []);

  const checkAgentLimit = async () => {
    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.agents;
      if (usage) {
        setAgentLimitReached(usage.exceeded || false);
        setLimitInfo(usage);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    
    try {
      const statusRes = await billingApi.getStatus();
      const usage = statusRes.data?.usage?.agents;
      if (usage && usage.exceeded) {
        setAgentLimitReached(true);
        setLimitInfo(usage);
        setShowUpgradeModal(true);
        return;
      }
    } catch (error) {
      // Proceed anyway
    }

    try {
      const res = await teamApi.addAgent(formData);
      setGeneratedCredentials(res.data.credentials);
      addToast('Agent created with auto-generated secure credentials!');
      loadTeam();
      checkAgentLimit();
      setFormData({ name: '', email: '', phone: '', subRole: 'PROPERTY_LEAD_AGENT', department: 'Sales' });
    } catch (err) {
      if (err?.data?.suggestion) {
        setAgentLimitReached(true);
        setLimitInfo(err.data);
        setShowUpgradeModal(true);
        addToast(err.message || 'Agent limit reached', 'error');
      } else {
        addToast(err.message || 'Error adding agent', 'error');
      }
    }
  };

  const handleUpgradeSuccess = async () => {
    await checkAgentLimit();
    addToast('✅ Plan upgraded! You can now add more agents.');
  };

  const handleToggleStatus = async (agent, e) => {
    if (e) e.stopPropagation();
    const actionName = agent.isActive ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${actionName} access for ${agent.name}?`)) return;

    try {
      await teamApi.toggleStatus(agent._id);
      addToast(`Agent ${actionName}d successfully`);
      loadTeam();
      if (selectedAgentDetail && selectedAgentDetail._id === agent._id) {
        setSelectedAgentDetail({ ...selectedAgentDetail, isActive: !agent.isActive });
      }
    } catch (err) {
      addToast(err.message || 'Error toggling agent status', 'error');
    }
  };

  const handleResetPassword = async (agentId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Reset this agent password and generate a new temporary password?')) return;

    try {
      const res = await teamApi.resetPassword(agentId);
      setGeneratedCredentials(res.data.credentials);
      setShowAddModal(true);
      addToast('Password reset generated!');
    } catch (err) {
      addToast(err.message || 'Error resetting password', 'error');
    }
  };

  const copyCreds = () => {
    if (!generatedCredentials) return;
    const text = `DealDesk Agent Credentials:\nUsername: ${generatedCredentials.username}\nTemporary Password: ${generatedCredentials.temporaryPassword}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    addToast('Credentials copied to clipboard');
  };

  const getSubRoleLabel = (subRole) => {
    if (subRole === 'PROPERTY_AGENT') return 'Property Agent';
    if (subRole === 'LEAD_AGENT') return 'Lead Agent';
    return 'Dual Agent';
  };

  const agentCount = team.length;
  const agentLimit = limitInfo?.limit || (agentLimitReached ? 3 : 999);

  return (
    <div className="tm-page">
      {/* Header */}
      <div className="tm-header">
        <div>
          <h1>Team Management</h1>
          <p className="tm-subtitle">Manage real estate agents, role-based module assignments, and credentials.</p>
        </div>
        <button className="tm-btn-primary" onClick={() => { 
          setGeneratedCredentials(null); 
          setShowAddModal(true); 
        }}>
          <FaPlus /> Add Agent
        </button>
      </div>

      {/* Agent Usage Banner */}
      <div className={`tm-usage-banner ${agentLimitReached ? 'limit-reached' : ''}`}>
        <div className="tm-usage-info">
          <span className="tm-usage-label">Agent Usage:</span>
          <strong>{agentCount}</strong>
          <span className="tm-usage-separator">/</span>
          <span className={`tm-usage-limit ${agentLimitReached ? 'exceeded' : ''}`}>
            {agentLimit === -1 ? 'Unlimited' : agentLimit}
          </span>
          {agentLimitReached && (
            <span className="tm-usage-badge limit-exceeded">⚠️ Limit Reached</span>
          )}
        </div>
        {agentLimitReached && (
          <button className="tm-btn-upgrade" onClick={() => setShowUpgradeModal(true)}>
            <FaShieldAlt /> Upgrade Plan
          </button>
        )}
      </div>

      {/* Team List */}
      {loading ? (
        <div className="tm-loading">Loading team...</div>
      ) : team.length === 0 ? (
        <div className="tm-empty">
          <FaUsersCog className="tm-empty-icon" />
          <h3>No team members yet</h3>
          <p>Add your first agent to start building your brokerage team.</p>
          <button className="tm-btn-primary" onClick={() => { setGeneratedCredentials(null); setShowAddModal(true); }}>
            <FaPlus /> Add First Agent
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="tm-table-wrap">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Role</th>
                  <th>Username</th>
                  <th>Leads</th>
                  <th>Listings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map(m => (
                  <tr key={m._id} className="tm-row">
                    <td onClick={() => setSelectedAgentDetail(m)}>
                      <div className="tm-agent-name">
                        <strong>{m.name}</strong>
                        <span className="tm-agent-email"><FaEnvelope /> {m.email}</span>
                      </div>
                    </td>
                    <td onClick={() => setSelectedAgentDetail(m)}>
                      <span className="tm-role-badge">{getSubRoleLabel(m.subRole)}</span>
                    </td>
                    <td onClick={() => setSelectedAgentDetail(m)}>
                      <code className="tm-code">{m.username}</code>
                    </td>
                    <td onClick={() => setSelectedAgentDetail(m)}>
                      <span className="tm-count">{m.assignedCounts?.leads || 0}</span>
                    </td>
                    <td onClick={() => setSelectedAgentDetail(m)}>
                      <span className="tm-count">{m.assignedCounts?.properties || 0}</span>
                    </td>
                    <td onClick={() => setSelectedAgentDetail(m)}>
                      <span className={`tm-status tm-status-${m.isActive ? 'active' : 'inactive'}`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="tm-actions">
                        <button 
                          type="button" 
                          className="tm-btn-action detail" 
                          onClick={() => setSelectedAgentDetail(m)}
                          title="View Profile"
                        >
                          <FaEye />
                        </button>
                        <button 
                          type="button" 
                          className="tm-btn-action reset" 
                          onClick={(e) => handleResetPassword(m._id, e)}
                          title="Reset Password"
                        >
                          <FaKey />
                        </button>
                        <button 
                          type="button" 
                          className={`tm-btn-action ${m.isActive ? 'deactivate' : 'activate'}`} 
                          onClick={(e) => handleToggleStatus(m, e)}
                          title={m.isActive ? 'Deactivate' : 'Reactivate'}
                        >
                          {m.isActive ? <FaBan /> : <FaUserCheck />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="tm-cards">
            {team.map(m => (
              <div key={m._id} className="tm-card" onClick={() => setSelectedAgentDetail(m)}>
                <div className="tm-card-top">
                  <div className="tm-card-name">
                    <strong>{m.name}</strong>
                    <span className="tm-role-badge">{getSubRoleLabel(m.subRole)}</span>
                  </div>
                  <span className={`tm-status tm-status-${m.isActive ? 'active' : 'inactive'}`}>
                    {m.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="tm-card-contact">
                  <span><FaEnvelope /> {m.email}</span>
                  <span><code className="tm-code">{m.username}</code></span>
                </div>
                <div className="tm-card-stats">
                  <span>Leads: <strong>{m.assignedCounts?.leads || 0}</strong></span>
                  <span>Listings: <strong>{m.assignedCounts?.properties || 0}</strong></span>
                </div>
                <div className="tm-card-actions" onClick={e => e.stopPropagation()}>
                  <button 
                    type="button" 
                    className="tm-btn-action detail" 
                    onClick={() => setSelectedAgentDetail(m)}
                  >
                    <FaEye /> Profile
                  </button>
                  <button 
                    type="button" 
                    className="tm-btn-action reset" 
                    onClick={(e) => handleResetPassword(m._id, e)}
                  >
                    <FaKey /> Reset
                  </button>
                  <button 
                    type="button" 
                    className={`tm-btn-action ${m.isActive ? 'deactivate' : 'activate'}`} 
                    onClick={(e) => handleToggleStatus(m, e)}
                  >
                    {m.isActive ? <FaBan /> : <FaUserCheck />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ADD AGENT MODAL */}
      {showAddModal && (
        <div className="tm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="tm-modal tm-modal-create" onClick={e => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h3>{generatedCredentials ? '✅ Credentials Generated!' : 'Add New Agent'}</h3>
              <button type="button" className="tm-modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            {generatedCredentials ? (
              <div className="tm-creds">
                <p>System automatically generated secure temporary credentials:</p>
                <div className="tm-creds-box">
                  <div><span>Username:</span> <strong>{generatedCredentials.username}</strong></div>
                  <div><span>Temporary Password:</span> <strong>{generatedCredentials.temporaryPassword}</strong></div>
                </div>
                <p className="tm-creds-note">The agent will be required to change their temporary password upon first login.</p>

                <div className="tm-creds-actions">
                  <button type="button" className="tm-btn-secondary" onClick={copyCreds}><FaCopy /> Copy</button>
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`DealDesk Agent Credentials:\nUsername: ${generatedCredentials.username}\nTemporary Password: ${generatedCredentials.temporaryPassword}\nLogin: ${window.location.origin}/login`)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="tm-btn-wa"
                  >
                    <FaWhatsapp /> Share
                  </a>
                  <button type="button" className="tm-btn-primary" onClick={() => { 
                    setShowAddModal(false); 
                    setGeneratedCredentials(null); 
                  }}>Done</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddAgent} className="tm-modal-form">
                <div className="tm-form-group">
                  <label>Full Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="tm-form-group">
                  <label>Business Email *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@brokerage.com" />
                </div>
                <div className="tm-form-group">
                  <label>Phone Number</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div className="tm-form-group">
                  <label>Predefined Role *</label>
                  <select value={formData.subRole} onChange={e => setFormData({ ...formData, subRole: e.target.value })}>
                    <option value="PROPERTY_LEAD_AGENT">Dual Agent (Property + Lead)</option>
                    <option value="PROPERTY_AGENT">Property Agent (Inventory only)</option>
                    <option value="LEAD_AGENT">Lead Agent (Leads only)</option>
                  </select>
                </div>
                <div className="tm-form-group">
                  <label>Department</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="Sales" />
                </div>

                {/* Agent Usage Info */}
                <div className="tm-agent-usage-info">
                  <FaUsersCog className="tm-usage-icon" />
                  <span>
                    <strong>{team.length}</strong> of <strong>{agentLimit === -1 ? 'Unlimited' : agentLimit}</strong> agent slots used
                  </span>
                </div>

                <div className="tm-modal-actions">
                  <button type="button" className="tm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="tm-btn-primary">
                    {agentLimitReached ? '🔒 Upgrade Required' : 'Create Agent'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AGENT DETAILS MODAL */}
      {selectedAgentDetail && (
        <div className="tm-modal-overlay" onClick={() => setSelectedAgentDetail(null)}>
          <div className="tm-modal tm-modal-detail" onClick={e => e.stopPropagation()}>
            <div className="tm-modal-header">
              <div>
                <h3>{selectedAgentDetail.name}</h3>
                <span className="tm-role-badge">{getSubRoleLabel(selectedAgentDetail.subRole)}</span>
              </div>
              <button type="button" className="tm-modal-close" onClick={() => setSelectedAgentDetail(null)}><FaTimes /></button>
            </div>

            <div className="tm-modal-body">
              <div className="tm-detail-grid">
                <div>
                  <span className="tm-detail-label">Email</span>
                  <strong>{selectedAgentDetail.email}</strong>
                </div>
                <div>
                  <span className="tm-detail-label">Username</span>
                  <code className="tm-code">{selectedAgentDetail.username}</code>
                </div>
                <div>
                  <span className="tm-detail-label">Department</span>
                  <strong>{selectedAgentDetail.department || 'Sales'}</strong>
                </div>
                <div>
                  <span className="tm-detail-label">Status</span>
                  <span className={`tm-status tm-status-${selectedAgentDetail.isActive ? 'active' : 'inactive'}`}>
                    {selectedAgentDetail.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="tm-detail-stats">
                <div className="tm-stat-tile">
                  <span>Assigned Leads</span>
                  <strong>{selectedAgentDetail.assignedCounts?.leads || 0}</strong>
                </div>
                <div className="tm-stat-tile">
                  <span>Assigned Listings</span>
                  <strong>{selectedAgentDetail.assignedCounts?.properties || 0}</strong>
                </div>
              </div>
            </div>

            <div className="tm-modal-actions">
              <button 
                type="button" 
                className={`tm-btn-status ${selectedAgentDetail.isActive ? 'deactivate' : 'activate'}`}
                onClick={() => handleToggleStatus(selectedAgentDetail)}
              >
                {selectedAgentDetail.isActive ? 'Deactivate Agent' : 'Reactivate Agent'}
              </button>
              <button type="button" className="tm-btn-secondary" onClick={() => setSelectedAgentDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE PLAN MODAL */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
        title="Agent Limit Reached"
        message="You've reached the maximum number of agents in your current plan. Upgrade to add more team members."
        feature="Agents"
      />
    </div>
  );
};
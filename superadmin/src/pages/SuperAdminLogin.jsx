import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superadminApi } from '../services/api/superadminApi.js';
import { FaShieldAlt, FaLock, FaEnvelope } from 'react-icons/fa';
import './SuperAdminLogin.css';

export const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('admin@dealdesk.com');
  const [password, setPassword] = useState('dealdesk@2026!Secure');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await superadminApi.login(identifier, password);
      if (res.data.user.role !== 'SUPERADMIN') {
        throw new Error('Access denied: Requires SuperAdmin authorization.');
      }

      localStorage.setItem('dealdesk_superadmin_token', res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-login-viewport">
      <div className="sa-login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <DealDeskLogo size="lg" theme="light" subtext="SUPERADMIN CONSOLE" />
        </div>
        <p className="sub">Authorized platform management & support console.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="sa-form">
          <div className="form-group">
            <label>Platform Email</label>
            <div className="input-icon-wrap">
              <FaEnvelope />
              <input type="email" required value={identifier} onChange={e => setIdentifier(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Master Password</label>
            <div className="input-icon-wrap">
              <FaLock />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-sa-submit">
            {loading ? 'Authenticating...' : 'Sign In as Platform SuperAdmin'}
          </button>
        </form>
      </div>
    </div>
  );
};

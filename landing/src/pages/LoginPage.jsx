import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api/authApi.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { 
  FaBuilding, 
  FaLock, 
  FaEnvelope, 
  FaCheckCircle, 
  FaQrcode, 
  FaBolt, 
  FaShieldAlt,
  FaArrowRight,
  FaGlobe 
} from 'react-icons/fa';
import './LoginPage.css';

export const LoginPage = () => {
  const { lang, setLang } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(identifier, password);
      const { user, business, token } = res.data;

      // Check account status
      if (business && business.accountStatus === 'SUSPENDED') {
        throw new Error('Access Restricted: Your DealDesk business account is currently unavailable. Please contact DealDesk Support for assistance.');
      }

      localStorage.setItem('dealdesk_token', token);
      localStorage.setItem('dealdesk_user', JSON.stringify(user));
      if (business) {
        localStorage.setItem('dealdesk_business', JSON.stringify(business));
      }

      // Check trial expiration
      const isExpired = business && business.entitlementStatus === 'EXPIRED';

      // Redirect to Dashboard
      const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173';
      window.location.href = `${dashboardUrl}${isExpired ? '/app/settings#billing' : '/app'}?token=${token}`;
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-page">
      {/* Left Column: Brand & Features Overview (PC Only) */}
      <div className="login-left-brand-panel">
        <div className="brand-content-wrap">
          <Link to="/" className="split-logo">
            <DealDeskLogo size="lg" theme="dark" subtext="DEALS WORKSPACE" />
          </Link>

          <div className="brand-copy">
            <h1 className="brand-headline">
              Smart Workspace for Real Estate Deals.
            </h1>
            <p className="brand-subtext">
              “Every property. Every lead. Every deal. One workspace.”
            </p>

            <ul className="brand-feature-bullets">
              <li>
                <div className="bullet-icon"><FaQrcode /></div>
                <div>
                  <strong>Dynamic Smart QR Fleet</strong>
                  <span>Reassign hoardings instantly. Sold properties auto-route to matching inventory.</span>
                </div>
              </li>
              <li>
                <div className="bullet-icon"><FaBolt /></div>
                <div>
                  <strong>7-Factor Smart Match Engine</strong>
                  <span>Algorithmic buyer-inventory correlation across budget, layout, and size.</span>
                </div>
              </li>
              <li>
                <div className="bullet-icon"><FaShieldAlt /></div>
                <div>
                  <strong>Bank-Grade Multi-Tenant Isolation</strong>
                  <span>Agent-level data isolation. Private seller details remain strictly confidential.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="brand-footer-trust">
            <FaCheckCircle className="trust-check" />
            <span>Trusted by premier brokerages & commercial agencies worldwide</span>
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="login-right-form-panel">
        <div className="login-form-card">
          <div className="login-top-util-bar">
            <div className="mobile-brand-header">
              <Link to="/" className="split-logo">
                <DealDeskLogo size="sm" theme="light" subtext="WORKSPACE" />
              </Link>
            </div>

            {/* Language Selector */}
            <div className="login-lang-select-pill">
              <FaGlobe />
              <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Select Language">
                <option value="en">English (US)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          <h2 className="form-card-title">Sign In to Your Workspace</h2>
          <p className="form-card-subtitle">
            Enter your brokerage email or assigned agent credentials to access live listings.
          </p>

          {error && <div className="login-alert error">{error}</div>}

          <form onSubmit={handleLogin} className="split-login-form">
            <div className="form-group">
              <label>Business Email or Agent Username</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. admin@dealdesk.com or rahul@dealdesk.com" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-extra-row">
              <label className="remember-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Remember this workstation</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-login-submit">
              {loading ? 'Verifying Credentials...' : 'Sign In to Workspace'}
            </button>
          </form>

          <div className="login-create-workspace-box">
            <p>New to DealDesk?</p>
            <Link to="/onboarding" className="btn-create-workspace-link">
              Create New Workspace <FaArrowRight style={{ marginLeft: 6 }} />
            </Link>
            <span className="onboarding-options-hint">
              Choose 3-Day Free Trial or Select a Paid Plan with Instant Activation.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

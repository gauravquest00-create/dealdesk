import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api/authApi.js';
import { FaBuilding, FaUser, FaEnvelope, FaLock, FaGlobeAmericas } from 'react-icons/fa';
import './SignupPage.css';

export const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    businessEmail: '',
    password: '',
    country: 'India',
    currency: 'USD',
    termsAccepted: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      setError('You must accept the terms of service.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authApi.signup({
        businessName: formData.businessName,
        fullName: formData.fullName,
        businessEmail: formData.businessEmail,
        password: formData.password,
        country: formData.country,
        currency: formData.currency,
      });

      const { user, business, token } = res.data;
      localStorage.setItem('dealdesk_token', token);
      localStorage.setItem('dealdesk_user', JSON.stringify(user));
      localStorage.setItem('dealdesk_business', JSON.stringify(business));

      // Navigate to interactive onboarding wizard
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-viewport">
      <div className="signup-card">
        <Link to="/" className="signup-logo">
          <div className="logo-icon-wrap"><FaBuilding /></div>
          <span>DealDesk</span>
        </Link>

        <h2 className="signup-title">Start your 3-day free trial</h2>
        <p className="signup-subtitle">Full access to inventory, smart QRs, and deals. No credit card required.</p>

        {error && <div className="signup-error-alert">{error}</div>}

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label>Brokerage / Business Name</label>
            <div className="input-with-icon">
              <FaBuilding className="input-icon" />
              <input 
                type="text" 
                name="businessName" 
                required 
                placeholder="e.g. Gurgaon Prime Realty" 
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input 
                type="text" 
                name="fullName" 
                required 
                placeholder="e.g. Gaurav Verma" 
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Business Email</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input 
                type="email" 
                name="businessEmail" 
                required 
                placeholder="gaurav@gurgaonprimerealty.com" 
                value={formData.businessEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password (min 8 characters)</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input 
                type="password" 
                name="password" 
                required 
                minLength={8}
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Country</label>
              <select name="country" value={formData.country} onChange={handleChange}>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange}>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (AED)</option>
                <option value="INR">INR (₹)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="CAD">CAD (CA$)</option>
              </select>
            </div>
          </div>

          <label className="checkbox-row">
            <input 
              type="checkbox" 
              name="termsAccepted" 
              checked={formData.termsAccepted} 
              onChange={handleChange}
            />
            <span>I agree to DealDesk Terms of Service and Privacy Policy.</span>
          </label>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating Workspace...' : 'Create Workspace & Start Free Trial'}
          </button>
        </form>

        <div className="signup-footer">
          <span>Already have an account?</span>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

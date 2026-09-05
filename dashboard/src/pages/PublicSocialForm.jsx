import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socialLinkApi, publicLeadApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import { FaCheckCircle } from 'react-icons/fa';
import './PublicSocialForm.css';

export const PublicSocialForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    budget: '',
  });

  useEffect(() => {
    socialLinkApi.getBySlug(slug)
      .then(res => {
        setLinkData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        addToast('Link not found', 'error');
        navigate('/');
      });
  }, [slug, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      addToast('Please fill in name and phone number', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 🔥 Using publicLeadApi (no auth required)
      await publicLeadApi.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        source: 'SOCIAL_LINK',
        sourceSocialLinkId: linkData._id,
        interestedPropertyId: linkData.propertyId?._id || linkData.propertyId,
        requirements: {
          budgetMax: formData.budget ? parseBudget(formData.budget) : undefined,
        },
        notes: `Lead from Social Link: ${linkData.projectName}`,
        status: 'New',
      });
      setSubmitted(true);
      addToast('Enquiry submitted successfully! Our team will contact you shortly.');
    } catch (err) {
      addToast(err.message || 'Failed to submit enquiry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const parseBudget = (budgetStr) => {
    const map = {
      'Below ₹50 Lakhs': 5000000,
      '₹50 Lakhs - ₹1 Crore': 10000000,
      '₹1 Crore - ₹2 Crore': 20000000,
      '₹2 Crore - ₹5 Crore': 50000000,
      '₹5 Crore - ₹10 Crore': 100000000,
      '₹10 Crore+': 1000000000,
    };
    return map[budgetStr] || 0;
  };

  if (loading) {
    return (
      <div className="psf-loading">
        <div className="psf-loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="psf-error">
        <h2>Link Not Found</h2>
        <p>The social link you're looking for doesn't exist or has expired.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="psf-page psf-success">
        <div className="psf-container">
          <div className="psf-logo">
            <DealDeskLogo size="md" theme="dark" />
          </div>
          <div className="psf-success-icon">
            <FaCheckCircle />
          </div>
          <h2>Enquiry Submitted! 🎉</h2>
          <p>Thank you for your interest in <strong>{linkData.projectName}</strong>.</p>
          <p className="psf-success-sub">Our team will reach out to you shortly.</p>
          <p className="psf-success-sub">
            <a href={`/social/${slug}`} className="psf-btn-secondary" style={{ marginTop: '12px', display: 'inline-block' }}>
              Submit Another Enquiry
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="psf-page">
      <div className="psf-container">
        <div className="psf-logo">
          <DealDeskLogo size="md" theme="dark" />
        </div>

        <div className="psf-header">
          <h1 className="psf-company">{linkData.businessName || 'DealDesk'}</h1>
          <h2 className="psf-project">{linkData.projectName}</h2>
          <p className="psf-description">
            {linkData.description || 'Exclusive luxury residences available for viewing. Book your private tour today!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="psf-form">
          <div className="psf-group">
            <label>Full Name *</label>
            <input 
              type="text" 
              required 
              placeholder="Enter your full name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="psf-group">
            <label>Contact Number *</label>
            <input 
              type="tel" 
              required 
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="psf-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="your@email.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="psf-group">
            <label>Budget Range</label>
            <select 
              value={formData.budget}
              onChange={e => setFormData({ ...formData, budget: e.target.value })}
            >
              <option value="">Select budget range...</option>
              <option value="Below ₹50 Lakhs">Below ₹50 Lakhs</option>
              <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
              <option value="₹1 Crore - ₹2 Crore">₹1 Crore - ₹2 Crore</option>
              <option value="₹2 Crore - ₹5 Crore">₹2 Crore - ₹5 Crore</option>
              <option value="₹5 Crore - ₹10 Crore">₹5 Crore - ₹10 Crore</option>
              <option value="₹10 Crore+">₹10 Crore+</option>
            </select>
          </div>

          <button type="submit" disabled={submitting} className="psf-btn-submit">
            {submitting ? 'Submitting...' : <><FaCheckCircle /> Submit Enquiry</>}
          </button>
        </form>

        <div className="psf-footer">
          <p>Powered by <strong>DealDesk</strong> — Real Estate CRM</p>
        </div>
      </div>
    </div>
  );
};
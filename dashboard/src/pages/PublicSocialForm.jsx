import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socialLinkApi, publicLeadApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import { FaCheckCircle, FaArrowLeft, FaGlobe, FaLanguage } from 'react-icons/fa';
import './PublicSocialForm.css';

// Translation object for UI elements
const translations = {
  en: {
    title: 'Enquiry Submitted! 🎉',
    thankYou: 'Thank you for your interest in',
    ourTeam: 'Our team will reach out to you shortly.',
    submitAnother: 'Submit Another Enquiry',
    exploreDealDesk: 'Explore DealDesk',
    backToHome: 'Back to Home',
    fullName: 'Full Name *',
    phoneNumber: 'Contact Number *',
    emailAddress: 'Email Address',
    budgetRange: 'Budget Range',
    submitEnquiry: 'Submit Enquiry',
    submitting: 'Submitting...',
    poweredBy: 'Powered by',
    selectBudget: 'Select budget range...',
    loading: 'Loading...',
    linkNotFound: 'Link Not Found',
    linkNotFoundDesc: 'The social link you\'re looking for doesn\'t exist or has expired.',
  },
  hi: {
    title: 'जांच सबमिट हुई! 🎉',
    thankYou: 'में आपकी रुचि के लिए धन्यवाद',
    ourTeam: 'हमारी टीम जल्द ही आपसे संपर्क करेगी।',
    submitAnother: 'एक और जांच सबमिट करें',
    exploreDealDesk: 'DealDesk एक्सप्लोर करें',
    backToHome: 'होम पर जाएं',
    fullName: 'पूरा नाम *',
    phoneNumber: 'संपर्क नंबर *',
    emailAddress: 'ईमेल पता',
    budgetRange: 'बजट रेंज',
    submitEnquiry: 'जांच सबमिट करें',
    submitting: 'सबमिट हो रहा है...',
    poweredBy: 'द्वारा संचालित',
    selectBudget: 'बजट रेंज चुनें...',
    loading: 'लोड हो रहा है...',
    linkNotFound: 'लिंक नहीं मिला',
    linkNotFoundDesc: 'आप जिस सोशल लिंक को ढूंढ रहे हैं वह मौजूद नहीं है या समाप्त हो गया है।',
  },
  ar: {
    title: 'تم إرسال الاستفسار! 🎉',
    thankYou: 'شكراً لاهتمامك بـ',
    ourTeam: 'سيتواصل معك فريقنا قريباً.',
    submitAnother: 'إرسال استفسار آخر',
    exploreDealDesk: 'استكشف DealDesk',
    backToHome: 'العودة إلى الصفحة الرئيسية',
    fullName: 'الاسم الكامل *',
    phoneNumber: 'رقم الاتصال *',
    emailAddress: 'البريد الإلكتروني',
    budgetRange: 'نطاق الميزانية',
    submitEnquiry: 'إرسال الاستفسار',
    submitting: 'جاري الإرسال...',
    poweredBy: 'مشغل بواسطة',
    selectBudget: 'اختر نطاق الميزانية...',
    loading: 'جاري التحميل...',
    linkNotFound: 'الرابط غير موجود',
    linkNotFoundDesc: 'الرابط الاجتماعي الذي تبحث عنه غير موجود أو منتهي الصلاحية.',
  },
};

// Budget ranges with values in USD (will be converted per currency)
const BUDGET_RANGES_USD = [
  { value: '', label: 'Select budget range...' },
  { value: 'below-50k', label: 'Below $50K' },
  { value: '50k-100k', label: '$50K - $100K' },
  { value: '100k-200k', label: '$100K - $200K' },
  { value: '200k-500k', label: '$200K - $500K' },
  { value: '500k-1m', label: '$500K - $1M' },
  { value: '1m-2m', label: '$1M - $2M' },
  { value: 'above-2m', label: 'Above $2M' },
];

// Map budget value to max amount in USD for backend
const BUDGET_VALUE_MAP = {
  'below-50k': 50000,
  '50k-100k': 100000,
  '100k-200k': 200000,
  '200k-500k': 500000,
  '500k-1m': 1000000,
  '1m-2m': 2000000,
  'above-2m': 5000000,
};

export const PublicSocialForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency, convertPrice, formatPrice } = useCurrency();

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

  const t = translations[language] || translations.en;

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
      // Convert budget range to max amount
      const budgetMax = BUDGET_VALUE_MAP[formData.budget] || 0;

      await publicLeadApi.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        source: 'SOCIAL_LINK',
        sourceSocialLinkId: linkData._id,
        interestedPropertyId: linkData.propertyId?._id || linkData.propertyId,
        requirements: {
          budgetMax: budgetMax,
        },
        notes: `Lead from Social Link: ${linkData.projectName}`,
        status: 'New',
      });
      setSubmitted(true);
      addToast('Enquiry submitted successfully! Our team will contact you shortly.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      addToast(err.message || 'Failed to submit enquiry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', budget: '' });
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    const landingUrl = import.meta.env.VITE_LANDING_URL || '/';
    window.location.href = landingUrl;
  };

  // Language and currency options
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ar', label: 'العربية' },
  ];

  const currencyOptions = [
    { code: 'USD', label: 'USD $' },
    { code: 'INR', label: 'INR ₹' },
    { code: 'AED', label: 'AED' },
    { code: 'GBP', label: 'GBP £' },
    { code: 'EUR', label: 'EUR €' },
  ];

  // Get currency symbol
  const getCurrencySymbol = () => {
    const symbols = { USD: '$', INR: '₹', AED: 'AED ', GBP: '£', EUR: '€' };
    return symbols[currency] || '$';
  };

  // Generate budget options with current currency
  const getBudgetOptions = () => {
    const symbol = getCurrencySymbol();
    return [
      { value: '', label: t.selectBudget },
      { value: 'below-50k', label: `Below ${symbol}50K` },
      { value: '50k-100k', label: `${symbol}50K - ${symbol}100K` },
      { value: '100k-200k', label: `${symbol}100K - ${symbol}200K` },
      { value: '200k-500k', label: `${symbol}200K - ${symbol}500K` },
      { value: '500k-1m', label: `${symbol}500K - ${symbol}1M` },
      { value: '1m-2m', label: `${symbol}1M - ${symbol}2M` },
      { value: 'above-2m', label: `Above ${symbol}2M` },
    ];
  };

  if (loading) {
    return (
      <div className="psf-loading">
        <div className="psf-loader"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="psf-error">
        <h2>{t.linkNotFound}</h2>
        <p>{t.linkNotFoundDesc}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="psf-page psf-success">
        <div className="psf-container">
          <div className="psf-logo clickable" onClick={goHome} title={t.backToHome}>
            <DealDeskLogo size="md" theme="dark" />
          </div>

          <div className="psf-success-icon">
            <FaCheckCircle />
          </div>
          <h2>{t.title}</h2>
          <p>{t.thankYou} <strong>{linkData.projectName}</strong>.</p>
          <p className="psf-success-sub">{t.ourTeam}</p>

          <div className="psf-success-actions">
            <button className="psf-btn-secondary" onClick={resetForm}>
              {t.submitAnother}
            </button>
            <a href="/" className="psf-btn-primary">
              {t.exploreDealDesk}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="psf-page">
      <div className="psf-container">
        {/* Header: Logo + Selectors */}
        <div className="psf-header-top">
          <div className="psf-logo clickable" onClick={goHome} title={t.backToHome}>
            <DealDeskLogo size="md" theme="dark" />
          </div>
          <div className="psf-header-controls">
            <div className="psf-selector-group">
              <FaLanguage className="psf-selector-icon" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="psf-select"
              >
                {languageOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="psf-selector-group">
              <FaGlobe className="psf-selector-icon" />
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="psf-select"
              >
                {currencyOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="psf-back-link">
          <FaArrowLeft /> <a href="/">{t.backToHome}</a>
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
            <label>{t.fullName}</label>
            <input 
              type="text" 
              required 
              placeholder="Enter your full name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="psf-group">
            <label>{t.phoneNumber}</label>
            <input 
              type="tel" 
              required 
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="psf-group">
            <label>{t.emailAddress}</label>
            <input 
              type="email" 
              placeholder="your@email.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="psf-group">
            <label>{t.budgetRange}</label>
            <select 
              value={formData.budget}
              onChange={e => setFormData({ ...formData, budget: e.target.value })}
            >
              {getBudgetOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={submitting} className="psf-btn-submit">
            {submitting ? t.submitting : <><FaCheckCircle /> {t.submitEnquiry}</>}
          </button>
        </form>

        <div className="psf-footer">
          <p>{t.poweredBy} <strong>DealDesk</strong> — Real Estate CRM</p>
        </div>
      </div>
    </div>
  );
};

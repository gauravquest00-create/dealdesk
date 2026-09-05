import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superadminApi } from '../services/api/superadminApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { CURRENCY_SYMBOLS, CURRENCY_RATES } from '../context/CurrencyContext.jsx';
import { 
  FaBuilding, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaClock, 
  FaTag, 
  FaCreditCard, 
  FaArrowLeft, 
  FaCheckCircle,
  FaRocket,
  FaSpinner,
  FaCrown,
  FaLock,
  FaArrowRight,
  FaUserTie,
  FaKey,
  FaGlobeAsia,
  FaFlag,
  FaLanguage,
  FaCalendarAlt,
  FaEdit,
  FaTimes
} from 'react-icons/fa';
import './CreateBusinessPage.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    priceUSD: 29,
    priceINR: 2499,
    agents: 3,
    desc: 'Perfect for solo agents and small teams.',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    priceUSD: 69,
    priceINR: 5999,
    agents: 10,
    desc: 'For growing brokerages with active deals.',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    priceUSD: 129,
    priceINR: 10999,
    agents: 25,
    desc: 'For large agencies needing full control.',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceUSD: 249,
    priceINR: 20999,
    agents: 'Unlimited',
    desc: 'For multi-office networks. Unlimited scale.',
    popular: false,
  },
];

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'America/New_York', 'Europe/London',
  'Europe/Paris', 'America/Los_Angeles', 'America/Chicago', 'Asia/Singapore',
  'Australia/Sydney', 'Pacific/Auckland'
];

const CURRENCIES = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'INR', label: 'INR - Indian Rupee' },
  { code: 'AED', label: 'AED - UAE Dirham' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'CAD', label: 'CAD - Canadian Dollar' },
  { code: 'AUD', label: 'AUD - Australian Dollar' },
];

export const CreateBusinessPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activationType, setActivationType] = useState('free');
  const [showCredentials, setShowCredentials] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    currency: 'USD',
    timezone: 'Asia/Kolkata',
    language: 'en',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email' && !formData.adminEmail) {
      setFormData(prev => ({ ...prev, adminEmail: value }));
    }
  };

  const formatPriceForCurrency = (usdAmount, currencyCode) => {
    const rate = CURRENCY_RATES[currencyCode] || 1.0;
    const converted = Math.round(usdAmount * rate);
    const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
    return `${symbol}${converted.toLocaleString()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.adminName) {
      addToast('Business name, email, and admin name are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        planId: selectedPlan,
        billingCycle: billingCycle,
        activationType: activationType,
        entitlementStatus: activationType === 'free' ? 'ACTIVE_SUBSCRIPTION' : 'TRIAL_ACTIVE',
        accountStatus: 'ACTIVE',
        trialEndsAt: activationType === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        adminName: formData.adminName,
        adminEmail: formData.adminEmail || formData.email,
        adminPassword: formData.adminPassword || undefined,
      };

      const res = await superadminApi.createBusiness(payload);
      const business = res.data;

      if (activationType === 'paid') {
        setProcessingPayment(true);
        try {
          const orderRes = await superadminApi.createOrderForBusiness(business._id, {
            planId: selectedPlan,
            billingCycle: billingCycle,
            currency: formData.currency,
          });
          const orderData = orderRes.data;

          const loadRazorpay = () => {
            return new Promise((resolve) => {
              if (window.Razorpay) return resolve(true);
              const script = document.createElement('script');
              script.src = 'https://checkout.razorpay.com/v1/checkout.js';
              script.onload = () => resolve(true);
              script.onerror = () => resolve(false);
              document.body.appendChild(script);
            });
          };

          const loaded = await loadRazorpay();
          if (!loaded || !window.Razorpay) {
            throw new Error('Could not load Razorpay SDK.');
          }

          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency || formData.currency,
            name: 'DealDesk',
            description: `Subscription for ${business.name} (${selectedPlan})`,
            order_id: orderData.orderId,
            handler: async (response) => {
              try {
                await superadminApi.verifyPaymentForBusiness(business._id, {
                  providerPaymentId: response.razorpay_payment_id,
                  providerOrderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  planId: selectedPlan,
                  billingCycle: billingCycle,
                  amount: orderData.amount,
                  currency: orderData.currency,
                });
                addToast('Business created and payment verified successfully!');
                setShowCredentials({
                  username: res.data.adminUser?.username || '',
                  password: res.data.adminUser?.tempPassword || '',
                });
                navigate('/admin/businesses');
              } catch (err) {
                addToast(err.message || 'Payment verification failed', 'error');
                setProcessingPayment(false);
              }
            },
            modal: {
              ondismiss: () => setProcessingPayment(false)
            },
            theme: { color: '#2563eb' },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (err) {
          addToast(err.message || 'Payment initiation failed', 'error');
          setProcessingPayment(false);
        }
      } else {
        addToast(`Business "${business.name}" created successfully!`);
        setShowCredentials({
          username: res.data.adminUser?.username || '',
          password: res.data.adminUser?.tempPassword || '',
        });
      }
    } catch (err) {
      addToast(err.message || 'Failed to create business', 'error');
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);
  const priceUSD = billingCycle === 'annual' 
    ? (selectedPlanData?.priceUSD * 10) || 0 
    : (selectedPlanData?.priceUSD || 0);
  const formattedPrice = priceUSD > 0 ? formatPriceForCurrency(priceUSD, formData.currency) : 'Contact Sales';

  return (
    <div className="sa-cb-page">
      <div className="sa-cb-header">
        <button className="sa-cb-back-btn" onClick={() => navigate('/admin/businesses')}>
          <FaArrowLeft /> Back to Businesses
        </button>
        <h1>Create New Business Workspace</h1>
        <p className="sa-cb-subtitle">Set up a new brokerage workspace with all necessary details.</p>
      </div>

      <form onSubmit={handleSubmit} className="sa-cb-form">
        {/* Section 1: Business Details */}
        <div className="sa-cb-card">
          <h3><FaBuilding /> Business Information</h3>
          <div className="sa-cb-grid-2">
            <div className="sa-cb-form-group">
              <label>Business Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Palm Residency Realty"
                required
              />
            </div>
            <div className="sa-cb-form-group">
              <label>Business Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@brokerage.com"
                required
              />
            </div>
            <div className="sa-cb-form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="sa-cb-form-group">
              <label>Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.brokerage.com"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address */}
        <div className="sa-cb-card">
          <h3><FaMapMarkerAlt /> Address</h3>
          <div className="sa-cb-grid-2">
            <div className="sa-cb-form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>
            <div className="sa-cb-form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Gurugram"
              />
            </div>
            <div className="sa-cb-form-group">
              <label>State / Province</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Haryana"
              />
            </div>
            <div className="sa-cb-form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="122001"
              />
            </div>
            <div className="sa-cb-form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="India"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Regional Settings */}
        <div className="sa-cb-card">
          <h3><FaGlobe /> Regional Settings</h3>
          <div className="sa-cb-grid-2">
            <div className="sa-cb-form-group">
              <label>Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="sa-cb-form-group">
              <label>Timezone</label>
              <select name="timezone" value={formData.timezone} onChange={handleChange}>
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div className="sa-cb-form-group">
              <label>Language</label>
              <select name="language" value={formData.language} onChange={handleChange}>
                <option value="en">English</option>
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Admin User */}
        <div className="sa-cb-card">
          <h3><FaUserTie /> Admin User</h3>
          <div className="sa-cb-grid-2">
            <div className="sa-cb-form-group">
              <label>Admin Full Name *</label>
              <input
                type="text"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="sa-cb-form-group">
              <label>Admin Email</label>
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="admin@brokerage.com"
              />
              <small className="sa-cb-hint">Auto-filled from business email if left blank.</small>
            </div>
            <div className="sa-cb-form-group">
              <label>Password (optional)</label>
              <input
                type="text"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Leave blank to auto-generate"
              />
              <small className="sa-cb-hint">If not provided, a secure password will be generated.</small>
            </div>
          </div>
        </div>

        {/* Section 5: Plan & Billing */}
        <div className="sa-cb-card">
          <h3><FaTag /> Plan & Billing</h3>
          <div className="sa-cb-plans-grid">
            {PLANS.map((plan) => {
              const planPriceUSD = billingCycle === 'annual' ? plan.priceUSD * 10 : plan.priceUSD;
              const planPriceFormatted = formatPriceForCurrency(planPriceUSD, formData.currency);
              return (
                <div
                  key={plan.id}
                  className={`sa-cb-plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && <span className="sa-cb-plan-badge">MOST POPULAR</span>}
                  <h4>{plan.name}</h4>
                  <p className="sa-cb-plan-desc">{plan.desc}</p>
                  <div className="sa-cb-plan-price">
                    {planPriceFormatted}
                    <span>/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                  </div>
                  <div className="sa-cb-plan-agents">Agents: {plan.agents}</div>
                  {selectedPlan === plan.id && (
                    <FaCheckCircle className="sa-cb-plan-check" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="sa-cb-billing-toggle">
            <button
              type="button"
              className={`sa-cb-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`sa-cb-toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual <span className="sa-cb-save-badge">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Section 6: Activation Method */}
        <div className="sa-cb-card">
          <h3><FaRocket /> Activation Method</h3>
          <div className="sa-cb-activation-options">
            <div
              className={`sa-cb-activation-option ${activationType === 'free' ? 'selected' : ''}`}
              onClick={() => setActivationType('free')}
            >
              <FaCheckCircle className="sa-cb-activation-icon" />
              <div>
                <strong>Free Activation</strong>
                <p>Create business with active subscription immediately. No payment required. Ideal for testing.</p>
              </div>
            </div>
            <div
              className={`sa-cb-activation-option ${activationType === 'paid' ? 'selected' : ''}`}
              onClick={() => setActivationType('paid')}
            >
              <FaCreditCard className="sa-cb-activation-icon" />
              <div>
                <strong>Paid Activation</strong>
                <p>Business will be created with trial status, then payment via Razorpay will be processed. After payment, plan activates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="sa-cb-actions">
          <button type="button" className="sa-cb-btn sa-cb-btn-secondary" onClick={() => navigate('/admin/businesses')}>
            Cancel
          </button>
          <button type="submit" className="sa-cb-btn sa-cb-btn-primary" disabled={loading || processingPayment}>
            {loading ? (
              <FaSpinner className="sa-cb-spinner" /> 
            ) : processingPayment ? (
              <>Processing Payment...</>
            ) : (
              <>Create Business {activationType === 'paid' && '& Pay'} <FaArrowRight /></>
            )}
          </button>
        </div>
      </form>

      {/* Credentials Modal on Success */}
      {showCredentials && (
        <div className="sa-cb-cred-overlay">
          <div className="sa-cb-cred-modal">
            <button className="sa-cb-cred-close" onClick={() => setShowCredentials(null)}>
              <FaTimes />
            </button>
            <FaCheckCircle className="sa-cb-cred-icon" />
            <h3>Business Created Successfully!</h3>
            <p>Admin credentials have been generated. Please share these with the business owner.</p>
            <div className="sa-cb-cred-box">
              <div><strong>Username:</strong> <code>{showCredentials.username}</code></div>
              <div><strong>Password:</strong> <code>{showCredentials.password}</code></div>
            </div>
            <div className="sa-cb-cred-actions">
              <button className="sa-cb-btn sa-cb-btn-primary" onClick={() => navigate('/admin/businesses')}>
                Go to Businesses
              </button>
              <button className="sa-cb-btn sa-cb-btn-secondary" onClick={() => setShowCredentials(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
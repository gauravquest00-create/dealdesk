import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiClient } from '../services/api/apiClient.js';
import { authApi } from '../services/api/authApi.js';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { 
  FaBuilding, 
  FaRocket, 
  FaCreditCard, 
  FaCheckCircle, 
  FaCopy, 
  FaLock, 
  FaKey, 
  FaArrowRight, 
  FaArrowLeft,
  FaShieldAlt, 
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaSyncAlt,
  FaUserCheck,
  FaMoneyBillWave,
  FaGlobe
} from 'react-icons/fa';
import './OnboardingWizard.css';

// Initial fallback plans in case API is still connecting
const FALLBACK_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPriceUSD: 19,
    annualPriceUSD: 190,
    desc: 'For solo brokers and boutique agencies.',
    features: ['Up to 50 Properties', '3 Dedicated Agent Seats', 'Smart Dynamic QR Codes', 'Smart Match Engine'],
  },
  {
    id: 'professional',
    name: 'Professional',
    popular: true,
    monthlyPriceUSD: 49,
    annualPriceUSD: 490,
    desc: 'For fast-growing brokerages driving active deals.',
    features: ['Up to 250 Properties', '10 Dedicated Agent Seats', 'Smart QR Replacement Intelligence', 'Open House Registration', 'Document Checklist'],
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPriceUSD: 99,
    annualPriceUSD: 990,
    desc: 'For large firms requiring unlimited scale.',
    features: ['Unlimited Properties', 'Unlimited Agent Accounts', 'Full DealDesk Workspace', 'Audit Logging & Team Permissions', 'Priority 24/7 SLA Support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPriceUSD: 299,
    annualPriceUSD: 2990,
    desc: 'For multi-office regional networks.',
    features: ['Custom Enterprise SLA', 'Multi-Office Workspaces', 'Custom QR Domain Fleet', 'Dedicated Account Director'],
  },
];

// Helper to dynamically inject Razorpay SDK script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const OnboardingWizard = () => {
  const { currency, setCurrency, formatPrice, convertPrice } = useCurrency();
  const { lang, setLang } = useLanguage();
  const location = useLocation();

  // Wizard Steps: 1 = Choose Plan/Mode, 2 = Fill Details, 3 = Payment (if paid), 4 = Confirmation/Launch
  const [currentStep, setCurrentStep] = useState(1);
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Check URL query param for free trial pre-selection
  const queryParams = new URLSearchParams(location.search);
  const requestedMode = queryParams.get('mode');

  // Selected Plan & Billing Mode
  const [selectedPlanId, setSelectedPlanId] = useState('professional');
  const [isTrialMode, setIsTrialMode] = useState(requestedMode === 'trial');
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Account form fields manually filled by user
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    businessEmail: '',
    phone: '',
    country: 'India',
    city: 'Gurugram',
    password: '',
  });

  // System auto-generated username
  const [systemUsername, setSystemUsername] = useState('');
  const [customUsernameActive, setCustomUsernameActive] = useState(false);

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);

  // 1. Fetch real actual plans from backend API
  useEffect(() => {
    let isMounted = true;
    setLoadingPlans(true);

    apiClient.get(`/billing/plans?currency=${currency}`)
      .then(res => {
        if (isMounted && res.data && res.data.plans && res.data.plans.length > 0) {
          setPlans(res.data.plans);
        }
      })
      .catch(err => {
        console.warn('[Onboarding] Remote plans lookup notice:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingPlans(false);
      });

    return () => { isMounted = false; };
  }, [currency]);

  // 2. Pre-load Razorpay script early in background
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // 3. System Auto-generates username based on Name / Business Name / Email
  useEffect(() => {
    if (customUsernameActive) return;

    const namePart = formData.fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const bizPart = formData.businessName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const emailPrefix = formData.businessEmail.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '');

    let generated = 'admin.dealdesk';
    if (namePart && bizPart) {
      generated = `${namePart}.${bizPart.slice(0, 12)}`;
    } else if (namePart) {
      generated = `${namePart}.realty`;
    } else if (emailPrefix) {
      generated = `${emailPrefix}.desk`;
    }

    setSystemUsername(generated);
  }, [formData.fullName, formData.businessName, formData.businessEmail, customUsernameActive]);

  // Helper to generate strong password
  const handleGenerateStrongPassword = (e) => {
    e.preventDefault();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let generatedPw = 'DD#';
    for (let i = 0; i < 9; i++) {
      generatedPw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generatedPw += '26!';
    setFormData(prev => ({ ...prev, password: generatedPw }));
    setShowPassword(true);
  };

  // Helper to regenerate username
  const handleRegenerateUsername = (e) => {
    e.preventDefault();
    const randNum = Math.floor(100 + Math.random() * 900);
    const base = systemUsername.split('.')[0] || 'broker';
    setSystemUsername(`${base}${randNum}`);
  };

  // Navigate to Step 2
  const handleProceedToDetails = (e) => {
    if (e) e.preventDefault();
    setError('');
    setCurrentStep(2);
  };

  // Handle Step 2 Submission
  const handleDetailsFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.businessName.trim() || !formData.fullName.trim() || !formData.businessEmail.trim() || !formData.password) {
      setError('Please fill all required fields before proceeding.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // If Free Trial Mode: create account immediately without payment
    if (isTrialMode) {
      await executeAccountCreation(false, null);
    } else {
      // If Paid Plan Mode: proceed to Step 3 for Razorpay Checkout
      setCurrentStep(3);
    }
  };

  // Execute Account Creation via API
  const executeAccountCreation = async (isPaidAccount, paymentDetails) => {
    setLoading(true);
    setError('');

    try {
      const res = await authApi.signup({
        businessName: formData.businessName.trim(),
        fullName: formData.fullName.trim(),
        businessEmail: formData.businessEmail.trim().toLowerCase(),
        username: systemUsername.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        country: formData.country,
        city: formData.city,
        currency,
        planId: isPaidAccount ? selectedPlanId : 'starter',
        billingCycle,
        isPaid: isPaidAccount,
        paymentDetails,
      });

      const { user, business, token, credentials } = res.data;
      localStorage.setItem('dealdesk_token', token);
      localStorage.setItem('dealdesk_user', JSON.stringify(user));
      if (business) {
        localStorage.setItem('dealdesk_business', JSON.stringify(business));
      }

      setCreatedSession({
        user,
        business,
        token,
        credentials: credentials || {
          username: systemUsername,
          email: formData.businessEmail,
        }
      });

      // Move to Confirmation / Launch Screen
      setCurrentStep(4);
    } catch (err) {
      setError(err.message || 'Account registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger REAL Razorpay Payment Checkout Gateway Modal
  const handleRazorpayCheckout = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setError('Could not connect to Razorpay payment gateway script. Please verify your internet connection.');
      setLoading(false);
      return;
    }

    const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0];
    const usdPrice = billingCycle === 'annual' ? (activePlan.annualPriceUSD || 490) : (activePlan.monthlyPriceUSD || 49);
    const finalAmount = convertPrice(usdPrice);
    const amountInMinorUnits = Math.round(finalAmount * 100);

    const options = {
      key: "rzp_live_T3RAgasElYNzWk",
      amount: amountInMinorUnits,
      currency: currency,
      name: "DealDesk Workspace",
      description: `${activePlan.name} Subscription (${billingCycle})`,
      prefill: {
        name: formData.fullName,
        email: formData.businessEmail,
        contact: formData.phone,
      },
      theme: {
        color: "#1e3a8a",
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setError('Payment window closed. Payment was not charged.');
        },
      },
      handler: async (response) => {
        try {
          await executeAccountCreation(true, {
            providerPaymentId: response.razorpay_payment_id,
            providerOrderId: response.razorpay_order_id || `order_live_${Date.now()}`,
            signature: response.razorpay_signature,
            amount: finalAmount,
            currency,
            planId: selectedPlanId,
          });
        } catch (err) {
          setError(`Payment was verified (${response.razorpay_payment_id}) but account creation failed: ${err.message}. Contact support@dealdesk.com.`);
          setLoading(false);
        }
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setLoading(false);
        setError(`Payment failed: ${resp.error?.description || 'Payment rejected by bank or card issuer.'}`);
      });
      rzp.open();
    } catch (err) {
      setLoading(false);
      setError(`Failed to open Razorpay gateway: ${err.message}`);
    }
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = (e) => {
    e.preventDefault();
    const text = `DealDesk Account Credentials:\nUsername: ${systemUsername}\nEmail: ${formData.businessEmail}\nPassword: ${formData.password}\nLogin URL: http://localhost:5175/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Launch into dashboard
  const handleLaunchDashboard = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('dealdesk_token') || createdSession?.token || '';
    const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173';
    window.location.href = `${dashboardUrl}/app?token=${token}&welcome=true`;
  };

  const selectedPlanObj = plans.find(p => p.id === selectedPlanId) || plans[0];
  const selectedPlanUSD = billingCycle === 'annual' ? (selectedPlanObj?.annualPriceUSD || 490) : (selectedPlanObj?.monthlyPriceUSD || 49);

  return (
    <div className="dd-onboard-viewport">
      <div className="dd-onboard-container">
        {/* Brand Top Header */}
        <header className="dd-onboard-header">
          <Link to="/" className="dd-onboard-brand" style={{ marginBottom: 12 }}>
            <DealDeskLogo size="lg" theme="light" subtext="WORKSPACE SETUP" />
          </Link>
          <h1 className="dd-onboard-main-title">Smart Workspace for Real Estate Deals</h1>
          <p className="dd-onboard-subtitle">Every property. Every lead. Every deal. One workspace.</p>
        </header>

        {/* ========================================================================= */}
        {/* STEP 1: CHOOSE PLAN & BILLING MODE */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <section className="dd-onboard-card">
            <div className="dd-onboard-step-intro">
              <span className="dd-onboard-step-pill">Step 1 of 3</span>
              <h2>Select Your Getting Started Option</h2>
              <p>Choose the 3-day promotional free trial or select a subscription plan with instant activation.</p>
            </div>

            {/* Currency and Language & Billing Cycle Controls */}
            <div className="dd-onboard-controls-bar">
              <div className="dd-onboard-selectors-row">
                {/* Currency Picker */}
                <div className="dd-onboard-currency-group">
                  <label><FaMoneyBillWave /> Currency:</label>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="dd-onboard-select-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AED">AED (AED)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="CAD">CAD (CA$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>

                {/* Language Picker */}
                <div className="dd-onboard-currency-group">
                  <label><FaGlobe /> Language:</label>
                  <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value)}
                    className="dd-onboard-select-sm"
                  >
                    <option value="en">English (US)</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              {/* Monthly / Annual Toggle */}
              <div className="dd-onboard-cycle-toggle">
                <button 
                  type="button" 
                  className={`dd-onboard-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button 
                  type="button" 
                  className={`dd-onboard-toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('annual')}
                >
                  Annual <span className="dd-onboard-save-pill">2 Months Free</span>
                </button>
              </div>
            </div>

            {/* Free Trial Banner Card */}
            <div 
              className={`dd-onboard-trial-hero-card ${isTrialMode ? 'selected' : ''}`}
              onClick={() => {
                setIsTrialMode(true);
                setSelectedPlanId('starter');
              }}
            >
              <div className="dd-onboard-trial-left">
                <div className="dd-onboard-trial-icon">
                  <FaRocket />
                </div>
                <div>
                  <div className="dd-onboard-trial-badge">No Credit Card Required</div>
                  <h3>Start 3-Day Promotional Free Trial</h3>
                  <p>Unrestricted access to properties, dynamic Smart QRs, leads, and viewing pipelines. 100% free for 3 days.</p>
                </div>
              </div>
              <div className="dd-onboard-trial-action">
                <div className="dd-onboard-radio-circle">
                  {isTrialMode && <FaCheck color="#1e3a8a" />}
                </div>
                <span className="dd-onboard-radio-label">{isTrialMode ? 'Selected' : 'Choose Free Trial'}</span>
              </div>
            </div>

            <div className="dd-onboard-or-divider">
              <span>OR CHOOSE A SUBSCRIPTION TIER</span>
            </div>

            {/* Actual Subscription Plans Grid */}
            <div className="dd-onboard-plans-grid">
              {plans.map((p) => {
                const isSelected = !isTrialMode && selectedPlanId === p.id;
                const usd = billingCycle === 'annual' ? (p.annualPriceUSD || 490) : (p.monthlyPriceUSD || 49);

                return (
                  <div 
                    key={p.id} 
                    className={`dd-onboard-plan-card ${isSelected ? 'selected' : ''} ${p.popular ? 'popular' : ''}`}
                    onClick={() => {
                      setIsTrialMode(false);
                      setSelectedPlanId(p.id);
                    }}
                  >
                    {p.popular && <span className="dd-onboard-popular-tag">Most Popular</span>}
                    <h4 className="dd-onboard-plan-name">{p.name}</h4>
                    <p className="dd-onboard-plan-desc">{p.desc || 'Complete brokerage deal workspace.'}</p>

                    <div className="dd-onboard-plan-price-row">
                      <span className="dd-onboard-price-val">{formatPrice(usd)}</span>
                      <span className="dd-onboard-price-period">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                    </div>

                    <ul className="dd-onboard-plan-features">
                      {p.features?.slice(0, 4).map((f, idx) => (
                        <li key={idx}><FaCheck className="dd-check" /> {f}</li>
                      ))}
                    </ul>

                    <div className="dd-onboard-plan-select-indicator">
                      <div className="dd-onboard-radio-circle">
                        {isSelected && <FaCheck color="#1e3a8a" />}
                      </div>
                      <span>{isSelected ? 'Selected' : 'Select Plan'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="dd-onboard-actions-footer">
              <button 
                type="button" 
                className="dd-onboard-btn-primary" 
                onClick={handleProceedToDetails}
              >
                {isTrialMode ? 'Continue with 3-Day Free Trial' : `Continue with ${selectedPlanObj?.name} Plan`}
                <FaArrowRight style={{ marginLeft: 8 }} />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: FILL DETAILS & SYSTEM USERNAME / PASSWORD GENERATION */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <section className="dd-onboard-card">
            <div className="dd-onboard-step-intro">
              <button 
                type="button" 
                className="dd-onboard-btn-back" 
                onClick={() => setCurrentStep(1)}
              >
                <FaArrowLeft /> Back to Plans
              </button>
              <span className="dd-onboard-step-pill">Step 2 of {isTrialMode ? '2' : '3'}</span>
              <h2>Enter Workspace & Login Details</h2>
              <p>
                {isTrialMode ? 'Set up your free trial account.' : `Configuring account for ${selectedPlanObj?.name} Subscription.`} 
                System auto-generates your unique username.
              </p>
            </div>

            {error && <div className="dd-onboard-alert error">{error}</div>}

            <form onSubmit={handleDetailsFormSubmit} className="dd-onboard-form">
              <div className="dd-onboard-form-grid">
                <div className="dd-onboard-field">
                  <label>Brokerage / Business Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Gurgaon Prime Realty" 
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                <div className="dd-onboard-field">
                  <label>Administrator Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Gaurav Verma" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="dd-onboard-field">
                  <label>Business Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="gaurav@gurgaonprimerealty.com" 
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  />
                </div>

                <div className="dd-onboard-field">
                  <label>Phone / WhatsApp Number</label>
                  <input 
                    type="text" 
                    placeholder="+91 98765 43210" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="dd-onboard-field">
                  <label>Country</label>
                  <select 
                    value={formData.country} 
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    <option value="India">India</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div className="dd-onboard-field">
                  <label>City & Target Market</label>
                  <input 
                    type="text" 
                    value={formData.city} 
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Gurugram" 
                  />
                </div>

                {/* System Auto-Generated Username Box */}
                <div className="dd-onboard-field dd-onboard-span-2">
                  <div className="dd-onboard-username-box">
                    <div className="dd-onboard-uname-left">
                      <FaUserCheck className="dd-uname-icon" />
                      <div>
                        <span className="dd-uname-label">System Auto-Generated Login Username:</span>
                        <div className="dd-uname-val">
                          {customUsernameActive ? (
                            <input 
                              type="text" 
                              required 
                              value={systemUsername} 
                              onChange={(e) => setSystemUsername(e.target.value)} 
                              className="dd-uname-input-edit"
                            />
                          ) : (
                            <code>{systemUsername}</code>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="dd-uname-actions">
                      <button 
                        type="button" 
                        className="dd-onboard-btn-ghost-sm" 
                        onClick={handleRegenerateUsername}
                        title="Generate alternate username"
                      >
                        <FaSyncAlt /> Regenerate
                      </button>
                      <button 
                        type="button" 
                        className="dd-onboard-btn-ghost-sm" 
                        onClick={() => setCustomUsernameActive(!customUsernameActive)}
                      >
                        {customUsernameActive ? 'Done' : 'Edit Manually'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Box with Generator Option */}
                <div className="dd-onboard-field dd-onboard-span-2">
                  <div className="dd-onboard-pw-label-row">
                    <label>Create Your Password (Min 8 Characters) *</label>
                    <button 
                      type="button" 
                      className="dd-onboard-btn-generate-pw" 
                      onClick={handleGenerateStrongPassword}
                    >
                      <FaKey /> Generate Strong Password
                    </button>
                  </div>

                  <div className="dd-onboard-pw-input-wrap">
                    <FaLock className="dd-pw-icon" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      minLength={8}
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button 
                      type="button" 
                      className="dd-onboard-pw-toggle" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <span className="dd-onboard-hint">You can type your own password or click 'Generate Strong Password'.</span>
                </div>
              </div>

              <div className="dd-onboard-actions-footer">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="dd-onboard-btn-primary"
                >
                  {loading ? 'Registering Workspace...' : (isTrialMode ? 'Activate 3-Day Free Trial 🚀' : 'Proceed to Razorpay Payment →')}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: RAZORPAY PAYMENT GATEWAY (PAID PLANS ONLY) */}
        {/* ========================================================================= */}
        {!isTrialMode && currentStep === 3 && (
          <section className="dd-onboard-card">
            <div className="dd-onboard-step-intro">
              <button 
                type="button" 
                className="dd-onboard-btn-back" 
                onClick={() => setCurrentStep(2)}
              >
                <FaArrowLeft /> Edit Details
              </button>
              <span className="dd-onboard-step-pill">Step 3 of 3</span>
              <h2>Secure Razorpay Payment Gateway</h2>
              <p>Complete checkout to instantly activate your {selectedPlanObj?.name} deal workspace.</p>
            </div>

            {error && <div className="dd-onboard-alert error">{error}</div>}

            <div className="dd-onboard-checkout-summary">
              <div className="dd-checkout-line">
                <span>Selected Subscription:</span>
                <strong>{selectedPlanObj?.name} Tier</strong>
              </div>
              <div className="dd-checkout-line">
                <span>Billing Period:</span>
                <strong>{billingCycle === 'annual' ? 'Annual (365 Days • 2 Months Free)' : 'Monthly (30 Days)'}</strong>
              </div>
              <div className="dd-checkout-line">
                <span>Subscriber Workspace:</span>
                <strong>{formData.businessName} ({formData.businessEmail})</strong>
              </div>
              <div className="dd-checkout-line">
                <span>Assigned Username:</span>
                <code>{systemUsername}</code>
              </div>
              <div className="dd-checkout-line dd-checkout-total">
                <span>Total Amount Due:</span>
                <span className="dd-checkout-total-val">{formatPrice(selectedPlanUSD)}</span>
              </div>
            </div>

            <div className="dd-onboard-razorpay-box">
              <div className="dd-razorpay-header">
                <div className="dd-razorpay-shield">
                  <FaShieldAlt /> 256-Bit Encrypted Razorpay Gateway
                </div>
                <span className="dd-key-badge">Live Gateway</span>
              </div>
              <p className="dd-razorpay-text">
                Click below to open the official Razorpay payment modal (Cards, UPI, Net Banking, EMI). Upon verified payment signature, your workspace will be registered with immediate <strong>ACTIVE_SUBSCRIPTION</strong> entitlement.
              </p>

              <button 
                type="button" 
                className="dd-onboard-btn-razorpay" 
                onClick={handleRazorpayCheckout}
                disabled={loading}
              >
                {loading ? 'Opening Razorpay Gateway...' : `Pay ${formatPrice(selectedPlanUSD)} via Razorpay`}
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: REGISTRATION CONFIRMATION & CREDENTIALS SUMMARY */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <section className="dd-onboard-card">
            <div className="dd-onboard-success-card">
              <div className="dd-success-icon-wrap">
                <FaCheckCircle />
              </div>
              <div className="dd-success-text">
                <h2>Workspace Created Successfully! 🎉</h2>
                <p>
                  <strong>{formData.businessName}</strong> is fully registered.
                  {isTrialMode ? ' Your 3-Day Free Trial is now active.' : ` Your ${selectedPlanObj?.name} plan is paid & active.`}
                </p>
              </div>
            </div>

            <div className="dd-onboard-creds-display-box">
              <div className="dd-creds-box-header">
                <h4>Save Your Login Credentials</h4>
                <button 
                  type="button" 
                  className="dd-onboard-btn-copy" 
                  onClick={handleCopyCredentials}
                >
                  <FaCopy /> {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                </button>
              </div>

              <div className="dd-creds-rows">
                <div className="dd-cred-row">
                  <span>Login Username:</span>
                  <strong><code>{systemUsername}</code></strong>
                </div>
                <div className="dd-cred-row">
                  <span>Registered Email:</span>
                  <strong>{formData.businessEmail}</strong>
                </div>
                <div className="dd-cred-row">
                  <span>Password:</span>
                  <strong><code>{formData.password}</code></strong>
                </div>
                <div className="dd-cred-row">
                  <span>Entitlement Status:</span>
                  <span className="dd-status-pill">{isTrialMode ? 'TRIAL_ACTIVE (3 Days)' : 'ACTIVE_SUBSCRIPTION'}</span>
                </div>
              </div>
            </div>

            <div className="dd-onboard-actions-footer">
              <button 
                type="button" 
                className="dd-onboard-btn-primary dd-btn-launch" 
                onClick={handleLaunchDashboard}
              >
                Launch DealDesk Deal Workspace 🚀
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

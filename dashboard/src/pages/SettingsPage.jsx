import React, { useState, useEffect } from 'react';
import { billingApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { 
  FaCog, 
  FaCreditCard, 
  FaCheckCircle, 
  FaShieldAlt, 
  FaGlobe, 
  FaMoneyBillWave, 
  FaClock, 
  FaMoon, 
  FaSun,
  FaBell,
  FaExclamationTriangle
} from 'react-icons/fa';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { addToast } = useToast();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const { language, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState('subscription');
  const [billingStatus, setBillingStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [darkMode, setDarkMode] = useState(false);

  // Fetch plans and status
  useEffect(() => {
    Promise.all([
      billingApi.getStatus(),
      billingApi.getPlans(currency)
    ])
      .then(([statusRes, plansRes]) => {
        setBillingStatus(statusRes.data);
        const planData = plansRes.data?.plans || [];
        setPlans(planData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currency]);

  // ✅ Helper: get monthly price in RAW USD (not converted)
  const getPlanMonthlyPrice = (plan) => {
    return plan.monthlyPriceUSD || 0;
  };

  // ✅ Helper: get annual price in RAW USD (not converted)
  const getPlanAnnualPrice = (plan) => {
    return plan.annualPriceUSD || 0;
  };

  // Helper: get plan ID
  const getPlanId = (plan) => {
    return plan.id || plan.planId || plan._id || '';
  };

  const handleSubscribe = async (planId) => {
    try {
      const order = await billingApi.createOrder({ planId, billingCycle: 'monthly', currency });
      const orderData = order.data;

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
        key: orderData.keyId || 'rzp_live_T3RAgasElYNzWk',
        amount: orderData.amount,
        currency: orderData.currency || currency,
        name: 'DealDesk SaaS Platform',
        description: `Subscription Upgrade to ${orderData.planName || planId}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await billingApi.verifyPayment({
              providerPaymentId: response.razorpay_payment_id,
              providerOrderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              planId,
              billingCycle: 'monthly',
              amount: orderData.amount,
              currency: orderData.currency,
            });
            addToast('Subscription successfully upgraded and verified via Razorpay!');
            const statusRes = await billingApi.getStatus();
            setBillingStatus(statusRes.data);
          } catch (err) {
            addToast(err.message || 'Payment verification failed', 'error');
          }
        },
        theme: { color: '#1e3a8a' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      addToast(err.message || 'Payment initiation failed', 'error');
    }
  };

  const currentPlan = billingStatus?.currentPlan || {};
  const currentPlanId = billingStatus?.planId || 'starter';
  const currentPlanName = currentPlan.name || currentPlanId.toUpperCase();
  const currentEntitlement = billingStatus?.entitlementStatus || 'TRIAL';
  const anyLimitExceeded = billingStatus?.anyLimitExceeded || false;
  const usage = billingStatus?.usage || {};

  return (
    <div className="set-page">
      {/* Header */}
      <div className="set-header">
        <div>
          <h1>Workspace Settings</h1>
          <p className="set-subtitle">Configure currency, language localization, timezone, theme, and subscription billing.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="set-tabs">
        <button 
          type="button" 
          className={`set-tab ${activeTab === 'subscription' ? 'set-tab-active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          <FaCreditCard /> Subscription
        </button>
        <button 
          type="button" 
          className={`set-tab ${activeTab === 'localization' ? 'set-tab-active' : ''}`}
          onClick={() => setActiveTab('localization')}
        >
          <FaGlobe /> Language & Currency
        </button>
        <button 
          type="button" 
          className={`set-tab ${activeTab === 'general' ? 'set-tab-active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <FaCog /> Preferences
        </button>
      </div>

      {/* TAB 1: SUBSCRIPTION */}
      {activeTab === 'subscription' && (
        <div className="set-pane">
          <div className="set-card">
            {/* Current Plan & Status */}
            <div className="set-billing-status">
              <div className="set-billing-top">
                <FaShieldAlt className="set-billing-icon" />
                <div>
                  <h3>Plan: {currentPlanName}</h3>
                  <p>Status: <strong>{currentEntitlement}</strong></p>
                </div>
              </div>
              <div className="set-billing-meta">
                <span>Renewal / Expiry: {billingStatus?.subscriptionEnd ? new Date(billingStatus.subscriptionEnd).toLocaleDateString() : 'Active'}</span>
                <span>Payment Gateway: <strong>Razorpay Live</strong></span>
              </div>
            </div>
{/* Expiry / Renewal Info */}
<div className="set-renewal-info">
  <div className="set-renewal-item">
    <FaClock className="set-renewal-icon" />
    <div>
      <span className="set-renewal-label">Plan Renewal / Expiry</span>
      <strong className="set-renewal-date">
        {billingStatus?.subscriptionEnd
          ? new Date(billingStatus.subscriptionEnd).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : billingStatus?.trialEndsAt
          ? new Date(billingStatus.trialEndsAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Active'}
      </strong>
    </div>
  </div>
  <div className="set-renewal-badge">
    {billingStatus?.entitlementStatus === 'ACTIVE_SUBSCRIPTION' ? (
      <span className="badge-active">✅ Active</span>
    ) : billingStatus?.entitlementStatus === 'TRIAL' ? (
      <span className="badge-trial">⏳ Trial</span>
    ) : (
      <span className="badge-expired">⚠️ Expired</span>
    )}
  </div>
</div>
            {/* Usage Warning */}
            {anyLimitExceeded && (
              <div className="set-usage-warning">
                <FaExclamationTriangle className="set-warning-icon" />
                <div>
                  <strong>You've reached limits in some areas.</strong>
                  <p>{billingStatus?.overallSuggestion?.message || 'Upgrade your plan to continue.'}</p>
                </div>
              </div>
            )}

            {/* Plans Grid */}
            <h3 className="set-section-title">Upgrade or Select Subscription Tier</h3>
            <div className="set-plans">
              {loading ? (
                <div className="set-loading">Loading plans...</div>
              ) : plans.length === 0 ? (
                <div className="set-loading">No plans available. Please contact support.</div>
              ) : (
                plans.map(p => {
                  const planId = getPlanId(p);
                  const monthlyRawUSD = getPlanMonthlyPrice(p);   // ✅ raw USD
                  const annualRawUSD = getPlanAnnualPrice(p);     // ✅ raw USD
                  const formattedMonthly = monthlyRawUSD > 0 ? formatPrice(monthlyRawUSD) : 'Contact Sales';
                  const formattedAnnual = annualRawUSD > 0 ? formatPrice(annualRawUSD) : 'Contact Sales';

                  const isCurrent = planId === currentPlanId;

                  return (
                    <div key={planId} className={`set-plan ${p.popular ? 'set-plan-popular' : ''} ${isCurrent ? 'set-plan-current' : ''}`}>
                      {p.popular && <span className="set-plan-badge">MOST POPULAR</span>}
                      {isCurrent && <span className="set-plan-badge current">CURRENT PLAN</span>}
                      <h4>{p.name || 'Plan'}</h4>
                      <p className="set-plan-desc">{p.desc || 'Complete real estate management workspace.'}</p>
                      <div className="set-plan-price">
                        <span className="set-plan-amount">{formattedMonthly}</span>
                        {monthlyRawUSD > 0 && <span className="set-plan-period">/ month</span>}
                      </div>
                      {annualRawUSD > 0 && (
                        <div className="set-plan-annual">
                          <span>or {formattedAnnual} / year (save ~17%)</span>
                        </div>
                      )}
                      <ul className="set-plan-features">
                        {(p.features || ['Unlimited Inventory', 'Smart Dynamic QR Codes', '7-Factor Matching', 'Automated Lead Routing']).map((f, fIdx) => (
                          <li key={fIdx}><FaCheckCircle className="set-feature-check" /> {f}</li>
                        ))}
                      </ul>
                      {p.limits && (
                        <div className="set-plan-limits">
                          <span className="set-limits-label">Limits:</span>
                          {p.limits.agents !== undefined && (
                            <span className="set-limit-item">Agents: {p.limits.agents === -1 ? 'Unlimited' : p.limits.agents}</span>
                          )}
                          {p.limits.properties !== undefined && (
                            <span className="set-limit-item">Properties: {p.limits.properties === -1 ? 'Unlimited' : p.limits.properties}</span>
                          )}
                          {p.limits.leadsPerMonth !== undefined && (
                            <span className="set-limit-item">Leads: {p.limits.leadsPerMonth === -1 ? 'Unlimited' : `${p.limits.leadsPerMonth}/mo`}</span>
                          )}
                        </div>
                      )}
                      <button 
                        type="button" 
                        className={`set-btn-primary set-btn-full ${isCurrent ? 'set-btn-current' : ''}`}
                        onClick={() => handleSubscribe(planId)}
                        disabled={isCurrent}
                      >
                        {isCurrent ? 'Current Plan' : (monthlyRawUSD > 0 ? 'Select & Upgrade' : 'Contact Sales')}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCALIZATION */}
      {activeTab === 'localization' && (
        <div className="set-pane">
          <div className="set-card">
            <h3>Currency & Language Configuration</h3>
            <p className="set-card-sub">Changes sync in real time across the entire dashboard and financial calculations.</p>

            <div className="set-row">
              <div>
                <label>Display & Calculation Currency</label>
                <p className="set-row-desc">Used for listing prices, commission valuations, and checkout invoices.</p>
              </div>
              <select 
                value={currency} 
                onChange={(e) => { 
                  setCurrency(e.target.value); 
                  addToast(`Currency switched to ${e.target.value}`);
                }} 
                className="set-select"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="AED">AED (AED - UAE Dirham)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="CAD">CAD (CA$ - Canadian Dollar)</option>
                <option value="AUD">AUD (A$ - Australian Dollar)</option>
              </select>
            </div>

            <div className="set-row">
              <div>
                <label>Interface Language</label>
                <p className="set-row-desc">Updates interface terminology and navigation across all modules.</p>
              </div>
              <select 
                value={language} 
                onChange={(e) => { 
                  setLanguage(e.target.value); 
                  addToast(`Language set to ${e.target.value}`);
                }} 
                className="set-select"
              >
                <option value="en">English (US/UK)</option>
                <option value="ar">العربية (Arabic - RTL)</option>
                <option value="fr">Français (French)</option>
                <option value="es">Español (Spanish)</option>
                <option value="de">Deutsch (German)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GENERAL PREFERENCES */}
      {activeTab === 'general' && (
        <div className="set-pane">
          <div className="set-card">
            <h3>Timezone & Regional Preferences</h3>

            <div className="set-row">
              <div>
                <label>Brokerage Timezone</label>
                <p className="set-row-desc">Controls scheduled site tour dates, viewing times, and open house calendars.</p>
              </div>
              <select 
                value={timezone} 
                onChange={(e) => { 
                  setTimezone(e.target.value); 
                  addToast(`Timezone updated to ${e.target.value}`);
                }} 
                className="set-select"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                <option value="America/New_York">America/New_York (EST -5:00)</option>
                <option value="Europe/London">Europe/London (GMT +0:00)</option>
                <option value="Europe/Paris">Europe/Paris (CET +1:00)</option>
              </select>
            </div>

            <div className="set-row">
              <div>
                <label>Color Theme</label>
                <p className="set-row-desc">Toggle between crisp enterprise light theme and night mode.</p>
              </div>
              <button 
                type="button" 
                className="set-btn-secondary" 
                onClick={() => {
                  setDarkMode(!darkMode);
                  document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
                  addToast(`Theme toggled to ${!darkMode ? 'Dark' : 'Light'}`);
                }}
              >
                {darkMode ? <><FaSun /> Light Mode</> : <><FaMoon /> Dark Mode</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
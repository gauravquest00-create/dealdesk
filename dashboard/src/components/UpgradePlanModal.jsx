import React, { useState, useEffect } from 'react';
import { billingApi } from '../services/api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { FaTimes, FaCheckCircle, FaCrown, FaArrowRight, FaSpinner } from 'react-icons/fa';
import './UpgradePlanModal.css';

export const UpgradePlanModal = ({ isOpen, onClose, onSuccess, title, message, feature }) => {
  const { addToast } = useToast();
  const { currency, formatPrice } = useCurrency();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, currency]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, statusRes] = await Promise.all([
        billingApi.getPlans(currency),
        billingApi.getStatus()
      ]);
      setPlans(plansRes.data?.plans || []);
      setCurrentPlan(statusRes.data?.planId || 'starter');
    } catch (error) {
      addToast('Failed to load plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    setProcessing(true);
    try {
      const order = await billingApi.createOrder({ 
        planId, 
        billingCycle: 'monthly', 
        currency 
      });
      const orderData = order.data;

      // Load Razorpay SDK
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
        currency: orderData.currency || currency,
        name: 'DealDesk SaaS Platform',
        description: `Upgrade to ${orderData.planName || planId}`,
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
            addToast('🎉 Subscription upgraded successfully!');
            setProcessing(false);
            if (onSuccess) onSuccess();
            onClose();
          } catch (err) {
            addToast(err.message || 'Payment verification failed', 'error');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      addToast(err.message || 'Payment initiation failed', 'error');
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upgrade-modal-header">
          <div className="upgrade-modal-header-left">
            <FaCrown className="upgrade-crown-icon" />
            <div>
              <h3>Upgrade Your Plan</h3>
              <p className="upgrade-modal-subtitle">
                {message || 'You\'ve reached your limit. Upgrade to continue.'}
              </p>
            </div>
          </div>
          <button className="upgrade-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Feature banner */}
        {feature && (
          <div className="upgrade-feature-banner">
            <span className="upgrade-feature-label">Reached limit for:</span>
            <strong>{feature}</strong>
          </div>
        )}

        {/* Plans Grid */}
        <div className="upgrade-plans-container">
          {loading ? (
            <div className="upgrade-loading">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="upgrade-loading">No plans available. Contact support.</div>
          ) : (
            plans.map((plan) => {
              const planId = plan.id || plan.planId;
              
              // ✅ Use raw USD price (formatPrice will convert based on selected currency)
              const priceUSD = plan.monthlyPriceUSD || 0;
              const formattedPrice = priceUSD > 0 ? formatPrice(priceUSD) : 'Contact Sales';
              const isCurrent = planId === currentPlan;

              return (
                <div 
                  key={planId} 
                  className={`upgrade-plan-card ${plan.popular ? 'popular' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  {plan.popular && <span className="upgrade-popular-badge">🔥 MOST POPULAR</span>}
                  {isCurrent && <span className="upgrade-current-badge">✓ CURRENT</span>}
                  
                  <h4 className="upgrade-plan-name">{plan.name}</h4>
                  <p className="upgrade-plan-desc">{plan.desc || plan.description}</p>
                  
                  <div className="upgrade-plan-price">
                    <span className="upgrade-plan-amount">{formattedPrice}</span>
                    {priceUSD > 0 && <span className="upgrade-plan-period">/ month</span>}
                  </div>
                  
                  <ul className="upgrade-plan-features">
                    {(plan.features || []).slice(0, 5).map((f, idx) => (
                      <li key={idx}><FaCheckCircle className="upgrade-feature-check" /> {f}</li>
                    ))}
                    {(plan.features || []).length > 5 && (
                      <li className="upgrade-feature-more">+ {plan.features.length - 5} more features</li>
                    )}
                  </ul>
                  
                  <button
                    className={`upgrade-plan-btn ${isCurrent ? 'current' : 'primary'}`}
                    onClick={() => handleUpgrade(planId)}
                    disabled={isCurrent || processing}
                  >
                    {processing ? (
                      <FaSpinner className="upgrade-spinner" />
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      <>Upgrade <FaArrowRight /></>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="upgrade-modal-footer">
          <p>Secure payment via Razorpay. 100% encrypted.</p>
          <button className="upgrade-modal-cancel" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { billingApi } from '../services/api/services.js';
import { FaCheck, FaArrowRight, FaCrown, FaLock, FaRocket } from 'react-icons/fa';
import './Pricing.css';

export const Pricing = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency(); // ✅ Use formatPrice directly
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    billingApi.getPlans('USD') // Fetch plans in USD raw
      .then(res => {
        const planData = res.data?.plans || [];
        setPlans(planData);
      })
      .catch(() => {
        // Fallback static plans
        setPlans([
          {
            id: 'starter',
            name: 'Starter',
            monthlyPriceUSD: 29,
            annualPriceUSD: 290,
            desc: 'Perfect for solo agents and small teams. 3 agent seats.',
            popular: false,
            features: ['3 Agent Seats', '100 Properties', '500 Leads/Month', '50 Smart QR Codes', '10 Social Links', '5 Open Houses/Month'],
          },
          {
            id: 'professional',
            name: 'Professional',
            monthlyPriceUSD: 69,
            annualPriceUSD: 690,
            desc: 'For growing brokerages with active deals. 10 agent seats.',
            popular: true,
            features: ['10 Agent Seats', 'Unlimited Properties', 'Unlimited Leads', 'Unlimited Smart QR Codes', 'Unlimited Social Links', 'Unlimited Open Houses', 'Bulk WhatsApp Broadcast', 'Email Campaigns'],
          },
          {
            id: 'business',
            name: 'Business',
            monthlyPriceUSD: 129,
            annualPriceUSD: 1290,
            desc: 'For large agencies needing full control. Unlimited everything.',
            popular: false,
            features: ['Unlimited Agents', 'Unlimited Everything', 'Custom Branding', 'Priority Support', 'Full API Access', 'Dedicated Account Manager'],
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            monthlyPriceUSD: 249,
            annualPriceUSD: 2490,
            desc: 'For multi-office networks. Unlimited scale.',
            popular: false,
            features: ['Unlimited Agents', 'Custom SLA', 'Multi-Office Workspaces', 'Dedicated Account Director', 'Custom QR Domain Fleet'],
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Get raw USD price (NOT converted)
  const getPlanPriceUSD = (plan) => {
    return isAnnual ? plan.annualPriceUSD : plan.monthlyPriceUSD;
  };

  if (loading) {
    return (
      <section className="pricing-section">
        <div className="pricing-container">
          <div className="pricing-loading">Loading plans...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        {/* Header & Toggle - same as before */}
        <div className="section-header">
          <span className="section-kicker">
            <span className="kicker-line"></span>
            Simple, Transparent Pricing
            <span className="kicker-line"></span>
          </span>
          <h2 className="section-title">
            Choose the <span className="title-highlight">Right Plan</span> for Your Team
          </h2>
          <p className="section-subtitle">
            Start with a 3-day free trial. No credit card required. Upgrade or cancel anytime.
          </p>
          <div className="billing-toggle-wrap">
            <span className={!isAnnual ? 'active-toggle' : ''}>Monthly</span>
            <button 
              className={`toggle-switch ${isAnnual ? 'annual' : ''}`}
              onClick={() => setIsAnnual(!isAnnual)}
              aria-label="Toggle annual billing"
            >
              <span className="toggle-slider"></span>
            </button>
            <span className={isAnnual ? 'active-toggle' : ''}>
              Annual <span className="toggle-save-badge">Save 17%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards-grid">
          {plans.map((p) => {
            const priceUSD = getPlanPriceUSD(p); // ✅ Raw USD
            const periodLabel = isAnnual ? '/year' : '/month';
            const isPopular = p.popular === true;

            return (
              <div key={p.id} className={`pricing-card ${isPopular ? 'popular' : ''}`}>
                {isPopular && <div className="popular-badge"><FaCrown /> Most Popular</div>}
                {p.id === 'starter' && (
                  <div className="lifetime-badge">
                    <FaLock /> Lifetime Lock (First 20 Users)
                  </div>
                )}

                <h3 className="plan-name">{p.name}</h3>
                <p className="plan-desc">{p.desc}</p>

                <div className="price-tag">
                  {/* ✅ formatPrice gets raw USD, converts automatically */}
                  <span className="price-amount">{formatPrice(priceUSD)}</span>
                  <span className="price-period">{periodLabel}</span>
                </div>
                <p className="currency-hint">Billed in your selected currency</p>

                <Link to="/onboarding" className={`btn-plan ${isPopular ? 'btn-plan-popular' : ''}`}>
                  {isPopular ? 'Start Free Trial' : 'Get Started'}
                  <FaArrowRight className="btn-arrow" />
                </Link>

                <div className="plan-divider"></div>

                <ul className="plan-features">
                  {p.features && p.features.map((feat, fidx) => (
                    <li key={fidx}>
                      <FaCheck className="check-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="pricing-cta">
          <div className="pricing-cta-inner">
            <div className="pricing-cta-text">
              <FaRocket className="pricing-cta-icon" />
              <div>
                <h4>All plans include a 3-day free trial</h4>
                <p>No commitment. Cancel anytime. Upgrade or downgrade as you grow.</p>
              </div>
            </div>
            <Link to="/onboarding" className="pricing-cta-btn">
              Start Your Free Trial <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
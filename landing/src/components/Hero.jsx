import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { FaCheckCircle, FaArrowRight, FaQrcode, FaHandshake, FaRobot, FaBuilding, FaPlay, FaStar, FaRocket, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import './Hero.css';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Floating Particles Background */}
        <div className="hero-particles">
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
          <div className="particle p5"></div>
        </div>

        {/* Badge with live indicator */}
        <div className="hero-badge animate-fade-down">
          <span className="hero-badge-dot"></span>
          <span>🔥 {t.hero.badge || 'India\'s #1 Real Estate Lead Engine'}</span>
        </div>

        {/* Main Heading */}
        <h1 className="hero-title animate-fade-up">
          <span className="hero-title-gradient">DealDesk</span>
          <span className="hero-title-block">{t.hero.tagline || 'Stop Losing Leads. Start Closing Deals.'}</span>
        </h1>

        {/* Impression Quote - New Style */}
        <div className="hero-quote-block animate-fade-up-delay">
          <FaQuoteLeft className="quote-icon quote-left" />
          <blockquote className="hero-quote">
            <span className="hero-quote-text">
              {t.hero.subline || 'One link for Instagram Reels, YouTube Shorts, Open Houses, and QR boards — leads auto-captured into your CRM. No more Google Forms. No more manual entry.'}
            </span>
            <cite className="hero-quote-cite">
              — <strong>DealDesk</strong> • Real Estate Lead Engine
            </cite>
          </blockquote>
          <FaQuoteRight className="quote-icon quote-right" />
        </div>

        {/* CTA Buttons with glow */}
        <div className="hero-cta-group animate-fade-up-delay-2">
          <Link to="/onboarding" className="btn-hero-primary">
            <FaRocket style={{ marginRight: 8 }} /> 
            {t.hero.ctaPrimary || 'Start Free Trial'}
            <FaArrowRight style={{ marginLeft: 8 }} />
          </Link>
          <a href="#how-it-works" className="btn-hero-secondary">
            <FaPlay style={{ marginRight: 6 }} />
            {t.hero.ctaSecondary || 'See How It Works'}
          </a>
        </div>

        {/* Trust Bar */}
        <div className="hero-trust-bar animate-fade-up-delay-3">
          <div className="trust-item">
            <FaCheckCircle className="trust-icon" />
            <span>{t.hero.trust1 || 'No credit card required'}</span>
          </div>
          <div className="trust-item">
            <FaCheckCircle className="trust-icon" />
            <span>{t.hero.trust2 || '14-day free trial'}</span>
          </div>
          <div className="trust-item">
            <FaCheckCircle className="trust-icon" />
            <span>{t.hero.trust3 || 'Setup in 5 minutes'}</span>
          </div>
          <div className="trust-item">
            <FaCheckCircle className="trust-icon" />
            <span>{t.hero.trust4 || 'Used by 200+ agents'}</span>
          </div>
        </div>

        {/* Preview Surface */}
        <div className="hero-preview-surface animate-fade-up-delay-4">
          <div className="preview-top-bar">
            <div className="dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="preview-address">dealdesk.com/app/workspace</span>
            <div className="preview-live-badge">
              <span className="live-dot"></span>
              LIVE
            </div>
          </div>
          <div className="preview-stats-grid">
            <div className="stat-pill stat-hover">
              <FaBuilding className="stat-icon" />
              <div>
                <h4>Live Inventory</h4>
                <p>148 Premium Properties</p>
              </div>
            </div>
            <div className="stat-pill stat-hover">
              <FaRobot className="stat-icon" />
              <div>
                <h4>Smart Match Engine</h4>
                <p>32 High-Intent Deals</p>
              </div>
            </div>
            <div className="stat-pill stat-hover">
              <FaQrcode className="stat-icon" />
              <div>
                <h4>Smart QR Fleet</h4>
                <p>1,240 Clean Scans</p>
              </div>
            </div>
            <div className="stat-pill stat-hover">
              <FaHandshake className="stat-icon" />
              <div>
                <h4>Pipeline Value</h4>
                <p>$18.4M in Escrow</p>
              </div>
            </div>
          </div>

          <div className="preview-social-proof">
            <div className="proof-avatars">
              <div className="avatar">RK</div>
              <div className="avatar">AS</div>
              <div className="avatar">MJ</div>
              <div className="avatar">+</div>
            </div>
            <div className="proof-text">
              <strong>200+ real estate professionals</strong> already use DealDesk
            </div>
            <div className="proof-rating">
              <FaStar className="star-icon" />
              <FaStar className="star-icon" />
              <FaStar className="star-icon" />
              <FaStar className="star-icon" />
              <FaStar className="star-icon" />
              <span>4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
import { DealDeskLogo } from './DealDeskLogo.jsx';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { FaBuilding, FaGlobe, FaMoneyBillWave, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

export const Navbar = () => {
  const { lang, setLang, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="landing-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}><DealDeskLogo size="md" theme="light" subtext="WORKSPACE" /></Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-links">
          <a href="#features" className="nav-link">{t.nav.features}</a>
          <a href="#how-it-works" className="nav-link">{t.nav.howItWorks}</a>
          <a href="#pricing" className="nav-link">{t.nav.pricing}</a>
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          {/* Language Selector */}
          <div className="select-pill">
            <FaGlobe className="pill-icon" />
            <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Select Language">
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          {/* Currency Selector */}
          <div className="select-pill">
            <FaMoneyBillWave className="pill-icon" />
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Select Currency">
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD (CA$)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (AED)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="EUR">EUR (€)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <Link to="/login" className="btn-secondary">{t.nav.login}</Link>
          <Link to="/onboarding" className="btn-primary">{t.nav.startTrial}</Link>

          {/* Mobile Hamburger Toggle Button */}
          <button 
            className="mobile-hamburger-btn" 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMobileMenu}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="navbar-logo"><DealDeskLogo size="md" theme="light" subtext="WORKSPACE" /></div>
              <button className="mobile-close-btn" onClick={closeMobileMenu} aria-label="Close menu">
                <FaTimes />
              </button>
            </div>

            <div className="mobile-drawer-links">
              <a href="#features" className="mobile-nav-link" onClick={closeMobileMenu}>
                {t.nav.features}
              </a>
              <a href="#how-it-works" className="mobile-nav-link" onClick={closeMobileMenu}>
                {t.nav.howItWorks}
              </a>
              <a href="#pricing" className="mobile-nav-link" onClick={closeMobileMenu}>
                {t.nav.pricing}
              </a>
            </div>

            <div className="mobile-drawer-divider"></div>

            <div className="mobile-selectors-section">
              <div className="mobile-select-group">
                <label><FaGlobe /> Language</label>
                <select value={lang} onChange={(e) => setLang(e.target.value)}>
                  <option value="en">English (US)</option>
                  <option value="ar">العربية (Arabic)</option>
                  <option value="fr">Français (French)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="de">Deutsch (German)</option>
                </select>
              </div>

              <div className="mobile-select-group">
                <label><FaMoneyBillWave /> Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (AED)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="mobile-drawer-actions">
              <Link to="/login" className="btn-mobile-login" onClick={closeMobileMenu}>
                {t.nav.login}
              </Link>
              <Link to="/onboarding" className="btn-mobile-trial" onClick={closeMobileMenu}>
                {t.nav.startTrial}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { DealDeskLogo } from './DealDeskLogo.jsx';
import { FaBuilding, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import './Footer.css';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="landing-footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <DealDeskLogo size="md" theme="dark" subtext="DEALS WORKSPACE" />
          </div>
          <p className="footer-motto">
            Smart Workspace for Real Estate Deals. Every property. Every lead. Every deal. One workspace.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links-group">
          <h4>Product</h4>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
          <Link to="/onboarding">Onboarding Tour</Link>
        </div>

        <div className="footer-links-group">
          <h4>Legal & Compliance</h4>
          <Link to="/terms">{t.footer?.terms || 'Terms of Service'}</Link>
          <Link to="/privacy">{t.footer?.privacy || 'Privacy Policy'}</Link>
          <Link to="/refund">{t.footer?.refund || 'Refund Policy'}</Link>
          <Link to="/contact">{t.footer?.support || 'Contact Support'}</Link>
        </div>

        <div className="footer-links-group">
          <h4>Contact</h4>
          <a href="mailto:support@dealdesk.com"><FaEnvelope /> support@dealdesk.com</a>
          {/* <a href="tel:+919999999999"><FaPhoneAlt /> +91 99999 99999</a> */}
          <span><FaMapMarkerAlt /> Gurugram, India</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} DealDesk. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/refund">Refund</Link>
        </div>
      </div>
    </footer>
  );
};
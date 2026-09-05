import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';
import { FaArrowLeft, FaEnvelope, FaPhoneAlt, FaClock, FaHeadset, FaWhatsapp, FaRocket } from 'react-icons/fa';
import './ContactPage.css';

export const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="contact-page">
      <Navbar />
      
      <main className="contact-main">
        <div className="contact-container">
          {/* Back Button */}
          <button className="contact-back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </button>

          <div className="contact-card">
            <div className="contact-header">
              <h1>Contact DealDesk Support</h1>
              <p className="contact-updated">We are here to assist real estate teams worldwide.</p>
              <div className="contact-badge">
                <FaHeadset /> 24/7 Support
              </div>
            </div>

            <div className="contact-divider"></div>

            <div className="contact-body">
              {/* Email */}
              <div className="contact-section">
                <div className="contact-section-icon">
                  <FaEnvelope />
                </div>
                <div>
                  <h3>Email Support</h3>
                  <p><strong>General Support:</strong> <a href="mailto:support@dealdesk.com">support@dealdesk.com</a></p>
                  <p><strong>Enterprise Inquiries:</strong> <a href="mailto:sales@dealdesk.com">sales@dealdesk.com</a></p>
                </div>
              </div>

              {/* Phone */}
              <div className="contact-section">
                <div className="contact-section-icon">
                  <FaPhoneAlt />
                </div>
                <div>
                  <h3>Phone Support</h3>
                  <p><strong>Priority Hotline:</strong> <a href="tel:+919999999999">+91 99999 99999</a></p>
                  <p><strong>Sales & Onboarding:</strong> <a href="tel:+918888888888">+91 88888 88888</a></p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="contact-section">
                <div className="contact-section-icon">
                  <FaWhatsapp />
                </div>
                <div>
                  <h3>WhatsApp Support</h3>
                  <p><strong>Quick Chat:</strong> <a href="https://wa.me/919999999999">+91 99999 99999</a></p>
                  <p className="contact-hint">Available during business hours for quick queries.</p>
                </div>
              </div>

              {/* Hours */}
              <div className="contact-section">
                <div className="contact-section-icon">
                  <FaClock />
                </div>
                <div>
                  <h3>Support Hours</h3>
                  <p><strong>Standard Support:</strong> Monday–Friday, 9:00 AM – 6:00 PM IST</p>
                  <p><strong>Priority Support:</strong> 24/7 for Business and Enterprise plans</p>
                </div>
              </div>
            </div>

            <div className="contact-footer">
              <p>Our team is ready to help you get the most out of DealDesk.</p>
              <div className="contact-buttons">
                <button className="contact-cta-btn" onClick={() => window.location.href = 'mailto:support@dealdesk.com'}>
                  <FaEnvelope /> Email Us
                </button>
                <button className="contact-cta-btn secondary" onClick={() => window.open('https://wa.me/919999999999', '_blank')}>
                  <FaWhatsapp /> WhatsApp Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
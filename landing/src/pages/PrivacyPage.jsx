import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';
import { FaArrowLeft, FaShieldAlt, FaDatabase, FaCreditCard, FaUserSecret, FaLock } from 'react-icons/fa';
import './PrivacyPage.css';

export const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      <Navbar />
      
      <main className="privacy-main">
        <div className="privacy-container">
          {/* Back Button */}
          <button className="privacy-back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </button>

          <div className="privacy-card">
            <div className="privacy-header">
              <h1>Privacy Policy</h1>
              <p className="privacy-updated">Last updated: September 2026</p>
              <div className="privacy-badge">
                <FaShieldAlt /> Privacy Guaranteed
              </div>
            </div>

            <div className="privacy-divider"></div>

            <div className="privacy-body">
              {/* Section 1 */}
              <div className="privacy-section">
                <div className="privacy-section-icon">
                  <FaDatabase />
                </div>
                <div>
                  <h3>1. Information We Collect</h3>
                  <p>We collect business details, authorized agent credentials, property data, client requirements, viewing logs, and dynamic QR analytics to provide a seamless real estate workspace experience.</p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="privacy-section">
                <div className="privacy-section-icon">
                  <FaCreditCard />
                </div>
                <div>
                  <h3>2. Payment Processing</h3>
                  <p>Payment information is processed directly by Razorpay. DealDesk never collects or stores raw credit card numbers or CVV credentials. All transactions are encrypted and secure.</p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="privacy-section">
                <div className="privacy-section-icon">
                  <FaUserSecret />
                </div>
                <div>
                  <h3>3. Data Confidentiality</h3>
                  <p>Your client data, lead information, and property details are strictly confidential. We do not share, sell, or rent your business data to third parties under any circumstances.</p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="privacy-section">
                <div className="privacy-section-icon">
                  <FaLock />
                </div>
                <div>
                  <h3>4. Data Security & Encryption</h3>
                  <p>All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Access is strictly controlled through role-based permissions. Regular security audits are performed to ensure compliance.</p>
                </div>
              </div>
            </div>

            <div className="privacy-footer">
              <p>By using DealDesk, you trust us with your data. We are committed to protecting your privacy and maintaining transparency.</p>
              <button className="privacy-cta-btn" onClick={() => navigate('/')}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
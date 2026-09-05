import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';
import { FaArrowLeft, FaCheckCircle, FaShieldAlt, FaLock, FaBuilding, FaUserTie } from 'react-icons/fa';
import './TermsPage.css';

export const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
      <Navbar />
      
      <main className="terms-main">
        <div className="terms-container">
          {/* Back Button */}
          <button className="terms-back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </button>

          <div className="terms-card">
            <div className="terms-header">
              <h1>Terms of Service</h1>
              <p className="terms-updated">Last updated: September 2026</p>
              <div className="terms-badge">
                <FaShieldAlt /> Legal Agreement
              </div>
            </div>

            <div className="terms-divider"></div>

            <div className="terms-body">
              {/* Section 1 */}
              <div className="terms-section">
                <div className="terms-section-icon">
                  <FaCheckCircle />
                </div>
                <div>
                  <h3>1. Agreement to Terms</h3>
                  <p>By accessing or using DealDesk (dealdesk.com), you agree to be bound by these Terms of Service. If you disagree with any part, you may not access our SaaS workspace.</p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="terms-section">
                <div className="terms-section-icon">
                  <FaUserTie />
                </div>
                <div>
                  <h3>2. 3-Day Promotional Trial</h3>
                  <p>DealDesk provides a promotional 3-Day Free Trial per unique brokerage entity. Abuse detection algorithms monitor repeat signups. After the trial period, workspace access requires an active subscription.</p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="terms-section">
                <div className="terms-section-icon">
                  <FaBuilding />
                </div>
                <div>
                  <h3>3. Data Ownership and Multi-Tenancy</h3>
                  <p>Customer businesses retain 100% intellectual property and ownership of all uploaded property listings, lead records, client negotiations, and transaction documents. Data isolation is strictly enforced across customer workspaces.</p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="terms-section">
                <div className="terms-section-icon">
                  <FaLock />
                </div>
                <div>
                  <h3>4. Security & Confidentiality</h3>
                  <p>DealDesk implements bank-grade encryption for all data in transit and at rest. We do not share, sell, or rent your business data to third parties. All team members are bound by strict confidentiality agreements.</p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="terms-section">
                <div className="terms-section-icon">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3>5. Limitation of Liability</h3>
                  <p>DealDesk is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from the use of our platform. Our total liability is limited to the fees paid in the preceding 12 months.</p>
                </div>
              </div>
            </div>

            <div className="terms-footer">
              <p>By continuing to use DealDesk, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
              <button className="terms-cta-btn" onClick={() => navigate('/')}>
                I Agree & Continue
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
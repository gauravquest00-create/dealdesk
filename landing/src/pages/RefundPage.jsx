import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';
import { FaArrowLeft, FaWallet, FaClock, FaUndo, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import './RefundPage.css';

export const RefundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="refund-page">
      <Navbar />
      
      <main className="refund-main">
        <div className="refund-container">
          {/* Back Button */}
          <button className="refund-back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </button>

          <div className="refund-card">
            <div className="refund-header">
              <h1>Refund & Cancellation Policy</h1>
              <p className="refund-updated">Last updated: September 2026</p>
              <div className="refund-badge">
                <FaShieldAlt /> Refund Policy
              </div>
            </div>

            <div className="refund-divider"></div>

            <div className="refund-body">
              {/* Section 1 */}
              <div className="refund-section">
                <div className="refund-section-icon">
                  <FaWallet />
                </div>
                <div>
                  <h3>1. 3-Day Free Trial</h3>
                  <p>We provide a 3-Day Free Trial without upfront payment to ensure DealDesk fits your brokerage operations before committing to a paid plan. No credit card required during trial.</p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="refund-section">
                <div className="refund-section-icon">
                  <FaClock />
                </div>
                <div>
                  <h3>2. Cancellations</h3>
                  <p>Subscriptions can be canceled anytime from your Workspace Settings. Your access will remain active until the conclusion of the paid billing cycle. No cancellation fees apply.</p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="refund-section">
                <div className="refund-section-icon">
                  <FaUndo />
                </div>
                <div>
                  <h3>3. Refund Eligibility</h3>
                  <p>Refunds are available within 7 days of the first paid charge. After the billing cycle renews, no refunds are provided for the remaining period. Contact support for assistance.</p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="refund-section">
                <div className="refund-section-icon">
                  <FaCheckCircle />
                </div>
                <div>
                  <h3>4. Billing & Payment</h3>
                  <p>All payments are processed securely via Razorpay. Your subscription automatically renews at the end of each billing cycle unless canceled. You will be notified before any renewal charge.</p>
                </div>
              </div>
            </div>

            <div className="refund-footer">
              <p>For any refund or billing inquiries, please contact our support team.</p>
              <button className="refund-cta-btn" onClick={() => navigate('/contact')}>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
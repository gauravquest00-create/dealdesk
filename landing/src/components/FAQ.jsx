import React, { useState } from 'react';
import { FaPlus, FaMinus, FaQuestionCircle, FaArrowRight } from 'react-icons/fa';
import './FAQ.css';

const faqs = [
  {
    q: 'How does the 3-day free trial work?',
    a: 'You get unrestricted access to all DealDesk features for 3 days. No credit card is required upfront. You can set up your inventory, generate Smart QRs, add team members, and test client outreach immediately.',
  },
  {
    q: 'What makes Smart QR different from static property QR codes?',
    a: 'Smart QR codes are dynamic. If a property is sold or under offer, our system automatically routes scanning buyers to equivalent replacement inventory in the same project or configuration rather than displaying a dead link.',
  },
  {
    q: 'Can our agents see each other\'s leads and private notes?',
    a: 'No. DealDesk enforces strict role-based data isolation. Agents can only view properties and leads specifically assigned to them. Administrative leadership retains complete visibility over the entire brokerage workspace.',
  },
  {
    q: 'Which payment methods are supported for subscriptions?',
    a: 'We support international credit/debit cards, Net Banking, and UPI via Razorpay. Subscriptions are billed automatically in your selected currency.',
  },
  {
    q: 'Can I upgrade or downgrade my plan anytime?',
    a: 'Absolutely. You can switch between plans at any time. The changes take effect immediately, and your billing is prorated accordingly.',
  },
];

export const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        {/* Header */}
        <div className="faq-header">
          <span className="faq-kicker">
            <span className="faq-kicker-line"></span>
            Got Questions?
            <span className="faq-kicker-line"></span>
          </span>
          <h2 className="faq-title">
            Frequently Asked <span className="faq-title-highlight">Questions</span>
          </h2>
          <p className="faq-subtitle">
            Everything you need to know about DealDesk. Can't find what you're looking for?{' '}
            <a href="/contact" className="faq-contact-link">Contact us</a>
          </p>
        </div>

        {/* FAQ List */}
        <div className="faq-list">
          {faqs.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx} 
                className={`faq-item ${isOpen ? 'open' : ''}`} 
                onClick={() => toggle(idx)}
              >
                <div className="faq-question">
                  <div className="faq-question-left">
                    <FaQuestionCircle className="faq-q-icon" />
                    <h4>{f.q}</h4>
                  </div>
                  <span className="faq-toggle-icon">
                    {isOpen ? <FaMinus /> : <FaPlus />}
                  </span>
                </div>
                <div className={`faq-answer-wrap ${isOpen ? 'open' : ''}`}>
                  <p className="faq-answer">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="faq-bottom-cta">
          <p>Still have questions? We're here to help.</p>
          <a href="/contact" className="faq-bottom-btn">
            Contact Support <FaArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
};
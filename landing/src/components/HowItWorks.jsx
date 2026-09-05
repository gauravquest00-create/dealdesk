import React, { useEffect, useRef } from 'react';
import { 
  FaBuilding, 
  FaUserPlus, 
  FaRocket, 
  FaHandshake,
  FaArrowRight,
  FaCheckCircle,
  FaQrcode,
  FaComments,
  FaCalendarCheck
} from 'react-icons/fa';
import './HowItWorks.css';

const steps = [
  {
    num: '01',
    icon: <FaBuilding />,
    title: 'Ingest Properties & Generate Smart QR',
    desc: 'Add your property portfolio with configurations, floor plans, and asking prices. Generate dynamic Smart QRs for site hoardings and window displays.',
    highlight: 'Smart QR Generator',
    color: '#2563eb',
  },
  {
    num: '02',
    icon: <FaUserPlus />,
    title: 'Acquire Leads & Open House Visitors',
    desc: 'Prospective buyers scan physical QRs or check in at Open House events. Verified leads land immediately in your workspace without duplicate data entry.',
    highlight: 'Auto-Lead Capture',
    color: '#7c3aed',
  },
  {
    num: '03',
    icon: <FaComments />,
    title: 'Smart Match & Personalized Outreach',
    desc: 'Our 7-factor engine surfaces high-intent matches instantly. Send tailored WhatsApp introductions with full listing previews in two clicks.',
    highlight: '7-Factor AI Match',
    color: '#059669',
  },
  {
    num: '04',
    icon: <FaHandshake />,
    title: 'Schedule Viewings & Close Deals',
    desc: 'Organize site visits, record structured post-viewing reports, track negotiations through the visual pipeline, and close deals effortlessly.',
    highlight: 'Deal Pipeline',
    color: '#d97706',
  },
];

export const HowItWorks = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = document.querySelectorAll('.step-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('visible');
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="how-section" ref={sectionRef}>
      {/* Decorative Background */}
      <div className="how-bg-shape shape-1"></div>
      <div className="how-bg-shape shape-2"></div>

      <div className="how-container">
        {/* Header */}
        <div className="section-header">
          <span className="section-kicker">
            <span className="kicker-line"></span>
            Operational Workflow
            <span className="kicker-line"></span>
          </span>
          <h2 className="section-title">
            From Acquisition to <span className="title-highlight">Closing</span>
          </h2>
          <p className="section-subtitle">
            How high-performing real estate teams scale deal velocity with DealDesk.
          </p>
        </div>

        {/* Steps Flow */}
        <div className="steps-flow">
          {/* Connecting Line */}
          <div className="steps-connector"></div>

          <div className="steps-row">
            {steps.map((s, idx) => (
              <div key={idx} className="step-card">
                <div className="step-number" style={{ background: s.color }}>
                  <span>{s.num}</span>
                </div>
                <div className="step-icon-wrapper" style={{ color: s.color }}>
                  {s.icon}
                </div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
                <div className="step-highlight" style={{ background: s.color }}>
                  <FaCheckCircle className="step-highlight-icon" />
                  <span>{s.highlight}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="step-arrow">
                    <FaArrowRight />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="how-cta">
          <div className="how-cta-inner">
            <div className="how-cta-text">
              <FaRocket className="how-cta-icon" />
              <div>
                <h4>Ready to streamline your workflow?</h4>
                <p>Join 200+ real estate professionals already using DealDesk.</p>
              </div>
            </div>
            <a href="/onboarding" className="how-cta-btn">
              Start Free Trial <FaArrowRight />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
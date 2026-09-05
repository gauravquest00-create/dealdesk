import React, { useState, useEffect, useRef } from 'react';
import { 
  FaQrcode, 
  FaRobot, 
  FaCalendarCheck, 
  FaDoorOpen, 
  FaFolderOpen, 
  FaComments, 
  FaUsers, 
  FaShieldAlt,
  FaArrowRight,
  FaRocket,
  FaCrown
} from 'react-icons/fa';
import './Features.css';

const featureList = [
  {
    icon: <FaQrcode />,
    title: 'Smart Dynamic QR Codes',
    desc: 'Print physical boards once. Reassign properties seamlessly without reprint. When a property sells, the intelligent resolver redirects prospects to matching available inventory in the same project.',
    tag: '🔥 No Dead QR',
    gradient: 'linear-gradient(135deg, #2563eb, #0284c7)',
  },
  {
    icon: <FaRobot />,
    title: '7-Factor Smart Match Engine',
    desc: 'Algorithmic matching across Budget (30%), Location (25%), Configuration (20%), Style, and Size. Transparent match score breakdown helps agents pitch with precision.',
    tag: '🎯 97% Accuracy',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
  },
  {
    icon: <FaCalendarCheck />,
    title: 'Viewing Reports & Scoring',
    desc: 'Capture viewing feedback, objections, and client decisions instantly. Auto-updates lead temperature from Warm to Hot and adjusts lead score dynamically.',
    tag: '⚡ Real-time Scoring',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
  },
  {
    icon: <FaDoorOpen />,
    title: 'Open House Lead Acquisition',
    desc: 'Generate event-specific registration QR codes. Visitors scan and check-in with their mobile devices, automatically capturing verified leads directly into your workspace.',
    tag: '📊 Auto-Lead Capture',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
  },
  {
    icon: <FaComments />,
    title: 'WhatsApp & Email Studio',
    desc: 'Instant personalized client outreach using variable templates. Toggle price and carpet area visibility before sending. Retains complete communication logs.',
    tag: '💬 1-Click Outreach',
    gradient: 'linear-gradient(135deg, #0d9488, #14b8a6)',
  },
  {
    icon: <FaFolderOpen />,
    title: 'Property Document Checklist',
    desc: 'Track ownership titles, floor plans, RERA approvals, and KYC. Know immediately if a listing is verified or missing key transactional paperwork.',
    tag: '📋 Compliance Ready',
    gradient: 'linear-gradient(135deg, #4f46e5, #6366f1)',
  },
  {
    icon: <FaUsers />,
    title: 'Granular Agent Data Isolation',
    desc: 'Agents access only their assigned leads and properties. Sensitive seller contacts and internal notes remain strictly protected across team members.',
    tag: '🛡️ Zero Leakage',
    gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Enterprise Multi-Tenancy',
    desc: 'Bank-grade business-level data scoping, automated trial expiration locking, and full audit logging for administrative accountability.',
    tag: '🏦 Enterprise Grade',
    gradient: 'linear-gradient(135deg, #1e293b, #334155)',
  },
];

export const Features = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = document.querySelectorAll('.feature-item');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('visible');
              }, index * 80);
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
    <section id="features" className="features-section" ref={sectionRef}>
      {/* Decorative Background Elements */}
      <div className="features-bg-blob blob-1"></div>
      <div className="features-bg-blob blob-2"></div>

      <div className="features-container">
        {/* Header */}
        <div className="section-header">
          <span className="section-kicker">
            <span className="kicker-line"></span>
            Core Capabilities
            <span className="kicker-line"></span>
          </span>
          <h2 className="section-title">
            Built for Real Estate <span className="title-highlight">Professionals</span>
          </h2>
          <p className="section-subtitle">
            Not a generic CRM. A unified operational workspace designed around the lifecycle of properties, viewings, and transactions.
          </p>
          <div className="section-stats-mini">
            <span className="stat-badge">
              <FaRocket className="stat-badge-icon" />
              8 Powerful Modules
            </span>
            <span className="stat-badge">
              <FaCrown className="stat-badge-icon" />
              Enterprise Ready
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {featureList.map((f, idx) => (
            <div 
              key={idx} 
              className="feature-item"
              style={{ '--gradient': f.gradient }}
              data-delay={idx * 80}
            >
              <div className="feature-card-inner">
                <div className="feature-icon-box" style={{ background: f.gradient }}>
                  {f.icon}
                </div>
                <div className="feature-tag">{f.tag}</div>
                <h3 className="feature-item-title">{f.title}</h3>
                <p className="feature-item-desc">{f.desc}</p>
                <div className="feature-learn-more">
                  <span>Learn More</span>
                  <FaArrowRight className="feature-arrow" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="features-cta">
          <p>Ready to transform your real estate business?</p>
          <a href="/onboarding" className="features-cta-btn">
            Start Your Free Trial <FaArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
};
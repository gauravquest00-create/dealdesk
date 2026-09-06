import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { openHouseApi } from '../services/api/services.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { DealDeskLogo } from '../components/DealDeskLogo.jsx';
import { FaDoorOpen, FaCheckCircle, FaGlobe, FaLanguage } from 'react-icons/fa';

export const PublicOpenHouseReg = () => {
  const { eventQrCode } = useParams();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  // Navigate to landing page
  const goHome = () => {
    const landingUrl = import.meta.env.VITE_LANDING_URL || '/';
    window.location.href = landingUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await openHouseApi.registerVisitor({ eventQrCode, name, phone, email });
      setSuccess(true);
    } catch (err) {
      alert(err.message || 'Check-in failed');
    }
  };

  // Language & currency options
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ar', label: 'العربية' },
  ];

  const currencyOptions = [
    { code: 'USD', label: 'USD $' },
    { code: 'INR', label: 'INR ₹' },
    { code: 'AED', label: 'AED' },
    { code: 'GBP', label: 'GBP £' },
    { code: 'EUR', label: 'EUR €' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#0f172a', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ cursor: 'pointer' }} onClick={goHome} title="Go to DealDesk Home">
            <DealDeskLogo size="sm" theme="dark" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 6 }}>
                <FaLanguage style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }} />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    padding: '2px 0',
                    minWidth: 50,
                  }}
                >
                  {languageOptions.map(opt => (
                    <option key={opt.code} value={opt.code} style={{ background: '#1e293b' }}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 6 }}>
                <FaGlobe style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }} />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    padding: '2px 0',
                    minWidth: 50,
                  }}
                >
                  {currencyOptions.map(opt => (
                    <option key={opt.code} value={opt.code} style={{ background: '#1e293b' }}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ maxWidth: 440, width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eff6ff', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
            <FaDoorOpen />
          </div>

          <h2 style={{ textAlign: 'center', fontSize: '1.375rem', fontWeight: 700, color: '#0f172a' }}>Open House Guest Check-In</h2>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', margin: '8px 0 24px' }}>Welcome! Please sign in to tour the residence.</p>

          {success ? (
            <div style={{ textAlign: 'center', color: '#16a34a', padding: 16 }}>
              <FaCheckCircle size={48} />
              <h3 style={{ marginTop: 12 }}>Check-In Confirmed</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>Enjoy your tour! An advisor is on-site to assist you.</p>
              {/* Explore DealDesk Button */}
              <button
                onClick={goHome}
                style={{
                  marginTop: 16,
                  background: '#1e3a8a',
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Explore DealDesk
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Your Name</label>
                <input type="text" required style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 6 }} value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone (WhatsApp)</label>
                <input type="text" required style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 6 }} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
                <input type="email" style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 6 }} value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <button type="submit" style={{ background: '#1e3a8a', color: '#fff', padding: 12, border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
                Check In & Begin Tour
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { openHouseApi } from '../services/api/services.js';
import { FaDoorOpen, FaCheckCircle } from 'react-icons/fa';

export const PublicOpenHouseReg = () => {
  const { eventQrCode } = useParams();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await openHouseApi.registerVisitor({ eventQrCode, name, phone, email });
      setSuccess(true);
    } catch (err) {
      alert(err.message || 'Check-in failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 16, fontFamily: 'sans-serif' }}>
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
  );
};

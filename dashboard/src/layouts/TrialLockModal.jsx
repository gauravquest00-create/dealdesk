import React from 'react';
import { FaLock, FaShieldAlt } from 'react-icons/fa';

export const TrialLockModal = ({ onChoosePlan }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16
    }}>
      <div style={{
        background: '#ffffff',
        maxWidth: 480,
        width: '100%',
        borderRadius: 16,
        padding: 32,
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#fef3c7',
          color: '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          margin: '0 auto 16px'
        }}>
          <FaLock />
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          Your 3-Day Free Trial Has Expired
        </h3>

        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
          Your workspace and data are completely safe. Continue using DealDesk by choosing a subscription plan.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          color: '#16a34a',
          fontSize: '0.8125rem',
          fontWeight: 600,
          marginBottom: 24
        }}>
          <FaShieldAlt /> All listings, leads & QR codes intact
        </div>

        <button 
          onClick={onChoosePlan}
          style={{
            width: '100%',
            background: '#1e3a8a',
            color: '#ffffff',
            padding: 12,
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: 'pointer'
          }}
        >
          Select Subscription Plan
        </button>
      </div>
    </div>
  );
};

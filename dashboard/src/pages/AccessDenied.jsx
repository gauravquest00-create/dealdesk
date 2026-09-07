// src/pages/AccessDenied.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

export const AccessDenied = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '20px',
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '40px 30px',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        maxWidth: '440px',
        width: '100%',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '28px'
        }}>
          <FaLock />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          Access Denied
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
          You do not have sufficient permissions to view this property.
          Contact your workspace administrator for access.
        </p>
        <Link
          to="/app"
          style={{
            display: 'inline-block',
            background: '#2563eb',
            color: '#ffffff',
            padding: '10px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'background 0.15s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.background = '#2563eb'}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

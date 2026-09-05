import React from 'react';

export const DealDeskLogo = ({ size = 'md', collapsed = false, theme = 'dark', subtext = 'WORKSPACE', className = '' }) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 46,
    xl: 60,
  };

  const currentSize = iconSizes[size] || 36;
  const isDarkTheme = theme === 'dark';

  return (
    <div className={`dd-brand-logo-container ${size} ${theme} ${className}`} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size === 'sm' ? 8 : 12,
      textDecoration: 'none',
      cursor: 'pointer',
      userSelect: 'none',
    }}>
      {/* Real Estate "DD" Monogram Squircle Icon */}
      <svg 
        width={currentSize} 
        height={currentSize} 
        viewBox="0 0 512 512" 
        style={{ flexShrink: 0, display: 'block', borderRadius: currentSize * 0.22 }}
      >
        <defs>
          <linearGradient id="ddBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a"/>
            <stop offset="100%" stopColor="#0b1120"/>
          </linearGradient>
          <linearGradient id="ddD1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa"/>
            <stop offset="100%" stopColor="#2563eb"/>
          </linearGradient>
          <linearGradient id="ddD2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8"/>
            <stop offset="100%" stopColor="#0284c7"/>
          </linearGradient>
        </defs>

        {/* Background Squircle */}
        <rect x="24" y="24" width="464" height="464" rx="116" fill="url(#ddBgGrad)"/>
        <rect x="24" y="24" width="464" height="464" rx="116" fill="none" stroke="#60a5fa" strokeWidth="8" strokeOpacity="0.3"/>

        {/* Left 'D' in Royal Blue */}
        <path d="M 116 136 L 212 136 C 286 136 338 184 338 256 C 338 328 286 376 212 376 L 116 376 Z M 172 192 L 206 192 C 248 192 278 218 278 256 C 278 294 248 320 206 320 L 172 320 Z" fill="url(#ddD1Grad)" opacity="0.95"/>

        {/* Right 'D' in Vibrant Cyan / Sky Blue (Offset Interlocking) */}
        <path d="M 226 136 L 312 136 C 386 136 432 184 432 256 C 432 328 386 376 312 376 L 226 376 Z M 282 192 L 306 192 C 348 192 372 218 372 256 C 372 294 348 320 306 320 L 282 320 Z" fill="url(#ddD2Grad)"/>

        {/* Architectural Deal Dot */}
        <circle cx="396" cy="136" r="22" fill="#38bdf8"/>
        <circle cx="396" cy="136" r="14" fill="#ffffff"/>
      </svg>

      {/* Brand Typography (Hidden if sidebar collapsed) */}
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{
            fontSize: size === 'sm' ? '1.125rem' : size === 'lg' ? '1.5rem' : size === 'xl' ? '2rem' : '1.3125rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: isDarkTheme ? '#ffffff' : '#0f172a',
            display: 'flex',
            alignItems: 'baseline',
          }}>
            Deal<span style={{ color: '#2563eb' }}>Desk</span>
          </div>
          {subtext && (
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: '#38bdf8',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

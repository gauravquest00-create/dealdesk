import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCY_SYMBOLS = {
  USD: '$',
  CAD: 'CA$',
  GBP: '£',
  AED: 'AED ',
  AUD: 'A$',
  EUR: '€',
  INR: '₹',
};

export const CURRENCY_RATES = {
  USD: 1.0,
  CAD: 1.35,
  GBP: 0.79,
  AED: 3.67,
  AUD: 1.52,
  EUR: 0.92,
  INR: 83.5,
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('dealdesk_curr_sa') || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('dealdesk_curr_sa', currency);
  }, [currency]);

  const convertPrice = (usdAmount) => {
    const rate = CURRENCY_RATES[currency] || 1.0;
    return Math.round(usdAmount * rate);
  };

  const formatPrice = (usdAmount) => {
    const converted = convertPrice(usdAmount || 0);
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        symbol: CURRENCY_SYMBOLS[currency] || '$',
        rates: CURRENCY_RATES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
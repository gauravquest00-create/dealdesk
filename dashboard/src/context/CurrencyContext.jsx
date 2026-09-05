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

// Fallback static rates (used if API fails)
const STATIC_RATES = {
  USD: 1.0,
  CAD: 1.35,
  GBP: 0.79,
  AED: 3.67,
  AUD: 1.52,
  EUR: 0.92,
  INR: 83.5,
};

const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const CACHE_KEY = 'dealdesk_currency_rates';
const CACHE_TIME_KEY = 'dealdesk_rates_last_fetched';
const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('dealdesk_curr') || 'USD';
  });

  const [rates, setRates] = useState(() => {
    // Try to load from cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return { ...STATIC_RATES };
      }
    }
    return { ...STATIC_RATES };
  });

  const [ratesLoading, setRatesLoading] = useState(true);

  // Fetch real-time rates
  const fetchRates = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch rates');
      const data = await response.json();
      if (data.rates) {
        // Keep only the currencies we support
        const supportedRates = {};
        Object.keys(CURRENCY_SYMBOLS).forEach((key) => {
          supportedRates[key] = data.rates[key] || STATIC_RATES[key];
        });
        setRates(supportedRates);
        localStorage.setItem(CACHE_KEY, JSON.stringify(supportedRates));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      }
    } catch (error) {
      console.warn('Failed to fetch exchange rates, using fallback:', error);
      // Keep existing rates or fallback to static
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          setRates(JSON.parse(cached));
        } catch {
          setRates({ ...STATIC_RATES });
        }
      } else {
        setRates({ ...STATIC_RATES });
      }
    } finally {
      setRatesLoading(false);
    }
  };

  // Fetch on mount and set interval for refresh
  useEffect(() => {
    const lastFetched = localStorage.getItem(CACHE_TIME_KEY);
    const shouldFetch = !lastFetched || (Date.now() - parseInt(lastFetched) > REFRESH_INTERVAL);

    if (shouldFetch) {
      fetchRates();
    } else {
      // Load from cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          setRates(JSON.parse(cached));
        } catch {
          setRates({ ...STATIC_RATES });
        }
      }
      setRatesLoading(false);
    }

    // Set up periodic refresh
    const intervalId = setInterval(fetchRates, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  // Update localStorage when currency changes
  useEffect(() => {
    localStorage.setItem('dealdesk_curr', currency);
  }, [currency]);

  const convertPrice = (usdAmount) => {
    const rate = rates[currency] || rates.USD || 1.0;
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
        rates,
        ratesLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
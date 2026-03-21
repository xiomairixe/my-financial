import { createContext, useContext, useMemo } from 'react';

const CurrencyContext = createContext('$');

// Maps currency string → symbol
const SYMBOL_MAP = {
  'USD ($)': '$',
  'EUR (€)': '€',
  'GBP (£)': '£',
  'JPY (¥)': '¥',
  'PHP (₱)': '₱',
};

export function CurrencyProvider({ currency, children }) {
  const symbol = useMemo(() => SYMBOL_MAP[currency] || '$', [currency]);
  return (
    <CurrencyContext.Provider value={symbol}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook — gamitin sa lahat ng pages: const currency = useCurrency();
export function useCurrency() {
  return useContext(CurrencyContext);
}
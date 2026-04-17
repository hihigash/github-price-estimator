import { useState, useCallback } from 'react';

export type CurrencyCode = 'JPY' | 'USD';

const DEFAULT_EXCHANGE_RATE = 150;

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>('JPY');
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);

  const formatPrice = useCallback(
    (amountUSD: number): string => {
      if (currency === 'USD') {
        return (
          '$' +
          amountUSD.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        );
      }
      const jpyAmount = Math.round(amountUSD * exchangeRate);
      return (
        '¥' +
        jpyAmount.toLocaleString('ja-JP')
      );
    },
    [currency, exchangeRate],
  );

  const currencyLabel = currency === 'JPY' ? '円' : 'USD';
  const taxNote = currency === 'JPY' ? '税抜・参考値' : '税抜・USD';

  return {
    currency,
    setCurrency,
    exchangeRate,
    setExchangeRate,
    formatPrice,
    currencyLabel,
    taxNote,
  };
}

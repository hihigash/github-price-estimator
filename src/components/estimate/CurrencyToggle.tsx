import type { CurrencyCode } from '../../hooks/useCurrency';

interface CurrencyToggleProps {
  currency: CurrencyCode;
  onToggle: (currency: CurrencyCode) => void;
  exchangeRate: number;
  onRateChange: (rate: number) => void;
}

export function CurrencyToggle({
  currency,
  onToggle,
  exchangeRate,
  onRateChange,
}: CurrencyToggleProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Segmented toggle */}
      <div className="inline-flex rounded-md shadow-2xs">
        <button
          type="button"
          onClick={() => onToggle('JPY')}
          className={`py-2 px-3 inline-flex items-center gap-x-1 -ms-px first:rounded-s-md first:ms-0 last:rounded-e-md text-xs font-medium border focus:z-10 transition-colors ${
            currency === 'JPY'
              ? 'bg-gray-800 text-white border-gray-800 dark:bg-neutral-200 dark:text-neutral-900 dark:border-neutral-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-800'
          }`}
        >
          ¥ 円
        </button>
        <button
          type="button"
          onClick={() => onToggle('USD')}
          className={`py-2 px-3 inline-flex items-center gap-x-1 -ms-px first:rounded-s-md first:ms-0 last:rounded-e-md text-xs font-medium border focus:z-10 transition-colors ${
            currency === 'USD'
              ? 'bg-gray-800 text-white border-gray-800 dark:bg-neutral-200 dark:text-neutral-900 dark:border-neutral-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-800'
          }`}
        >
          $ USD
        </button>
      </div>

      {currency === 'JPY' && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
          <span>レート:</span>
          <span>$1 =</span>
          <input
            type="number"
            min={1}
            step={0.1}
            value={exchangeRate}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v > 0) onRateChange(v);
            }}
            className="py-1 px-2 block w-16 border border-gray-200 rounded-md text-xs text-center focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300"
          />
          <span>円</span>
        </div>
      )}
    </div>
  );
}

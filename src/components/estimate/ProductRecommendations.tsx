import { useState, useEffect } from 'react';
import type { ProductRecommendation, SkuAlternative } from '../../engine/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ProductRecommendationsProps {
  recommendations: ProductRecommendation[];
  formatPrice: (amountUSD: number) => string;
  onSwapSku?: (breakdownId: string, unitPrice: number) => void;
}

// Map recommendation product ID to breakdown item ID
const recIdToBreakdownId: Record<string, string> = {
  plan: 'plan',
  copilot: 'copilot',
};

function AlternativeRow({
  alt,
  formatPrice,
  onSwap,
}: {
  alt: SkuAlternative;
  formatPrice: (amountUSD: number) => string;
  onSwap?: () => void;
}) {
  const isNegative = alt.monthlyDiff.min < 0;
  const diffLabel =
    alt.monthlyDiff.min === alt.monthlyDiff.max
      ? `${isNegative ? '' : '+'}${formatPrice(alt.monthlyDiff.min)}/月`
      : `${isNegative ? '' : '+'}${formatPrice(alt.monthlyDiff.min)} 〜 ${isNegative ? '' : '+'}${formatPrice(alt.monthlyDiff.max)}/月`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 py-3 border-t border-gray-100 dark:border-neutral-700 first:border-t-0">
      <div className="grow">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{alt.name}</span>
          <span className={`text-xs font-semibold tabular-nums ${isNegative ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {diffLabel}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
          {alt.reason}
        </p>
      </div>
      {onSwap && (
        <button
          type="button"
          onClick={onSwap}
          className="shrink-0 py-1.5 px-3 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
        >
          この SKU で見積もる
        </button>
      )}
    </div>
  );
}

function RecommendationCard({
  rec,
  formatPrice,
  onSwapSku,
}: {
  rec: ProductRecommendation;
  formatPrice: (amountUSD: number) => string;
  onSwapSku?: (breakdownId: string, unitPrice: number) => void;
}) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Preline accordion re-init
  useEffect(() => {
    window.HSStaticMethods?.autoInit();
  }, [showAlternatives]);

  const breakdownId = recIdToBreakdownId[rec.id];

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="grow">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
              {rec.productName}
            </h4>
            <Badge variant="info">{rec.selectedSku}</Badge>
          </div>
        </div>
      </div>

      {/* Overview */}
      <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed mb-3">
        {rec.overview}
      </p>

      {/* Appeal Points */}
      <div className="mb-3">
        <ul className="space-y-1.5">
          {rec.appealPoints.map((point, i) => {
            const isHearing = point.startsWith('ヒアリング結果:');
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 shrink-0 ${isHearing ? 'text-blue-500 font-bold' : 'text-gray-400 dark:text-neutral-500'}`}>
                  {isHearing ? '▸' : '–'}
                </span>
                <span className={isHearing ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-neutral-400'}>
                  {point}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* SKU Selection Reason */}
      <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md p-3 mb-3">
        <p className="text-xs text-gray-700 dark:text-neutral-300 leading-relaxed">
          <span className="font-semibold">選定理由: </span>
          {rec.selectedSkuReason}
        </p>
      </div>

      {/* Alternatives */}
      {rec.alternatives.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="inline-flex items-center gap-x-1 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
          >
            <svg
              className={`size-3.5 transition-transform duration-200 ${showAlternatives ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            対抗 SKU との比較（{rec.alternatives.length}件）
          </button>

          {showAlternatives && (
            <div className="mt-2 bg-gray-50 dark:bg-neutral-800/50 rounded-md p-3">
              {rec.alternatives.map((alt, i) => (
                <AlternativeRow
                  key={i}
                  alt={alt}
                  formatPrice={formatPrice}
                  onSwap={
                    breakdownId && onSwapSku
                      ? () => onSwapSku(breakdownId, alt.unitPrice)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function ProductRecommendations({ recommendations, formatPrice, onSwapSku }: ProductRecommendationsProps) {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-800 dark:text-neutral-200 mb-1">
        推奨製品と選定理由
      </h3>
      <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
        ヒアリング結果に基づき、以下の製品構成を推奨します。
      </p>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} formatPrice={formatPrice} onSwapSku={onSwapSku} />
        ))}
      </div>
    </div>
  );
}

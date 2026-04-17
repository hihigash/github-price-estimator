import { useEffect } from 'react';
import type { EstimateResult } from '../../engine/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CurrencyToggle } from './CurrencyToggle';
import { ProductRecommendations } from './ProductRecommendations';
import { useCurrency } from '../../hooks/useCurrency';
import { useEstimateAdjustment } from '../../hooks/useEstimateAdjustment';
import type { AdjustedBreakdownItem } from '../../hooks/useEstimateAdjustment';

interface EstimateResultViewProps {
  result: EstimateResult;
  onReset: () => void;
}

const planLabels: Record<string, string> = {
  free: 'Free',
  team: 'GitHub Team',
  enterprise: 'GitHub Enterprise Cloud',
};

const copilotLabels: Record<string, string> = {
  none: 'なし',
  business: 'Copilot Business',
  enterprise: 'Copilot Enterprise',
};

const securityLabels: Record<string, string> = {
  none: 'なし',
  secret: 'Secret Protection',
  code: 'Code Security',
  both: 'Secret Protection + Code Security',
};

const automationLabels: Record<string, string> = {
  low: '低（手作業中心）',
  medium: '中',
  high: '高（高度に自動化）',
};

const codespacesLabels: Record<string, string> = {
  none: '見送り',
  partial: '一部導入',
  wide: '広め導入',
};

const confidenceConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  high: { label: '高', variant: 'success' },
  medium: { label: '中', variant: 'warning' },
  low: { label: '低', variant: 'default' },
};

function QuantityControl({
  item,
  override,
  onSetQuantity,
  onClearQuantity,
}: {
  item: AdjustedBreakdownItem;
  override?: { quantity?: number; excluded: boolean };
  onSetQuantity: (id: string, qty: number) => void;
  onClearQuantity: (id: string) => void;
}) {
  if (!item.adjustable || item.isExcluded) return null;

  const current = override?.quantity;
  const isOverridden = current !== undefined;
  const displayQty = current ?? item.quantity.min;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onSetQuantity(item.id, Math.max(0, displayQty - 1))}
        className="size-7 inline-flex justify-center items-center text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-600 shadow-2xs hover:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        value={isOverridden ? current : ''}
        placeholder={`${item.quantity.min}〜${item.quantity.max}`}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= 0) onSetQuantity(item.id, v);
          else if (e.target.value === '') onClearQuantity(item.id);
        }}
        className="py-1 px-1.5 block w-20 border border-gray-200 rounded-md text-xs text-center focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300"
      />
      <button
        type="button"
        onClick={() => onSetQuantity(item.id, displayQty + 1)}
        className="size-7 inline-flex justify-center items-center text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-600 shadow-2xs hover:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
      >
        +
      </button>
      {isOverridden && (
        <button
          type="button"
          onClick={() => onClearQuantity(item.id)}
          className="ms-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          title="推定値に戻す"
        >
          リセット
        </button>
      )}
    </div>
  );
}

export function EstimateResultView({ result, onReset }: EstimateResultViewProps) {
  const conf = confidenceConfig[result.confidence];
  const { currency, setCurrency, exchangeRate, setExchangeRate, formatPrice, taxNote } =
    useCurrency();
  const {
    overrides,
    toggleExclude,
    setQuantity,
    clearQuantity,
    setUnitPrice,
    adjustedBreakdown,
    adjustedMonthly,
    adjustedAnnual,
  } = useEstimateAdjustment(result.breakdown);

  const hasAdjustments = Object.keys(overrides).length > 0;

  // Preline accordion re-init
  useEffect(() => {
    window.HSStaticMethods?.autoInit();
  }, []);

  return (
    <div className="space-y-6">
      {/* Cost Summary Header */}
      <Card className="border-gray-300 dark:border-neutral-600">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-neutral-200">
            見積もり結果
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-neutral-400">確度:</span>
            <Badge variant={conf.variant}>{conf.label}</Badge>
            {result.assumptionCount > 0 && (
              <Badge variant="warning">仮定 {result.assumptionCount}件</Badge>
            )}
          </div>
        </div>

        {/* Currency toggle */}
        <div className="mb-4">
          <CurrencyToggle
            currency={currency}
            onToggle={setCurrency}
            exchangeRate={exchangeRate}
            onRateChange={setExchangeRate}
          />
        </div>

        {/* Monthly/Annual cost */}
        <div className="grid sm:grid-cols-2 gap-4 mb-2">
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
            <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">月額（{taxNote}）</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-neutral-200 tabular-nums">
              {adjustedMonthly.min === adjustedMonthly.max
                ? formatPrice(adjustedMonthly.min)
                : `${formatPrice(adjustedMonthly.min)} 〜 ${formatPrice(adjustedMonthly.max)}`}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
            <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">年額（{taxNote}）</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-neutral-200 tabular-nums">
              {adjustedAnnual.min === adjustedAnnual.max
                ? formatPrice(adjustedAnnual.min)
                : `${formatPrice(adjustedAnnual.min)} 〜 ${formatPrice(adjustedAnnual.max)}`}
            </p>
          </div>
        </div>
        {hasAdjustments && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            ※ 手動調整が反映されています
          </p>
        )}
      </Card>

      {/* Configuration Overview */}
      <Card>
        <h4 className="text-sm font-bold text-gray-800 dark:text-neutral-200 mb-4">推定構成</h4>
        <div className="divide-y divide-gray-100 dark:divide-neutral-700">
          {[
            { label: '基本プラン', value: planLabels[result.plan] },
            { label: '効率化', value: copilotLabels[result.copilotPlan] },
            { label: 'セキュリティ', value: securityLabels[result.securitySku] },
            { label: '自動化', value: automationLabels[result.automationLevel] },
            { label: '開発環境', value: codespacesLabels[result.codespacesLevel] },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm py-2.5">
              <span className="text-gray-600 dark:text-neutral-400">{label}</span>
              <span className="font-medium text-gray-800 dark:text-neutral-200">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Product Recommendations — before breakdown */}
      {result.recommendations.length > 0 && (
        <ProductRecommendations
          recommendations={result.recommendations}
          formatPrice={formatPrice}
          onSwapSku={(breakdownId, unitPrice) => setUnitPrice(breakdownId, unitPrice)}
        />
      )}

      {/* Breakdown — interactive */}
      <Card>
        <h4 className="text-sm font-bold text-gray-800 dark:text-neutral-200 mb-2">内訳</h4>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mb-4">
          チェックを外すと合計から除外されます。数量は手動で調整できます。
        </p>

        <div className="space-y-3">
          {adjustedBreakdown.map((item) => {
            const override = overrides[item.id];
            return (
              <div
                key={item.id}
                className={`rounded-lg border p-4 transition-colors ${
                  item.isExcluded
                    ? 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 opacity-50'
                    : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                }`}
              >
                {/* Row header: checkbox + label + cost */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={!item.isExcluded}
                      onChange={() => toggleExclude(item.id)}
                      className="shrink-0 border-gray-300 rounded-sm text-blue-600 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-neutral-800 cursor-pointer"
                    />
                  </div>
                  <div className="grow min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${item.isExcluded ? 'line-through text-gray-400 dark:text-neutral-500' : 'text-gray-800 dark:text-neutral-200'}`}>
                        {item.label}
                      </span>
                      <span className={`text-sm font-bold tabular-nums ${item.isExcluded ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-800 dark:text-neutral-200'}`}>
                        {item.adjustedCost.min === item.adjustedCost.max
                          ? `${formatPrice(item.adjustedCost.min)}/月`
                          : `${formatPrice(item.adjustedCost.min)} 〜 ${formatPrice(item.adjustedCost.max)}/月`}
                      </span>
                    </div>

                    {/* Explanation */}
                    {!item.isExcluded && item.explanation && (
                      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                        {item.explanation}
                      </p>
                    )}

                    {/* Detail + quantity control */}
                    {!item.isExcluded && (
                      <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                          {item.detail}
                        </span>
                        <QuantityControl
                          item={item}
                          override={override}
                          onSetQuantity={setQuantity}
                          onClearQuantity={clearQuantity}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-neutral-600">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800 dark:text-neutral-200">合計/月</span>
            <span className="text-lg font-bold text-gray-800 dark:text-neutral-200 tabular-nums">
              {adjustedMonthly.min === adjustedMonthly.max
                ? formatPrice(adjustedMonthly.min)
                : `${formatPrice(adjustedMonthly.min)} 〜 ${formatPrice(adjustedMonthly.max)}`}
            </span>
          </div>
        </div>
      </Card>

      {/* Reference info — Preline accordion */}
      <Card>
        <div className="hs-accordion-group">
          <div className="hs-accordion" id="hs-ref-accordion">
            <button
              type="button"
              className="hs-accordion-toggle w-full flex items-center justify-between text-left group py-1"
              aria-expanded="false"
              aria-controls="hs-ref-accordion-body"
            >
              <h4 className="text-sm font-bold text-gray-800 dark:text-neutral-200">
                参考情報
              </h4>
              <svg
                className="hs-accordion-active:hidden block size-4 text-gray-400 dark:text-neutral-500 group-hover:text-gray-600 dark:group-hover:text-neutral-300 transition-colors"
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
              <svg
                className="hs-accordion-active:block hidden size-4 text-gray-400 dark:text-neutral-500 group-hover:text-gray-600 dark:group-hover:text-neutral-300 transition-colors"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            </button>

            <div
              id="hs-ref-accordion-body"
              className="hs-accordion-content hidden w-full overflow-hidden transition-[height] duration-300"
              role="region"
              aria-labelledby="hs-ref-accordion"
            >
              <div className="pt-4 space-y-6">
                {/* Explanations */}
                {result.explanations.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">推定の根拠</h5>
                    <ul className="space-y-2">
                      {result.explanations.map((e, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-neutral-400 flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5 shrink-0">•</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Assumptions */}
                {result.assumptions.length > 0 && (
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">仮定した項目</h5>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                      未回答項目は保守的に見積もっています。
                    </p>
                    <ul className="space-y-1">
                      {result.assumptions.map((a, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-neutral-400 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5 shrink-0">!</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Variable Factors */}
                {result.variableFactors.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">変動しやすい点</h5>
                    <ul className="space-y-1">
                      {result.variableFactors.map((f, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-neutral-400 flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5 shrink-0">—</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Reset */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onReset}
          className="py-2.5 px-6 inline-flex items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-700 shadow-2xs hover:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
        >
          最初からやり直す
        </button>
      </div>
    </div>
  );
}

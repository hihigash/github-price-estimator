import { useState, useMemo, useCallback } from 'react';
import type { BreakdownItem, CostRange } from '../engine/types';

export interface AdjustmentOverride {
  quantity?: number;
  excluded: boolean;
  unitPrice?: number;
}

export interface AdjustedBreakdownItem extends BreakdownItem {
  isExcluded: boolean;
  adjustedCost: CostRange;
  adjustedQuantity?: number;
  adjustedUnitPrice?: number;
}

export function useEstimateAdjustment(breakdown: BreakdownItem[]) {
  const [overrides, setOverrides] = useState<Record<string, AdjustmentOverride>>({});

  const toggleExclude = useCallback((id: string) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        excluded: !(prev[id]?.excluded ?? false),
      },
    }));
  }, []);

  const setQuantity = useCallback((id: string, qty: number) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: Math.max(0, qty),
        excluded: prev[id]?.excluded ?? false,
      },
    }));
  }, []);

  const clearQuantity = useCallback((id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (next[id]) {
        next[id] = { ...next[id], quantity: undefined };
      }
      return next;
    });
  }, []);

  const setUnitPrice = useCallback((id: string, price: number) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        excluded: prev[id]?.excluded ?? false,
        unitPrice: price,
      },
    }));
  }, []);

  const clearUnitPrice = useCallback((id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (next[id]) {
        next[id] = { ...next[id], unitPrice: undefined };
      }
      return next;
    });
  }, []);

  const adjustedBreakdown: AdjustedBreakdownItem[] = useMemo(() => {
    return breakdown.map((item) => {
      const override = overrides[item.id];
      if (!override) {
        return { ...item, isExcluded: false, adjustedCost: item.cost };
      }

      if (override.excluded) {
        return { ...item, isExcluded: true, adjustedCost: { min: 0, max: 0 } };
      }

      const effectiveUnitPrice = override.unitPrice ?? item.unitPrice;
      const hasUnitPriceOverride = override.unitPrice !== undefined;

      if (override.quantity !== undefined && item.adjustable) {
        const cost = override.quantity * effectiveUnitPrice;
        return {
          ...item,
          isExcluded: false,
          adjustedCost: { min: cost, max: cost },
          adjustedQuantity: override.quantity,
          adjustedUnitPrice: hasUnitPriceOverride ? effectiveUnitPrice : undefined,
        };
      }

      if (hasUnitPriceOverride) {
        return {
          ...item,
          isExcluded: false,
          adjustedCost: {
            min: item.quantity.min * effectiveUnitPrice,
            max: item.quantity.max * effectiveUnitPrice,
          },
          adjustedUnitPrice: effectiveUnitPrice,
        };
      }

      return { ...item, isExcluded: false, adjustedCost: item.cost };
    });
  }, [breakdown, overrides]);

  const adjustedMonthly: CostRange = useMemo(() => {
    return adjustedBreakdown.reduce(
      (acc, item) => ({
        min: acc.min + (item.isExcluded ? 0 : item.adjustedCost.min),
        max: acc.max + (item.isExcluded ? 0 : item.adjustedCost.max),
      }),
      { min: 0, max: 0 },
    );
  }, [adjustedBreakdown]);

  const adjustedAnnual: CostRange = useMemo(
    () => ({ min: adjustedMonthly.min * 12, max: adjustedMonthly.max * 12 }),
    [adjustedMonthly],
  );

  const resetOverrides = useCallback(() => setOverrides({}), []);

  return {
    overrides,
    toggleExclude,
    setQuantity,
    clearQuantity,
    setUnitPrice,
    clearUnitPrice,
    adjustedBreakdown,
    adjustedMonthly,
    adjustedAnnual,
    resetOverrides,
  };
}

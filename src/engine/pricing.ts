import type { CostRange, PlanTier } from './types';

export const SEAT_RANGES: Record<number, CostRange> = {
  1: { min: 1, max: 1 },
  2: { min: 2, max: 5 },
  3: { min: 6, max: 20 },
  4: { min: 21, max: 50 },
  5: { min: 51, max: 200 },
  6: { min: 201, max: 500 },
};

export const ACTIVE_RATIOS: Record<number, CostRange> = {
  4: { min: 0.85, max: 1.0 },
  3: { min: 0.65, max: 0.80 },
  2: { min: 0.45, max: 0.60 },
  1: { min: 0.15, max: 0.35 },
};

export const COPILOT_RATIOS: Record<number, CostRange> = {
  4: { min: 0.80, max: 1.0 },
  3: { min: 0.45, max: 0.65 },
  2: { min: 0.15, max: 0.35 },
  1: { min: 0.00, max: 0.10 },
};

export const MINUTES_PER_RUN: Record<number, CostRange> = {
  1: { min: 5, max: 10 },
  2: { min: 10, max: 25 },
  3: { min: 25, max: 60 },
  4: { min: 40, max: 120 },
};

export const RUNS_PER_MONTH: Record<number, CostRange> = {
  1: { min: 20, max: 80 },
  2: { min: 80, max: 250 },
  3: { min: 250, max: 1000 },
  4: { min: 1000, max: 5000 },
};

export const HOSTED_RATIOS: Record<number, CostRange> = {
  1: { min: 0.0, max: 0.1 },
  2: { min: 0.1, max: 0.3 },
  3: { min: 0.5, max: 0.8 },
  4: { min: 0.3, max: 0.6 }, // 未定
};

export const SECURITY_SCOPE_RATIOS: Record<number, CostRange> = {
  1: { min: 0.20, max: 0.35 },
  2: { min: 0.45, max: 0.60 },
  3: { min: 0.75, max: 0.90 },
  4: { min: 0.95, max: 1.00 },
};

export const PRICES = {
  plans: { free: 0, team: 4, enterprise: 21 } as Record<PlanTier, number>,
  copilot: { none: 0, business: 19, enterprise: 39 } as Record<string, number>,
  security: { secretProtection: 19, codeSecurity: 30 },
  actions: { linux: 0.006, windows: 0.010, macos: 0.062 },
  codespaces: { compute2core: 0.18, storage: 0.07 },
  freeMinutes: { free: 2000, team: 3000, enterprise: 50000 } as Record<PlanTier, number>,
} as const;

// OS blending multipliers relative to Linux
export const OS_MULTIPLIERS: Record<number, number> = {
  1: 1.0,    // Linux only
  2: 1.3,    // + Windows (blended)
  3: 3.0,    // + macOS (blended)
  1.5: 1.0,  // Unknown → assume Linux
};

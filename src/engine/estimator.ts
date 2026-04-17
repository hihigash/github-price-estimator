import type {
  Answers,
  AutomationLevel,
  CodespacesLevel,
  Confidence,
  CopilotPlan,
  CostRange,
  EstimateResult,
  EstimateOptions,
  SecuritySku,
  BreakdownItem,
} from './types';
import {
  SEAT_RANGES,
  ACTIVE_RATIOS,
  COPILOT_RATIOS,
  MINUTES_PER_RUN,
  RUNS_PER_MONTH,
  HOSTED_RATIOS,
  SECURITY_SCOPE_RATIOS,
  PRICES,
  OS_MULTIPLIERS,
} from './pricing';
import { determinePlan } from './planDetermination';
import {
  generateExplanations,
  generateAssumptions,
  generateVariableFactors,
} from './explanations';
import { generateProductExplanation } from './productExplanations';
import { generateRecommendations } from './productRecommendations';

function clampRange(r: CostRange): CostRange {
  return { min: Math.max(0, r.min), max: Math.max(0, r.max) };
}

function multiplyRanges(a: CostRange, b: CostRange): CostRange {
  return { min: a.min * b.min, max: a.max * b.max };
}

export function estimate(answers: Answers, options?: EstimateOptions): EstimateResult {
  const q1 = answers.Q1 ?? 2;
  const q2 = answers.Q2 ?? 2;
  const q4 = answers.Q4 ?? 1;
  const q5 = answers.Q5 ?? 1;

  // 1. Seat range — support custom input
  let seats: CostRange;
  if (q1 === 0 && options?.customSeatCount !== undefined && options.customSeatCount > 0) {
    const n = options.customSeatCount;
    seats = { min: n, max: n };
  } else {
    seats = SEAT_RANGES[q1] ?? { min: 2, max: 5 };
  }

  // 2. Active developers
  const activeRatio = ACTIVE_RATIOS[q2] ?? { min: 0.45, max: 0.60 };
  const activeDev: CostRange = {
    min: Math.max(1, Math.ceil(seats.min * activeRatio.min)),
    max: Math.ceil(seats.max * activeRatio.max),
  };

  // 3. Plan
  const plan = determinePlan(answers);

  // 4. Copilot
  const b1 = answers.B1;
  const copilotRatio = b1 !== undefined
    ? (COPILOT_RATIOS[b1] ?? { min: 0.45, max: 0.55 })
    : { min: 0.45, max: 0.55 };
  const copilotSeats: CostRange = {
    min: Math.max(0, Math.ceil(activeDev.min * copilotRatio.min)),
    max: Math.ceil(activeDev.max * copilotRatio.max),
  };
  const copilotPlan: CopilotPlan =
    copilotSeats.max === 0
      ? 'none'
      : plan === 'enterprise'
        ? 'enterprise'
        : 'business';
  const copilotUnitPrice = PRICES.copilot[copilotPlan];

  // 5. Actions
  const a1 = answers.A1;
  const a2 = answers.A2;
  const a3 = answers.A3;
  const a4 = answers.A4;

  let actionsCost: CostRange = { min: 0, max: 0 };
  let actionsMinutesRange: CostRange = { min: 0, max: 0 };
  let blendedRate = PRICES.actions.linux;

  const automationLevel: AutomationLevel =
    q4 <= 1 ? 'low' : q4 <= 2 ? 'medium' : 'high';

  if (q4 >= 2) {
    const minutesPerRun = a1 !== undefined
      ? (MINUTES_PER_RUN[a1] ?? { min: 10, max: 25 })
      : (q4 >= 3 ? { min: 15, max: 40 } : { min: 5, max: 15 });

    const runsPerMonth = a2 !== undefined
      ? (RUNS_PER_MONTH[a2] ?? { min: 80, max: 250 })
      : (q4 >= 3 ? { min: 150, max: 500 } : { min: 40, max: 150 });

    const hostedRatio = a3 !== undefined
      ? (HOSTED_RATIOS[a3] ?? { min: 0.3, max: 0.6 })
      : { min: 0.3, max: 0.6 };

    const osMultiplier = a4 !== undefined
      ? (OS_MULTIPLIERS[a4] ?? 1.0)
      : 1.0;

    const totalMinutes = multiplyRanges(minutesPerRun, runsPerMonth);
    const hostedMinutes: CostRange = {
      min: Math.ceil(totalMinutes.min * hostedRatio.min),
      max: Math.ceil(totalMinutes.max * hostedRatio.max),
    };

    const freeMinutes = PRICES.freeMinutes[plan];
    const excessMinutes: CostRange = {
      min: Math.max(0, hostedMinutes.min - freeMinutes),
      max: Math.max(0, hostedMinutes.max - freeMinutes),
    };

    blendedRate = PRICES.actions.linux * osMultiplier;
    actionsMinutesRange = excessMinutes;
    actionsCost = {
      min: Math.round(excessMinutes.min * blendedRate * 100) / 100,
      max: Math.round(excessMinutes.max * blendedRate * 100) / 100,
    };
  }

  // 6. Security
  const c1 = answers.C1;
  const c2 = answers.C2;
  let securitySku: SecuritySku = 'none';
  let secretCost: CostRange = { min: 0, max: 0 };
  let codeSecurity: CostRange = { min: 0, max: 0 };
  let securityCommittersSecret: CostRange = { min: 0, max: 0 };
  let securityCommittersCode: CostRange = { min: 0, max: 0 };

  if (q5 >= 2 && plan !== 'free') {
    const protectionTarget = c1 ?? 3; // 企業向けのため両方を既定推奨
    const scopeRatio = c2 !== undefined
      ? (SECURITY_SCOPE_RATIOS[c2] ?? { min: 0.55, max: 0.65 })
      : { min: 0.55, max: 0.65 };

    const scopedCommitters: CostRange = {
      min: Math.max(1, Math.ceil(activeDev.min * scopeRatio.min)),
      max: Math.ceil(activeDev.max * scopeRatio.max),
    };

    if (protectionTarget === 1 || protectionTarget === 3) {
      securitySku = protectionTarget === 3 ? 'both' : 'secret';
      secretCost = {
        min: scopedCommitters.min * PRICES.security.secretProtection,
        max: scopedCommitters.max * PRICES.security.secretProtection,
      };
      securityCommittersSecret = scopedCommitters;
    }
    if (protectionTarget === 2 || protectionTarget === 3) {
      securitySku = protectionTarget === 3 ? 'both' : 'code';
      codeSecurity = {
        min: scopedCommitters.min * PRICES.security.codeSecurity,
        max: scopedCommitters.max * PRICES.security.codeSecurity,
      };
      securityCommittersCode = scopedCommitters;
    }
  }

  // 7. Codespaces
  const b3 = answers.B3;
  const b4 = answers.B4;
  let codespacesCost: CostRange = { min: 0, max: 0 };
  let codespacesLevel: CodespacesLevel = 'none';
  let codespacesUsers: CostRange = { min: 0, max: 0 };

  if (b4 !== undefined && b4 >= 2 && b3 !== undefined && b3 >= 2) {
    const usageRatio = b4 >= 3 ? { min: 0.3, max: 0.6 } : { min: 0.1, max: 0.25 };
    codespacesUsers = {
      min: Math.max(1, Math.ceil(activeDev.min * usageRatio.min)),
      max: Math.ceil(activeDev.max * usageRatio.max),
    };
    codespacesLevel = b4 >= 3 ? 'wide' : 'partial';
    // Assume 4 hrs/day * 20 days = 80 hrs/month per user, 2-core
    const hoursPerMonth = 80;
    codespacesCost = {
      min: Math.round(codespacesUsers.min * hoursPerMonth * PRICES.codespaces.compute2core),
      max: Math.round(codespacesUsers.max * hoursPerMonth * PRICES.codespaces.compute2core),
    };
  }

  // 8. Totals
  const basePlanCostMin = seats.min * PRICES.plans[plan];
  const basePlanCostMax = seats.max * PRICES.plans[plan];
  const copilotCostMin = copilotSeats.min * copilotUnitPrice;
  const copilotCostMax = copilotSeats.max * copilotUnitPrice;
  const securityCostMin = secretCost.min + codeSecurity.min;
  const securityCostMax = secretCost.max + codeSecurity.max;

  const monthly: CostRange = clampRange({
    min: basePlanCostMin + copilotCostMin + securityCostMin + actionsCost.min + codespacesCost.min,
    max: basePlanCostMax + copilotCostMax + securityCostMax + actionsCost.max + codespacesCost.max,
  });

  const annual: CostRange = {
    min: monthly.min * 12,
    max: monthly.max * 12,
  };

  // Breakdown
  const breakdown: BreakdownItem[] = [
    {
      id: 'plan',
      label: `基本プラン（${plan === 'free' ? 'Free' : plan === 'team' ? 'Team' : 'Enterprise Cloud'}）`,
      cost: { min: basePlanCostMin, max: basePlanCostMax },
      detail: `${seats.min}〜${seats.max}席 × $${PRICES.plans[plan]}/月`,
      explanation: generateProductExplanation('plan', answers),
      adjustable: true,
      quantity: seats,
      unitPrice: PRICES.plans[plan],
    },
  ];

  if (copilotPlan !== 'none') {
    breakdown.push({
      id: 'copilot',
      label: `Copilot ${copilotPlan === 'enterprise' ? 'Enterprise' : 'Business'}`,
      cost: { min: copilotCostMin, max: copilotCostMax },
      detail: `${copilotSeats.min}〜${copilotSeats.max}席 × $${copilotUnitPrice}/月`,
      explanation: generateProductExplanation('copilot', answers),
      adjustable: true,
      quantity: copilotSeats,
      unitPrice: copilotUnitPrice,
    });
  }

  if (securitySku !== 'none') {
    if (securitySku === 'secret' || securitySku === 'both') {
      breakdown.push({
        id: 'secret_protection',
        label: 'Secret Protection',
        cost: secretCost,
        detail: `${securityCommittersSecret.min}〜${securityCommittersSecret.max} committers × $${PRICES.security.secretProtection}/月`,
        explanation: generateProductExplanation('secret_protection', answers),
        adjustable: true,
        quantity: securityCommittersSecret,
        unitPrice: PRICES.security.secretProtection,
      });
    }
    if (securitySku === 'code' || securitySku === 'both') {
      breakdown.push({
        id: 'code_security',
        label: 'Code Security',
        cost: codeSecurity,
        detail: `${securityCommittersCode.min}〜${securityCommittersCode.max} committers × $${PRICES.security.codeSecurity}/月`,
        explanation: generateProductExplanation('code_security', answers),
        adjustable: true,
        quantity: securityCommittersCode,
        unitPrice: PRICES.security.codeSecurity,
      });
    }
  }

  if (automationLevel !== 'low') {
    breakdown.push({
      id: 'actions',
      label: 'Actions 従量課金',
      cost: actionsCost,
      detail: `超過 ${actionsMinutesRange.min.toLocaleString()}〜${actionsMinutesRange.max.toLocaleString()}分 × $${blendedRate.toFixed(3)}/分`,
      explanation: generateProductExplanation('actions', answers),
      adjustable: true,
      quantity: actionsMinutesRange,
      unitPrice: blendedRate,
    });
  }

  if (codespacesLevel !== 'none') {
    const codespacesUnitPrice = 80 * PRICES.codespaces.compute2core;
    breakdown.push({
      id: 'codespaces',
      label: 'Codespaces',
      cost: codespacesCost,
      detail: `${codespacesUsers.min}〜${codespacesUsers.max}人 × 80時間/月 × $${PRICES.codespaces.compute2core}/時`,
      explanation: generateProductExplanation('codespaces', answers),
      adjustable: true,
      quantity: codespacesUsers,
      unitPrice: codespacesUnitPrice,
    });
  }

  // Confidence & explanations
  const assumptions = generateAssumptions(answers);
  const explanations = generateExplanations(answers);
  const variableFactors = generateVariableFactors(answers);

  const answeredCount = Object.keys(answers).length;
  const confidence: Confidence =
    answeredCount >= 12 && assumptions.length <= 1
      ? 'high'
      : answeredCount >= 8 && assumptions.length <= 3
        ? 'medium'
        : 'low';

  // Security committers for recommendations
  const securityCommittersForRecs: CostRange =
    securitySku === 'both' || securitySku === 'secret'
      ? securityCommittersSecret
      : securitySku === 'code'
        ? securityCommittersCode
        : { min: 0, max: 0 };

  const recommendations = generateRecommendations(
    answers,
    plan,
    copilotPlan,
    securitySku,
    automationLevel,
    codespacesLevel,
    seats,
    copilotSeats,
    securityCommittersForRecs,
  );

  return {
    plan,
    copilotPlan,
    securitySku,
    automationLevel,
    codespacesLevel,
    monthlyCost: monthly,
    annualCost: annual,
    breakdown,
    recommendations,
    confidence,
    assumptionCount: assumptions.length,
    assumptions,
    explanations,
    variableFactors,
  };
}

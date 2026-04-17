import type { Answers, PlanTier } from './types';

// 企業向けツールのため、常に Enterprise Cloud を推奨する。
// Free / Team は比較候補としてのみ表示される。
export function determinePlan(_answers: Answers): PlanTier {
  return 'enterprise';
}

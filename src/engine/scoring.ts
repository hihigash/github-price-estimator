import type { Answers, BranchId, BranchScores } from './types';

export function calculateBranchScores(answers: Answers): BranchScores {
  const q2 = answers.Q2 ?? 2;
  const q3 = answers.Q3 ?? 2;
  const q4 = answers.Q4 ?? 1;
  const q5 = answers.Q5 ?? 1;
  const q6 = answers.Q6 ?? 0;

  return {
    automation: q4 * 2 + (q3 >= 3 ? 2 : 0),
    productivity: (q6 > 0 ? q6 * 1.5 : 0) + q2 * 0.5,
    security: q5 * 2 + (q3 >= 4 ? 2 : 0),
  };
}

export function selectBranches(scores: BranchScores): BranchId[] {
  const entries = Object.entries(scores) as [BranchId, number][];
  const sorted = entries.sort(([, a], [, b]) => b - a);

  const selected: BranchId[] = [sorted[0][0], sorted[1][0]];

  // Add 3rd branch if its score is close to the 2nd
  if (sorted[2][1] >= sorted[1][1] * 0.7 && sorted[2][1] > 2) {
    selected.push(sorted[2][0]);
  }

  return selected;
}

export function shouldShowBranch(branchId: BranchId, answers: Answers): boolean {
  const q3 = answers.Q3 ?? 1;
  const q4 = answers.Q4 ?? 1;
  const q5 = answers.Q5 ?? 1;
  const q6 = answers.Q6 ?? 0;

  switch (branchId) {
    case 'automation':
      return q4 >= 2 || q3 >= 3;
    case 'productivity':
      return q6 > 0;
    case 'security':
      return q5 >= 2 || q3 >= 4;
    default:
      return false;
  }
}

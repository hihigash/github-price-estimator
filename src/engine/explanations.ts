import type { Answers, CostRange } from './types';
import { SEAT_RANGES, ACTIVE_RATIOS } from './pricing';

const SEAT_LABELS: Record<number, string> = {
  0: 'カスタム入力',
  1: '1人',
  2: '2〜5人',
  3: '6〜20人',
  4: '21〜50人',
  5: '51〜200人',
  6: '201人以上',
};

const ACTIVE_LABELS: Record<number, string> = {
  4: 'ほぼ全員',
  3: '7割前後',
  2: '半分前後',
  1: '3割以下',
};

function rangeStr(r: CostRange): string {
  return r.min === r.max ? `${r.min}` : `${r.min}〜${r.max}`;
}

export function generateExplanations(answers: Answers): string[] {
  const explanations: string[] = [];
  const q1 = answers.Q1 ?? 2;
  const q2 = answers.Q2 ?? 2;
  const q3 = answers.Q3 ?? 2;
  const q4 = answers.Q4 ?? 1;
  const q5 = answers.Q5 ?? 1;

  // Active developers
  const seats = SEAT_RANGES[q1] ?? { min: 2, max: 5 };
  const ratio = ACTIVE_RATIOS[q2] ?? { min: 0.45, max: 0.60 };
  const activeMin = Math.max(1, Math.ceil(seats.min * ratio.min));
  const activeMax = Math.ceil(seats.max * ratio.max);
  explanations.push(
    `日常的に関わる人数が${SEAT_LABELS[q1] ?? '不明'}、` +
    `週に何度もコードを触る人が${ACTIVE_LABELS[q2] ?? '不明'}だったため、` +
    `アクティブ開発者は${rangeStr({ min: activeMin, max: activeMax })}人と推定しました。`
  );

  // Automation
  if (q4 >= 3) {
    explanations.push(
      '確認作業が高度に自動化されている前提のため、自動化の利用量は中〜高と判定しました。'
    );
  } else if (q4 >= 2) {
    explanations.push(
      '確認作業が一部自動化されているため、Actions の利用量を中程度と判定しました。'
    );
  }

  // Security
  if (q5 >= 3) {
    explanations.push(
      '大事な値の混入防止ニーズが強かったため、セキュリティは秘密情報保護を優先候補にしています。'
    );
  } else if (q5 >= 2) {
    explanations.push(
      '一部に機密性の高い情報があるため、セキュリティ対策の導入を推奨しています。'
    );
  }

  // Plan tier
  if (q3 >= 4) {
    explanations.push(
      '複数組織・厳格運用の進め方だったため、基本プランは Enterprise Cloud を推奨しています。'
    );
  } else if (q3 >= 3) {
    explanations.push(
      '複数チームで並行する規模のため、Team プラン以上を推奨しています。'
    );
  }

  return explanations;
}

export function generateAssumptions(answers: Answers): string[] {
  const assumptions: string[] = [];

  if (answers.B1 === undefined) {
    assumptions.push('Copilot 対象率はアクティブ開発者の50%と仮定しました。');
  }
  if (answers.C2 === undefined && (answers.Q5 ?? 1) >= 2) {
    assumptions.push('セキュリティ保護範囲は60%と仮定しました。');
  }
  if (answers.A3 === undefined && (answers.Q4 ?? 1) >= 2) {
    assumptions.push('Actions のクラウド実行比率は50%と仮定しました。');
  }
  if (answers.A4 === undefined && (answers.Q4 ?? 1) >= 2) {
    assumptions.push('ランナー OS は Linux のみと仮定しました。');
  }
  if (answers.B4 === undefined) {
    assumptions.push('Codespaces の導入は見送りと仮定しました。');
  }

  return assumptions;
}

export function generateVariableFactors(answers: Answers): string[] {
  const factors: string[] = [
    '実際にアクティブにコードを触る人数の増減',
    'private リポジトリの範囲変更',
  ];

  if ((answers.Q4 ?? 1) >= 2) {
    factors.push('自動化処理の実行頻度と1回あたりの実行時間');
  }
  if (answers.A4 !== undefined && answers.A4 >= 2) {
    factors.push('Windows / macOS ランナーの利用割合（単価が大きく異なります）');
  }
  if (answers.B1 !== undefined && answers.B1 >= 2) {
    factors.push('Copilot の高負荷利用による premium requests 超過');
  }
  if (answers.B4 !== undefined && answers.B4 >= 2) {
    factors.push('Codespaces の利用時間とマシンスペック');
  }

  return factors;
}

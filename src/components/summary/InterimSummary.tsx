import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Answers, BranchId } from '../../engine/types';
import { SEAT_RANGES, ACTIVE_RATIOS } from '../../engine/pricing';
import { BRANCH_LABELS } from '../../data/questions';
import { determinePlan } from '../../engine/planDetermination';

interface InterimSummaryProps {
  answers: Answers;
  selectedBranches: BranchId[];
  onContinue: () => void;
  customSeatCount?: number;
}

export function InterimSummary({ answers, selectedBranches, onContinue, customSeatCount }: InterimSummaryProps) {
  const q1 = answers.Q1 ?? 2;
  const q2 = answers.Q2 ?? 2;

  let seats: { min: number; max: number };
  if (q1 === 0 && customSeatCount !== undefined && customSeatCount > 0) {
    seats = { min: customSeatCount, max: customSeatCount };
  } else {
    seats = SEAT_RANGES[q1] ?? { min: 2, max: 5 };
  }

  const ratio = ACTIVE_RATIOS[q2] ?? { min: 0.45, max: 0.60 };
  const activeMin = Math.max(1, Math.ceil(seats.min * ratio.min));
  const activeMax = Math.ceil(seats.max * ratio.max);
  const plan = determinePlan(answers);
  const planLabel = plan === 'free' ? 'Free' : plan === 'team' ? 'Team' : 'Enterprise Cloud';

  return (
    <Card className="border-gray-300 dark:border-neutral-600">
      <h3 className="text-base font-bold text-gray-800 dark:text-neutral-200 mb-4">
        暫定サマリー
      </h3>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-neutral-400">想定人数レンジ</span>
          <span className="font-semibold text-gray-800 dark:text-neutral-200">
            {seats.min}〜{seats.max}人
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-neutral-400">アクティブ開発者</span>
          <span className="font-semibold text-gray-800 dark:text-neutral-200">
            {activeMin}〜{activeMax}人
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-neutral-400">推奨プラン候補</span>
          <Badge variant="info">{planLabel}</Badge>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">
          以下の領域をもう少し詳しくお聞きします：
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedBranches.map((b) => (
            <Badge key={b} variant="default">
              {BRANCH_LABELS[b]}
            </Badge>
          ))}
        </div>
      </div>

      <button
        onClick={onContinue}
        type="button"
        className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 transition-colors"
      >
        深掘り質問に進む（あと{selectedBranches.length * 4}問程度）
      </button>
    </Card>
  );
}

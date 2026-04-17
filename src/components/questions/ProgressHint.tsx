interface ProgressHintProps {
  phase: string;
  answeredCount: number;
  totalStage1: number;
}

export function ProgressHint({ phase, answeredCount, totalStage1 }: ProgressHintProps) {
  let message: string;
  let progress: number;

  if (phase === 'stage1') {
    if (answeredCount <= 2) {
      message = '開発の進め方を把握しています…';
      progress = (answeredCount / totalStage1) * 40;
    } else if (answeredCount <= 4) {
      message = 'もう少しで概算が出ます…';
      progress = 40 + ((answeredCount - 2) / (totalStage1 - 2)) * 30;
    } else {
      message = 'まもなく暫定結果をお見せします';
      progress = 70 + ((answeredCount - 4) / (totalStage1 - 4)) * 15;
    }
  } else if (phase === 'stage3') {
    message = '詳細を深掘りしています…';
    progress = 85;
  } else if (phase === 'result') {
    message = '見積もり完了';
    progress = 100;
  } else {
    message = '';
    progress = 75;
  }

  return (
    <div className="mt-6 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-neutral-400">{message}</span>
        <span className="text-xs text-gray-400 dark:text-neutral-500">{Math.round(progress)}%</span>
      </div>
      <div className="flex w-full h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="flex flex-col justify-center rounded-full overflow-hidden bg-gray-800 text-xs text-white text-center whitespace-nowrap transition-all duration-500 ease-out dark:bg-neutral-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

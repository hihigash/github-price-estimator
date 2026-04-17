import { useState } from 'react';
import type { Question, QuestionId } from '../../engine/types';
import { ChoiceButton } from './ChoiceButton';
import { Card } from '../ui/Card';

interface QuestionCardProps {
  question: Question;
  selectedValue?: number;
  onAnswer: (questionId: QuestionId, value: number) => void;
  onCustomInput?: (questionId: QuestionId, customValue: number) => void;
  customInputValue?: number;
  questionNumber: number;
  totalQuestions?: number;
}

export function QuestionCard({
  question,
  selectedValue,
  onAnswer,
  onCustomInput,
  customInputValue,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const [localCustomValue, setLocalCustomValue] = useState<string>(
    customInputValue?.toString() ?? '',
  );

  const showCustomInput = question.allowCustomInput && selectedValue === 0;

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalCustomValue(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n > 0 && onCustomInput) {
      onCustomInput(question.id, n);
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex items-start gap-3 mb-4">
        <span className="shrink-0 inline-flex items-center justify-center size-7 rounded-md bg-gray-800 text-white text-xs font-semibold dark:bg-neutral-200 dark:text-neutral-900">
          {questionNumber}
        </span>
        <div className="grow">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200 leading-relaxed">
            {question.text}
          </h3>
          {question.helpText && (
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{question.helpText}</p>
          )}
          {totalQuestions && (
            <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
              {questionNumber} / {totalQuestions}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((opt) => (
          <ChoiceButton
            key={opt.value}
            option={opt}
            selected={selectedValue === opt.value}
            onSelect={(v) => onAnswer(question.id, v)}
          />
        ))}
      </div>

      {showCustomInput && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={localCustomValue}
            onChange={handleCustomChange}
            placeholder="人数を入力"
            className="py-2 px-3 block w-32 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-blue-400"
            autoFocus
          />
          <span className="text-sm text-gray-500 dark:text-neutral-400">
            {question.customInputLabel ?? '人'}
          </span>
        </div>
      )}
    </Card>
  );
}

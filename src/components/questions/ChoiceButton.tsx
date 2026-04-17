import type { QuestionOption } from '../../engine/types';

interface ChoiceButtonProps {
  option: QuestionOption;
  selected: boolean;
  onSelect: (value: number) => void;
}

export function ChoiceButton({ option, selected, onSelect }: ChoiceButtonProps) {
  return (
    <button
      onClick={() => onSelect(option.value)}
      type="button"
      className={`w-full text-left px-4 py-3 rounded-md border transition-colors duration-150 text-sm font-medium
        ${selected
          ? 'border-blue-600 bg-blue-600 text-white dark:bg-blue-500 dark:border-blue-500 shadow-sm'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500'
        }`}
    >
      {option.label}
    </button>
  );
}

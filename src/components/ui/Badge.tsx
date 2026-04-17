import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-700 dark:bg-neutral-700 dark:text-neutral-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-x-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`flex flex-col bg-white border border-gray-200 shadow-2xs rounded-lg dark:bg-neutral-900 dark:border-neutral-700 p-5 md:p-6 ${className}`}>
      {children}
    </div>
  );
}

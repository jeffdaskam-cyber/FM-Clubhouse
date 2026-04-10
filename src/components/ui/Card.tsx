import { cn } from '@/utils/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPad?: boolean;
}

export function Card({ className, children, noPad, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-card border border-neutral-200',
        !noPad && 'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

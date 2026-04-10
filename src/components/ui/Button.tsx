import { cn } from '@/utils/cn';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-green-500 text-white hover:bg-green-600 shadow-sm':                              variant === 'primary',
          'bg-white text-green-500 border border-green-400 hover:bg-green-50 shadow-sm':        variant === 'secondary',
          'text-neutral-600 hover:bg-neutral-100':                                              variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700 shadow-sm':                                   variant === 'danger',
        },
        {
          'text-xs px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2':   size === 'md',
          'text-base px-6 py-3': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

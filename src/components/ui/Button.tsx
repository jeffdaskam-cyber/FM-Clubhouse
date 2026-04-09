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
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-golf-green text-white hover:bg-fairway': variant === 'primary',
          'bg-white text-golf-green border border-golf-green hover:bg-green-50': variant === 'secondary',
          'text-gray-700 hover:bg-gray-100': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        },
        {
          'text-sm px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
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

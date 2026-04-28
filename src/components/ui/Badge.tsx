'use client';

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-400',
      destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

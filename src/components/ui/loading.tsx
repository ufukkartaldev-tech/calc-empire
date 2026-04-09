'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      style={{ color: 'var(--ce-text-primary)' }}
    />
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  isLoading, 
  children, 
  fallback, 
  size = 'md' 
}: LoadingStateProps) {
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size={size} />
      </div>
    );
  }

  return <>{children}</>;
}

interface LoadingCardProps {
  title?: string;
  className?: string;
}

export function LoadingCard({ title = 'Loading...', className = '' }: LoadingCardProps) {
  return (
    <div 
      className={`professional-card p-6 ${className}`}
      style={{ backgroundColor: 'var(--ce-surface)' }}
    >
      <div className="flex items-center space-x-3">
        <LoadingSpinner size="sm" />
        <span 
          className="body-regular"
          style={{ color: 'var(--ce-text-secondary)' }}
        >
          {title}
        </span>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({ 
  isLoading, 
  children, 
  disabled = false, 
  className = '', 
  onClick,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn-primary flex items-center space-x-2 ${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </button>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

interface AvatarImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  className?: string;
  src?: string | null;
}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className = '', alt, src, ...props }, ref) => {
    if (!src) return null;
    return (
      <Image
        ref={ref}
        src={src}
        alt={alt || ''}
        className={`aspect-square h-full w-full object-cover ${className}`}
        width={40}
        height={40}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
AvatarFallback.displayName = 'AvatarFallback';

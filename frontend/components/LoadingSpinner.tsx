'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'blue' | 'white' | 'emerald' | 'slate';
  label?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'blue',
  label,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    emerald: 'text-emerald-500',
    slate: 'text-slate-400',
  };

  return (
    <div className={`inline-flex items-center justify-center gap-2.5 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`} />
      {label && (
        <span className="text-xs font-semibold text-slate-600 animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}

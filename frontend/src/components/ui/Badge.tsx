import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'primary'
  | 'accent'
  | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'border-emerald-200/80 bg-emerald-50/80 text-emerald-700 font-medium',
    dot: 'bg-emerald-500',
  },
  warning: {
    container: 'border-amber-200/80 bg-amber-50/80 text-amber-700 font-medium',
    dot: 'bg-amber-500',
  },
  error: {
    container: 'border-rose-200/80 bg-rose-50/80 text-rose-700 font-medium',
    dot: 'bg-rose-500',
  },
  info: {
    container: 'border-sky-200/80 bg-sky-50/80 text-sky-700 font-medium',
    dot: 'bg-sky-500',
  },
  primary: {
    container: 'border-indigo-200/80 bg-indigo-50/80 text-indigo-700 font-medium',
    dot: 'bg-indigo-600',
  },
  accent: {
    container: 'border-purple-200/80 bg-purple-50/80 text-purple-700 font-medium',
    dot: 'bg-purple-600',
  },
  neutral: {
    container: 'border-slate-200/80 bg-slate-50 text-slate-600 font-medium',
    dot: 'bg-slate-400',
  },
};

export function Badge({ variant = 'neutral', children, className = '', dot = false }: BadgeProps) {
  const current = variantStyles[variant] || variantStyles.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] tracking-tight leading-none transition-colors ${current.container} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${current.dot} shrink-0 animate-pulse-slow`} />
      )}
      <span>{children}</span>
    </span>
  );
}

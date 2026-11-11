import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  accent?: 'indigo' | 'crimson' | 'success' | 'warning' | 'error' | 'neutral';
}

const accentStyles: Record<string, string> = {
  indigo: 'border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100',
  crimson: 'border-rose-100 bg-rose-50 text-rose-600 shadow-sm shadow-rose-100',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100',
  warning: 'border-amber-100 bg-amber-50 text-amber-600 shadow-sm shadow-amber-100',
  error: 'border-rose-100 bg-rose-50 text-rose-600 shadow-sm shadow-rose-100',
  neutral: 'border-slate-200 bg-slate-50 text-slate-600 shadow-sm',
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  accent = 'neutral',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-12 text-center shadow-card transition-all ${className}`}
    >
      <div
        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl border ${
          accentStyles[accent] || accentStyles.neutral
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="btn-press inline-flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-slate-900/20"
          >
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

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
  indigo: 'border-[#3F51B5]/30 bg-[#EAF4FF] text-[#3F51B5]',
  crimson: 'border-[#DC143C]/40 bg-[#FDF2F2] text-[#DC143C]',
  success: 'border-[#3F51B5]/30 bg-[#EAF4FF] text-[#3F51B5]',
  warning: 'border-[#DC143C]/40 bg-[#FDF2F2] text-[#DC143C]',
  error: 'border-[#DC143C]/30 bg-[#FDF2F2] text-[#DC143C]',
  neutral: 'border-[#DCE6F2] bg-[#FFFFFF] text-[#647794]',
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
      className={`rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-8 text-center transition-smooth hover:border-[#3F51B5]/50 ${className}`}
    >
      <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFFFFF] ${accentStyles[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-xs font-semibold text-[#101C3A]">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#647794]">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-[#021861] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#3F51B5] transition-colors"
          >
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  variant?: ToastVariant;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<ToastVariant, { border: string; bg: string; iconColor: string; titleColor: string }> = {
  success: {
    border: 'border-emerald-200',
    bg: 'bg-white',
    iconColor: 'text-emerald-500',
    titleColor: 'text-slate-900',
  },
  error: {
    border: 'border-rose-200',
    bg: 'bg-white',
    iconColor: 'text-rose-500',
    titleColor: 'text-slate-900',
  },
  info: {
    border: 'border-sky-200',
    bg: 'bg-white',
    iconColor: 'text-sky-500',
    titleColor: 'text-slate-900',
  },
  warning: {
    border: 'border-amber-200',
    bg: 'bg-white',
    iconColor: 'text-amber-500',
    titleColor: 'text-slate-900',
  },
};

export function Toast({
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
}: ToastProps) {
  const current = variantStyles[variant];
  return (
    <div
      className={`flex items-start space-x-3 rounded-2xl border p-4 text-xs shadow-panel ${current.border} ${current.bg} animate-slide-down ${className}`}
    >
      <div className={`mt-0.5 flex shrink-0 ${current.iconColor}`}>
        {variant === 'success' && <CheckCircle2 className="h-4 w-4" />}
        {variant === 'error' && <AlertCircle className="h-4 w-4" />}
        {variant === 'warning' && <AlertTriangle className="h-4 w-4" />}
        {variant === 'info' && <Info className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <div className={`font-semibold tracking-tight ${current.titleColor}`}>{title}</div>
        {message && <p className="mt-0.5 leading-relaxed text-slate-500">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

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

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-[#23845B]/40 bg-[#F0F7F2] text-[#23845B] shadow-card',
  error: 'border-[#C94C4C]/40 bg-[#F9EFEF] text-[#C94C4C] shadow-card',
  info: 'border-[#154D6E]/40 bg-[#E5EEF3] text-[#154D6E] shadow-card',
  warning: 'border-[#D99116]/40 bg-[#FFF4D6] text-[#D99116] shadow-card',
};

export function Toast({
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
}: ToastProps) {
  return (
    <div
      className={`flex items-start space-x-3 rounded-lg border p-4 text-xs ${variantStyles[variant]} ${className}`}
    >
      <div className="mt-0.5 flex shrink-0">
        {variant === 'success' && <CheckCircle2 className="h-4 w-4" />}
        {variant === 'error' && <AlertCircle className="h-4 w-4" />}
        {variant === 'warning' && <AlertTriangle className="h-4 w-4" />}
        {variant === 'info' && <Info className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-[#202A35]">{title}</div>
        {message && <p className="mt-0.5 leading-relaxed text-[#64748B]">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 shrink-0 rounded p-1 text-current hover:bg-current/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

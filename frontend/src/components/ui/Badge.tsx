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
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'border-[#3F51B5]/30 bg-[#EAF4FF] text-[#3F51B5]',
  warning: 'border-[#DC143C]/40 bg-[#FDF2F2] text-[#DC143C]',
  error: 'border-[#DC143C]/30 bg-[#FDF2F2] text-[#DC143C]',
  info: 'border-[#3F51B5]/30 bg-[#EAF4FF] text-[#3F51B5]',
  primary: 'border-[#3F51B5]/30 bg-[#EAF4FF] text-[#3F51B5]',
  accent: 'border-[#DC143C]/40 bg-[#FDF2F2] text-[#DC143C]',
  neutral: 'border-[#DCE6F2] bg-[#FFFFFF] text-[#647794]',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium leading-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

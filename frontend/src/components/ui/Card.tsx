import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  tinted?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  className = '',
  padded = true,
  tinted = false,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/85 bg-white shadow-card transition-all duration-200 ${
        padded ? 'p-5 sm:p-6' : ''
      } ${tinted ? 'bg-slate-50/60' : 'bg-white'} ${
        hoverable ? 'hover-lift hover:border-slate-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 pb-4 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-sm font-semibold tracking-tight text-slate-900 ${className}`}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-xs text-slate-500 leading-relaxed ${className}`}>{children}</p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`pt-4 ${className}`}>{children}</div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-5 border-t border-slate-100 pt-4 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

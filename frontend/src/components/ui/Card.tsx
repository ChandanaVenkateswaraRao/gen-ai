import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  tinted?: boolean;
}

export function Card({
  children,
  className = '',
  padded = true,
  tinted = false,
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-[#D8D7D0] bg-[#FFFFFF] shadow-card ${padded ? 'p-5 sm:p-6' : ''} ${
        tinted ? 'bg-[#F2F1EC]' : ''
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
    <div className={`flex flex-col space-y-1.5 pb-3 border-b border-[#D8D7D0] ${className}`}>
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
    <h3 className={`text-xs font-semibold uppercase tracking-wider text-[#202A35] ${className}`}>
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
    <p className={`text-xs text-[#64748B] ${className}`}>{children}</p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`pt-3 ${className}`}>{children}</div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 border-t border-[#D8D7D0] pt-3 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

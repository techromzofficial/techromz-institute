import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

export type InstituteButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'email' | 'disabled';

const variantClasses: Record<InstituteButtonVariant, string> = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800',
  secondary: 'border-2 border-[#2454F4] bg-white text-[#2045B6] hover:bg-blue-50',
  whatsapp: 'bg-[#047857] text-white hover:bg-emerald-800',
  email: 'border-2 border-[#2454F4] bg-white text-[#2045B6] hover:bg-blue-50',
  disabled: 'cursor-not-allowed bg-slate-200 text-slate-500',
};

export function instituteButtonClassName(variant: InstituteButtonVariant, className = '') {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${variantClasses[variant]} ${className}`.trim();
}

type InstituteButtonLinkProps = {
  href: string;
  variant?: InstituteButtonVariant;
  children: ReactNode;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
};

export function InstituteButtonLink({ href, variant = 'primary', children, className, external = false, ariaLabel }: InstituteButtonLinkProps) {
  const classes = instituteButtonClassName(variant, className);

  if (href.startsWith('/')) {
    return <Link href={href} className={classes} aria-label={ariaLabel}>{children}</Link>;
  }

  return <a href={href} className={classes} aria-label={ariaLabel} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{children}</a>;
}

type InstituteButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: InstituteButtonVariant;
};

export function InstituteButton({ variant = 'primary', className, disabled, children, ...props }: InstituteButtonProps) {
  const resolvedVariant = disabled ? 'disabled' : variant;
  return <button {...props} disabled={disabled} className={instituteButtonClassName(resolvedVariant, className)}>{children}</button>;
}

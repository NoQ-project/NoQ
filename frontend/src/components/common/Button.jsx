import React from 'react';

const VARIANTS = {
  primary: 'bg-[#0E5C56] text-[#F6F3EC] border border-[#0E5C56] hover:bg-[#0A4A45]',
  secondary: 'bg-transparent text-[#142B29] border border-[#142B29]/20 hover:border-[#142B29]/40',
  danger: 'bg-transparent text-[#9A3324] border border-[#9A3324]/30 hover:bg-[#9A3324]/5',
  ghost: 'bg-transparent text-[#142B29]/70 border border-transparent hover:text-[#142B29]',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-sm px-5 py-3 gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  full = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5C56]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        full ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}

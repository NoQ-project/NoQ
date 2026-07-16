import React from 'react';

export default function SectionLabel({ children, icon: Icon, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#142B29]/50 ${className}`}>
      {Icon && <Icon size={12} strokeWidth={2} aria-hidden="true" />}
      {children}
    </div>
  );
}

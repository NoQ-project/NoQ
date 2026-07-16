import React from 'react';

const TONES = {
  neutral: 'bg-[#142B29]/5 text-[#142B29]/70 border-[#142B29]/10',
  live: 'bg-[#0E5C56]/10 text-[#0E5C56] border-[#0E5C56]/20',
  warning: 'bg-[#9A6A24]/10 text-[#9A6A24] border-[#9A6A24]/20',
  danger: 'bg-[#9A3324]/10 text-[#9A3324] border-[#9A3324]/20',
};

export default function StatusBadge({ children, tone = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wide',
        TONES[tone],
        className,
      ].join(' ')}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

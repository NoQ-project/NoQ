import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#142B29]/15 px-6 py-12 text-center">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#142B29]/5">
          <Icon size={18} strokeWidth={1.75} className="text-[#142B29]/50" aria-hidden="true" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-[#142B29]">{title}</p>
        {description && <p className="mt-1 text-xs text-[#142B29]/55">{description}</p>}
      </div>
      {action}
    </div>
  );
}

import React from 'react';


export default function PerforatedDivider({ className = '' }) {
  return (
    <div className={`relative flex items-center ${className}`} aria-hidden="true">
      <div className="absolute -left-4 h-3 w-3 rounded-full bg-[#F6F3EC] ring-1 ring-[#142B29]/10" />
      <div className="w-full border-t border-dashed border-[#142B29]/20" />
      <div className="absolute -right-4 h-3 w-3 rounded-full bg-[#F6F3EC] ring-1 ring-[#142B29]/10" />
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Search, ChevronRight, Users } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { getOrgIcon } from '../../utils/orgIcons';
import { getQueueTelemetry } from '../../utils/queueLogic';
import SectionLabel from '../common/SectionLabel';
import EmptyState from '../common/EmptyState';

export default function SearchInstitution({ onSelectOrg }) {
  const { organizations, tokens } = useQueue();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...new Set(organizations.map((o) => o.type))],
    [organizations]
  );

  const filtered = organizations.filter((org) => {
    const matchesQuery =
      !query ||
      org.name.toLowerCase().includes(query.toLowerCase()) ||
      org.type.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All' || org.type === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <SectionLabel icon={Search}>Book a token</SectionLabel>
      <h1 className="mt-2 text-2xl font-medium text-[#142B29]">
        Which organization would you like to visit?
      </h1>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#142B29]/15 bg-white px-3.5 py-2.5">
        <Search size={16} className="text-[#142B29]/40" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bank, hospital, office…"
          className="w-full bg-transparent text-sm text-[#142B29] outline-none placeholder:text-[#142B29]/40"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={[
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              category === c
                ? 'border-[#0E5C56] bg-[#0E5C56] text-[#F6F3EC]'
                : 'border-[#142B29]/15 bg-white text-[#142B29]/70 hover:border-[#142B29]/30',
            ].join(' ')}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 divide-y divide-[#142B29]/10 rounded-lg border border-[#142B29]/12 bg-white">
        {filtered.length === 0 && (
          <EmptyState icon={Search} title="No organizations match" description="Try a different search term or category." />
        )}
        {filtered.map((org) => {
          const Icon = getOrgIcon(org.icon);
          const activeQueues = org.queues.filter((q) => q.active);
          const waitingTotal = activeQueues.reduce(
            (sum, q) => sum + getQueueTelemetry(q, tokens).peopleWaiting,
            0
          );
          return (
            <button
              key={org.id}
              onClick={() => onSelectOrg(org.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#0E5C56]/5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0E5C56]/10">
                <Icon size={20} className="text-[#0E5C56]" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#142B29]">{org.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[#142B29]/55">
                  {org.type} · {activeQueues.length} queue{activeQueues.length !== 1 ? 's' : ''}
                  <span className="mx-1 text-[#142B29]/25">·</span>
                  <Users size={11} aria-hidden="true" /> {waitingTotal} waiting
                </p>
              </div>
              <ChevronRight size={16} className="text-[#142B29]/40" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { ChevronRight, PhoneCall, Users, Accessibility, UserRound, User } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { getSortedWaiting, PRIORITY, PRIORITY_LABEL } from '../../utils/queueLogic';
import { notifyNextClient } from '../../utils/notify';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import SectionLabel from '../../components/common/SectionLabel';
import EmptyState from '../../components/common/EmptyState';

const PRIORITY_ICON = {
  [PRIORITY.DISABLED]: Accessibility,
  [PRIORITY.SENIOR]: UserRound,
  [PRIORITY.STANDARD]: User,
};

export default function LiveCounterOperatorView({ orgId }) {
  const { getOrg, tokens, nextClient } = useQueue();
  const org = getOrg(orgId);
  const activeQueues = org?.queues.filter((q) => q.active) || [];
  const [selectedQueueId, setSelectedQueueId] = useState(activeQueues[0]?.id);

  useEffect(() => {
    if (!activeQueues.find((q) => q.id === selectedQueueId)) {
      setSelectedQueueId(activeQueues[0]?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  if (!org) return null;

  if (activeQueues.length === 0) {
    return <EmptyState title="No open queues" description="Reopen or add a queue to start calling clients." />;
  }

  const queue = activeQueues.find((q) => q.id === selectedQueueId) || activeQueues[0];
  const servingToken = tokens.find((t) => t.id === queue.currentServingTokenId) || null;
  const upcoming = getSortedWaiting(tokens, queue.id);

  function handleNext() {
    nextClient(orgId, queue.id);
    const next = getSortedWaiting(tokens, queue.id)[0];
    if (next) notifyNextClient(next.displayId, queue.name);
  }

  return (
    <div>
      <SectionLabel icon={PhoneCall}>Live counter</SectionLabel>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {activeQueues.map((q) => (
          <button
            key={q.id}
            onClick={() => setSelectedQueueId(q.id)}
            className={[
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              q.id === queue.id
                ? 'border-[#0E5C56] bg-[#0E5C56] text-[#F6F3EC]'
                : 'border-[#142B29]/15 bg-white text-[#142B29]/70 hover:border-[#142B29]/30',
            ].join(' ')}
          >
            {q.name}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-[#142B29]/12 bg-white p-5 text-center">
        <p className="text-[10px] uppercase tracking-wide text-[#142B29]/45">Now serving</p>
        <p className="mt-1 font-mono text-3xl font-medium text-[#0E5C56]">
          {servingToken ? servingToken.displayId : '—'}
        </p>
        {servingToken && (
          <StatusBadge tone="neutral" className="mt-2">
            {PRIORITY_LABEL[servingToken.priority]}
          </StatusBadge>
        )}
        <Button variant="primary" size="lg" full className="mt-4" icon={PhoneCall} onClick={handleNext} disabled={upcoming.length === 0}>
          Call next client
        </Button>
        {upcoming.length === 0 && (
          <p className="mt-2 text-xs text-[#142B29]/45">No one else waiting in this queue.</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <SectionLabel icon={Users}>Up next ({upcoming.length})</SectionLabel>
      </div>

      <div className="mt-2 divide-y divide-[#142B29]/8 rounded-lg border border-[#142B29]/12 bg-white">
        {upcoming.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-[#142B29]/45">Queue is empty.</p>
        )}
        {upcoming.map((token, idx) => {
          const Icon = PRIORITY_ICON[token.priority];
          return (
            <div key={token.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-5 shrink-0 text-center font-mono text-xs text-[#142B29]/40">
                {idx + 1}
              </span>
              <div
                className={[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  token.priority === PRIORITY.STANDARD
                    ? 'bg-[#142B29]/5 text-[#142B29]/50'
                    : 'bg-[#0E5C56]/10 text-[#0E5C56]',
                ].join(' ')}
              >
                <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-[#142B29]">{token.displayId}</p>
                <p className="text-[11px] text-[#142B29]/50">{PRIORITY_LABEL[token.priority]}</p>
              </div>
              {idx === 0 && <ChevronRight size={14} className="text-[#0E5C56]" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

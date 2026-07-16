import React from 'react';
import { ArrowLeft, Users, Clock, Ticket, Lock } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { getOrgIcon } from '../../utils/orgIcons';
import { getQueueTelemetry } from '../../utils/queueLogic';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import SectionLabel from '../common/SectionLabel';
import EmptyState from '../common/EmptyState';

export default function InstitutionDetail({ orgId, onBack, onSelectQueue }) {
  const { getOrg, tokens } = useQueue();
  const org = getOrg(orgId);

  if (!org) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <EmptyState title="Organization not found" />
      </div>
    );
  }

  const Icon = getOrgIcon(org.icon);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-medium text-[#142B29]/60 hover:text-[#142B29]"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to search
      </button>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0E5C56]/10">
          <Icon size={22} className="text-[#0E5C56]" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-medium text-[#142B29]">{org.name}</h1>
          <p className="text-xs text-[#142B29]/55">{org.type}</p>
        </div>
      </div>

      <SectionLabel icon={Ticket} className="mt-8 mb-3">
        Available queues
      </SectionLabel>

      <div className="space-y-3">
        {org.queues.map((queue) => {
          const { peopleWaiting, servingDisplay, quotaLeft, isFull } = getQueueTelemetry(queue, tokens);
          const bookable = queue.active && !isFull;

          return (
            <div key={queue.id} className="rounded-lg border border-[#142B29]/12 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#142B29]">{queue.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-[#142B29]/45">
                    {org.code}-{queue.prefix}
                  </p>
                </div>
                {!queue.active ? (
                  <StatusBadge tone="neutral">
                    <Lock size={10} aria-hidden="true" /> Closed
                  </StatusBadge>
                ) : isFull ? (
                  <StatusBadge tone="danger">Quota full</StatusBadge>
                ) : (
                  <StatusBadge tone="live" dot>
                    Open
                  </StatusBadge>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 divide-x divide-[#142B29]/10 rounded-md bg-[#F6F3EC] py-2.5 text-center">
                <div>
                  <p className="flex items-center justify-center gap-1 text-[15px] font-medium text-[#142B29]">
                    <Users size={12} className="text-[#142B29]/40" aria-hidden="true" />
                    {peopleWaiting}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#142B29]/45">Waiting</p>
                </div>
                <div>
                  <p className="font-mono text-[15px] font-medium text-[#0E5C56]">{servingDisplay}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#142B29]/45">Serving</p>
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1 text-[15px] font-medium text-[#142B29]">
                    <Clock size={12} className="text-[#142B29]/40" aria-hidden="true" />
                    {quotaLeft}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#142B29]/45">
                    Quota left / {queue.maxQuota}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                full
                className="mt-3"
                disabled={!bookable}
                onClick={() => onSelectQueue(queue.id)}
              >
                {!queue.active ? 'Queue closed' : isFull ? 'Quota reached for today' : 'Book this queue'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

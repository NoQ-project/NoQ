import React, { useState } from 'react';
import { Ticket, Clock, Users, X, CheckCircle2, Loader2, PlusCircle } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { getPeopleAhead, getEstWaitMinutes, getRingProgress, PRIORITY_LABEL } from '../../utils/queueLogic';
import ProgressRing from '../common/ProgressRing';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import SectionLabel from '../common/SectionLabel';
import EmptyState from '../common/EmptyState';

function TokenCard({ token, org, queue, onCancel }) {
  const { tokens } = useQueue();
  const peopleAhead = getPeopleAhead(tokens, token);
  const estWait = getEstWaitMinutes(queue, peopleAhead);
  const progress = token.status === 'serving' ? 1 : getRingProgress(queue, peopleAhead);
  const isServing = token.status === 'serving';

  return (
    <div className="rounded-xl border border-[#142B29]/12 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#142B29]/55">
            {org.name} · {queue.name}
          </p>
          <p className="mt-0.5 font-mono text-sm font-medium text-[#142B29]">{token.displayId}</p>
        </div>
        <StatusBadge tone={isServing ? 'live' : 'neutral'} dot={isServing}>
          {PRIORITY_LABEL[token.priority]}
        </StatusBadge>
      </div>

      <div className="mt-5 flex items-center justify-center">
        <ProgressRing progress={progress} size={140} strokeWidth={9}>
          <div className="text-center">
            {isServing ? (
              <>
                <CheckCircle2 size={20} className="mx-auto mb-1 text-[#0E5C56]" aria-hidden="true" />
                <p className="text-xs font-medium text-[#0E5C56]">Your turn</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-medium leading-none text-[#0E5C56]">{peopleAhead}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-[#142B29]/45">ahead of you</p>
              </>
            )}
          </div>
        </ProgressRing>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-md bg-[#F6F3EC] py-2.5">
          <p className="flex items-center justify-center gap-1 text-sm font-medium text-[#142B29]">
            <Clock size={12} className="text-[#142B29]/40" aria-hidden="true" />
            {isServing ? 'Now' : `~${estWait} min`}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#142B29]/45">Est. wait</p>
        </div>
        <div className="rounded-md bg-[#F6F3EC] py-2.5">
          <p className="flex items-center justify-center gap-1 text-sm font-medium text-[#142B29]">
            <Users size={12} className="text-[#142B29]/40" aria-hidden="true" />
            {queue.totalGenerated} today
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#142B29]/45">Tokens issued</p>
        </div>
      </div>

      {token.status === 'waiting' && (
        <Button variant="danger" size="sm" full icon={X} className="mt-4" onClick={() => onCancel(token.id)}>
          Cancel this token
        </Button>
      )}
    </div>
  );
}

export default function MyToken({ onBookAnother }) {
  const { getMyTokens, getOrg, getQueue, cancelToken } = useQueue();
  const myTokens = getMyTokens().filter((t) => t.status === 'waiting' || t.status === 'serving');
  const [activeId, setActiveId] = useState(myTokens[0]?.id);

  const activeToken = myTokens.find((t) => t.id === activeId) || myTokens[0];

  if (myTokens.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <SectionLabel icon={Ticket}>Your tokens</SectionLabel>
        <div className="mt-4">
          <EmptyState
            icon={Loader2}
            title="No active tokens"
            description="Book a token to start tracking your place in line."
            action={
              <Button variant="primary" size="sm" icon={PlusCircle} onClick={onBookAnother}>
                Book a token
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const org = getOrg(activeToken.orgId);
  const queue = getQueue(activeToken.orgId, activeToken.queueId);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <SectionLabel icon={Ticket}>Your tokens</SectionLabel>
        <button
          onClick={onBookAnother}
          className="flex items-center gap-1 text-xs font-medium text-[#0E5C56] hover:underline"
        >
          <PlusCircle size={13} aria-hidden="true" /> Book another
        </button>
      </div>

      {myTokens.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {myTokens.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={[
                'shrink-0 rounded-full border px-3 py-1.5 font-mono text-[11px]',
                t.id === activeToken.id
                  ? 'border-[#0E5C56] bg-[#0E5C56] text-[#F6F3EC]'
                  : 'border-[#142B29]/15 bg-white text-[#142B29]/70',
              ].join(' ')}
            >
              {t.displayId}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        <TokenCard token={activeToken} org={org} queue={queue} onCancel={cancelToken} />
      </div>
    </div>
  );
}

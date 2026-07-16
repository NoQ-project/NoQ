import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Accessibility, UserRound, User } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { PRIORITY, PRIORITY_LABEL } from '../../utils/queueLogic';
import Button from '../common/Button';
import PerforatedDivider from '../common/PerforatedDivider';
import SectionLabel from '../common/SectionLabel';

const OPTIONS = [
  {
    value: PRIORITY.STANDARD,
    label: PRIORITY_LABEL[PRIORITY.STANDARD],
    icon: User,
    hint: 'Regular queue order.',
  },
  {
    value: PRIORITY.SENIOR,
    label: PRIORITY_LABEL[PRIORITY.SENIOR],
    icon: UserRound,
    hint: 'For citizens 60 years or older.',
  },
  {
    value: PRIORITY.DISABLED,
    label: PRIORITY_LABEL[PRIORITY.DISABLED],
    icon: Accessibility,
    hint: 'For persons with disabilities.',
  },
];

export default function BookingConfirm({ orgId, queueId, onBack, onBooked }) {
  const { getOrg, getQueue, bookToken } = useQueue();
  const org = getOrg(orgId);
  const queue = getQueue(orgId, queueId);
  const [priority, setPriority] = useState(PRIORITY.STANDARD);

  if (!org || !queue) return null;

  const isPriorityClaim = priority !== PRIORITY.STANDARD;

  function handleConfirm() {
    bookToken(orgId, queueId, priority, 'me');
    onBooked();
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-medium text-[#142B29]/60 hover:text-[#142B29]"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to {org.name}
      </button>

      <h1 className="mt-4 text-xl font-medium text-[#142B29]">Confirm your token</h1>
      <p className="mt-1 text-sm text-[#142B29]/60">
        {org.name} · {queue.name}
      </p>

      <SectionLabel className="mt-8 mb-3">Select your priority status</SectionLabel>

      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = priority === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setPriority(opt.value)}
              className={[
                'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                selected
                  ? 'border-[#0E5C56] bg-[#0E5C56]/5'
                  : 'border-[#142B29]/12 bg-white hover:border-[#142B29]/25',
              ].join(' ')}
            >
              <div
                className={[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  selected ? 'bg-[#0E5C56] text-[#F6F3EC]' : 'bg-[#142B29]/5 text-[#142B29]/60',
                ].join(' ')}
              >
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#142B29]">{opt.label}</p>
                <p className="text-xs text-[#142B29]/55">{opt.hint}</p>
              </div>
              <div
                className={[
                  'h-4 w-4 shrink-0 rounded-full border-2',
                  selected ? 'border-[#0E5C56] bg-[#0E5C56]' : 'border-[#142B29]/25',
                ].join(' ')}
              />
            </button>
          );
        })}
      </div>

      {isPriorityClaim && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-[#9A6A24]/25 bg-[#9A6A24]/8 px-3.5 py-3 text-xs text-[#7A5419]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            Priority queues are reserved for those who qualify. Counter staff may ask for
            verification, and tokens booked under a false priority claim can be denied service.
          </p>
        </div>
      )}

      <div className="my-6">
        <PerforatedDivider />
      </div>

      <div className="rounded-lg border border-[#142B29]/12 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#142B29]/60">Organization</span>
          <span className="font-medium text-[#142B29]">{org.name}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-[#142B29]/60">Queue</span>
          <span className="font-medium text-[#142B29]">{queue.name}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-[#142B29]/60">Priority</span>
          <span className="font-medium text-[#142B29]">{PRIORITY_LABEL[priority]}</span>
        </div>
      </div>

      <Button variant="primary" size="lg" full className="mt-6" onClick={handleConfirm}>
        Confirm and generate token
      </Button>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Trash2, Power, Settings2, X } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { getQueueTelemetry } from '../../utils/queueLogic';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import SectionLabel from '../../components/common/SectionLabel';

function NewQueueForm({ orgId, onClose }) {
  const { addQueue } = useQueue();
  const [form, setForm] = useState({ name: '', prefix: '', maxQuota: 30, estimatedWaitTimePerPerson: 5 });

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addQueue(orgId, {
      name: form.name.trim(),
      prefix: form.prefix.trim() || form.name.trim(),
      maxQuota: Number(form.maxQuota) || 0,
      estimatedWaitTimePerPerson: Number(form.estimatedWaitTimePerPerson) || 0,
    });
    onClose();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-[#0E5C56]/30 bg-[#0E5C56]/5 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#142B29]">New queue</p>
        <button type="button" onClick={onClose} className="text-[#142B29]/50 hover:text-[#142B29]">
          <X size={15} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="col-span-2 text-xs text-[#142B29]/60">
          Queue name
          <input
            autoFocus
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Tax Season Clearance"
            className="mt-1 w-full rounded-md border border-[#142B29]/15 bg-white px-3 py-2 text-sm text-[#142B29] outline-none focus:border-[#0E5C56]"
          />
        </label>
        <label className="text-xs text-[#142B29]/60">
          Token prefix
          <input
            value={form.prefix}
            onChange={(e) => setForm({ ...form, prefix: e.target.value })}
            placeholder="TAX"
            className="mt-1 w-full rounded-md border border-[#142B29]/15 bg-white px-3 py-2 text-sm text-[#142B29] outline-none focus:border-[#0E5C56]"
          />
        </label>
        <label className="text-xs text-[#142B29]/60">
          Daily quota
          <input
            type="number"
            min={1}
            value={form.maxQuota}
            onChange={(e) => setForm({ ...form, maxQuota: e.target.value })}
            className="mt-1 w-full rounded-md border border-[#142B29]/15 bg-white px-3 py-2 text-sm text-[#142B29] outline-none focus:border-[#0E5C56]"
          />
        </label>
        <label className="col-span-2 text-xs text-[#142B29]/60">
          Est. wait per person (minutes)
          <input
            type="number"
            min={0}
            value={form.estimatedWaitTimePerPerson}
            onChange={(e) => setForm({ ...form, estimatedWaitTimePerPerson: e.target.value })}
            className="mt-1 w-full rounded-md border border-[#142B29]/15 bg-white px-3 py-2 text-sm text-[#142B29] outline-none focus:border-[#0E5C56]"
          />
        </label>
      </div>
      <Button type="submit" variant="primary" size="sm" full className="mt-3" icon={Plus}>
        Create queue
      </Button>
    </form>
  );
}

function QuotaEditor({ orgId, queue }) {
  const { updateQuota } = useQueue();
  const [value, setValue] = useState(queue.maxQuota);
  const dirty = Number(value) !== queue.maxQuota;

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={queue.totalGenerated}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-md border border-[#142B29]/15 bg-white px-2 py-1 text-right text-xs text-[#142B29] outline-none focus:border-[#0E5C56]"
      />
      <Button
        variant={dirty ? 'primary' : 'secondary'}
        size="sm"
        className="!px-2.5 !py-1 text-[11px]"
        disabled={!dirty}
        onClick={() => updateQuota(orgId, queue.id, Number(value))}
      >
        Save
      </Button>
    </div>
  );
}

export default function QueueConfigWorkspace({ orgId }) {
  const { getOrg, tokens, deleteQueue, toggleQueueActive } = useQueue();
  const org = getOrg(orgId);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  if (!org) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionLabel icon={Settings2}>Queue configuration</SectionLabel>
        {!showForm && (
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setShowForm(true)}>
            Add queue
          </Button>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {showForm && <NewQueueForm orgId={orgId} onClose={() => setShowForm(false)} />}

        {org.queues.map((queue) => {
          const { peopleWaiting, quotaLeft } = getQueueTelemetry(queue, tokens);
          const confirmingDelete = pendingDelete === queue.id;

          return (
            <div key={queue.id} className="rounded-lg border border-[#142B29]/12 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#142B29]">{queue.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-[#142B29]/45">
                    {org.code}-{queue.prefix} · {peopleWaiting} waiting
                  </p>
                </div>
                <StatusBadge tone={queue.active ? 'live' : 'neutral'} dot={queue.active}>
                  {queue.active ? 'Open' : 'Closed'}
                </StatusBadge>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#142B29]/8 pt-3">
                <div className="flex items-center gap-2 text-xs text-[#142B29]/60">
                  <span>Quota</span>
                  <QuotaEditor orgId={orgId} queue={queue} />
                  <span className="text-[#142B29]/40">({quotaLeft} left today)</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Power}
                    className="!px-2.5 !py-1.5 text-xs"
                    onClick={() => toggleQueueActive(orgId, queue.id)}
                  >
                    {queue.active ? 'Close' : 'Reopen'}
                  </Button>

                  {confirmingDelete ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#9A3324]">Delete permanently?</span>
                      <Button
                        variant="danger"
                        size="sm"
                        className="!px-2.5 !py-1.5 text-xs"
                        onClick={() => {
                          deleteQueue(orgId, queue.id);
                          setPendingDelete(null);
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="!px-2 !py-1.5 text-xs"
                        onClick={() => setPendingDelete(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      className="!px-2.5 !py-1.5 text-xs"
                      onClick={() => setPendingDelete(queue.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

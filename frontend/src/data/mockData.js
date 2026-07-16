import { PRIORITY, buildDisplayId } from '../utils/queueLogic';

export const initialOrganizations = [
  {
    id: 'org-citybank',
    name: 'City Bank',
    type: 'Banking',
    code: 'CB',
    icon: 'Building2',
    queues: [
      {
        id: 'q-cb-account',
        name: 'Account Opening',
        prefix: 'ACC',
        maxQuota: 60,
        totalGenerated: 24,
        estimatedWaitTimePerPerson: 4,
        active: true,
        currentServingTokenId: null,
      },
      {
        id: 'q-cb-demat',
        name: 'Demat Services',
        prefix: 'DEMAT',
        maxQuota: 40,
        totalGenerated: 18,
        estimatedWaitTimePerPerson: 5,
        active: true,
        currentServingTokenId: null,
      },
      {
        id: 'q-cb-cash',
        name: 'Cash Deposit',
        prefix: 'CASH',
        maxQuota: 100,
        totalGenerated: 41,
        estimatedWaitTimePerPerson: 2,
        active: true,
        currentServingTokenId: null,
      },
    ],
  },
  {
    id: 'org-cityhospital',
    name: 'City Hospital',
    type: 'Healthcare',
    code: 'CH',
    icon: 'HeartPulse',
    queues: [
      {
        id: 'q-ch-opd',
        name: 'General OPD',
        prefix: 'OPD',
        maxQuota: 80,
        totalGenerated: 52,
        estimatedWaitTimePerPerson: 6,
        active: true,
        currentServingTokenId: null,
      },
      {
        id: 'q-ch-lab',
        name: 'Lab & Diagnostics',
        prefix: 'LAB',
        maxQuota: 50,
        totalGenerated: 50,
        estimatedWaitTimePerPerson: 3,
        active: true,
        currentServingTokenId: null,
      },
    ],
  },
  {
    id: 'org-passports',
    name: 'Dept. of Passports',
    type: 'Government',
    code: 'DP',
    icon: 'FileText',
    queues: [
      {
        id: 'q-dp-new',
        name: 'New Application',
        prefix: 'NEW',
        maxQuota: 30,
        totalGenerated: 12,
        estimatedWaitTimePerPerson: 9,
        active: true,
        currentServingTokenId: null,
      },
      {
        id: 'q-dp-renew',
        name: 'Renewal',
        prefix: 'REN',
        maxQuota: 30,
        totalGenerated: 30,
        estimatedWaitTimePerPerson: 7,
        active: false,
      },
    ],
  },
];


const seedWaiters = [
  { orgId: 'org-citybank', queueId: 'q-cb-account', priority: PRIORITY.STANDARD, count: 5, startSeq: 20 },
  { orgId: 'org-citybank', queueId: 'q-cb-account', priority: PRIORITY.SENIOR, count: 1, startSeq: 25 },
  { orgId: 'org-citybank', queueId: 'q-cb-demat', priority: PRIORITY.STANDARD, count: 3, startSeq: 16 },
  { orgId: 'org-citybank', queueId: 'q-cb-cash', priority: PRIORITY.STANDARD, count: 6, startSeq: 36 },
  { orgId: 'org-citybank', queueId: 'q-cb-cash', priority: PRIORITY.DISABLED, count: 1, startSeq: 42 },
  { orgId: 'org-cityhospital', queueId: 'q-ch-opd', priority: PRIORITY.STANDARD, count: 7, startSeq: 46 },
  { orgId: 'org-cityhospital', queueId: 'q-ch-opd', priority: PRIORITY.SENIOR, count: 2, startSeq: 53 },
  { orgId: 'org-passports', queueId: 'q-dp-new', priority: PRIORITY.STANDARD, count: 4, startSeq: 9 },
];

export function buildInitialTokens(organizations) {
  const tokens = [];
  let createdOrder = 0;

  seedWaiters.forEach(({ orgId, queueId, priority, count, startSeq }) => {
    const org = organizations.find((o) => o.id === orgId);
    const queue = org.queues.find((q) => q.id === queueId);
    for (let i = 0; i < count; i++) {
      const sequence = startSeq + i;
      createdOrder += 1;
      tokens.push({
        id: `seed-${queueId}-${sequence}`,
        orgId,
        queueId,
        sequence,
        displayId: buildDisplayId(org, queue, sequence),
        priority,
        status: 'waiting',
        holder: `guest-${createdOrder}`,
        createdOrder,
        bookedAt: Date.now(),
      });
    }
  });

 
  organizations.forEach((org) => {
    org.queues.forEach((queue) => {
      if (!queue.active) return;
      const waiting = tokens
        .filter((t) => t.queueId === queue.id)
        .sort((a, b) => a.sequence - b.sequence);
      if (waiting.length === 0) return;
      const first = waiting[0];
      first.status = 'serving';
      queue.currentServingTokenId = first.id;
    });
  });

  return { tokens, createdOrder };
}

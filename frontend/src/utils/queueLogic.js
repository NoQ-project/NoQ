export const PRIORITY = {
  DISABLED: 'disabled',
  SENIOR: 'senior',
  STANDARD: 'standard',
};


export const PRIORITY_WEIGHT = {
  [PRIORITY.DISABLED]: 3,
  [PRIORITY.SENIOR]: 2,
  [PRIORITY.STANDARD]: 1,
};

export const PRIORITY_LABEL = {
  [PRIORITY.DISABLED]: 'Disabled',
  [PRIORITY.SENIOR]: 'Senior citizen',
  [PRIORITY.STANDARD]: 'Standard',
};

export function pad(num, size = 3) {
  return String(num).padStart(size, '0');
}

export function buildDisplayId(org, queue, sequence) {
  const orgCode = (org.code || org.name || 'ORG')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 2)
    .toUpperCase();
  const queueCode = (queue.prefix || queue.name || 'Q')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 6)
    .toUpperCase();
  return `${orgCode}-${queueCode}-${pad(sequence)}`;
}


export function getWaitingTokens(tokens, queueId) {
  return tokens.filter((t) => t.queueId === queueId && t.status === 'waiting');
}

export function getSortedWaiting(tokens, queueId) {
  return getWaitingTokens(tokens, queueId).sort((a, b) => {
    const w = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (w !== 0) return w;
    return a.createdOrder - b.createdOrder;
  });
}


export function getPosition(tokens, token) {
  if (!token || token.status !== 'waiting') return 0;
  const sorted = getSortedWaiting(tokens, token.queueId);
  const idx = sorted.findIndex((t) => t.id === token.id);
  return idx === -1 ? 0 : idx + 1;
}

export function getPeopleAhead(tokens, token) {
  const pos = getPosition(tokens, token);
  return pos === 0 ? 0 : pos - 1;
}

export function getEstWaitMinutes(queue, peopleAhead) {
  return peopleAhead * (queue.estimatedWaitTimePerPerson || 0);
}


export function getQueueTelemetry(queue, tokens) {
  const waiting = getWaitingTokens(tokens, queue.id);
  const servingToken = tokens.find((t) => t.id === queue.currentServingTokenId) || null;
  const quotaLeft = Math.max(0, queue.maxQuota - queue.totalGenerated);
  return {
    peopleWaiting: waiting.length,
    servingDisplay: servingToken ? servingToken.displayId : '—',
    quotaLeft,
    isFull: queue.totalGenerated >= queue.maxQuota,
  };
}

export function getRingProgress(queue, peopleAhead) {
  if (!queue.totalGenerated) return 0;
  const progress = (queue.totalGenerated - peopleAhead) / queue.totalGenerated;
  return Math.min(1, Math.max(0, progress));
}

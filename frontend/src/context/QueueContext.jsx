import React, { createContext, useContext, useMemo, useReducer, useCallback } from 'react';
import { initialOrganizations, buildInitialTokens } from '../data/mockData';
import { buildDisplayId, getSortedWaiting } from '../utils/queueLogic';

const QueueStateContext = createContext(null);
const QueueActionsContext = createContext(null);

const { tokens: seedTokens, createdOrder: seedOrder } = buildInitialTokens(initialOrganizations);

const initialState = {
  organizations: initialOrganizations,
  tokens: seedTokens,
  createdOrder: seedOrder,
};

function findOrgQueue(organizations, orgId, queueId) {
  const org = organizations.find((o) => o.id === orgId);
  const queue = org?.queues.find((q) => q.id === queueId);
  return { org, queue };
}

function reducer(state, action) {
  switch (action.type) {
    case 'BOOK_TOKEN': {
      const { orgId, queueId, priority, holder } = action.payload;
      const { org, queue } = findOrgQueue(state.organizations, orgId, queueId);
      if (!org || !queue || !queue.active) return state;
      if (queue.totalGenerated >= queue.maxQuota) return state;

      const sequence = queue.totalGenerated + 1;
      const createdOrder = state.createdOrder + 1;
      const newToken = {
        id: `tok-${Date.now()}-${createdOrder}`,
        orgId,
        queueId,
        sequence,
        displayId: buildDisplayId(org, queue, sequence),
        priority,
        status: 'waiting',
        holder,
        createdOrder,
        bookedAt: Date.now(),
      };

      return {
        ...state,
        createdOrder,
        tokens: [...state.tokens, newToken],
        organizations: state.organizations.map((o) =>
          o.id !== orgId
            ? o
            : {
                ...o,
                queues: o.queues.map((q) =>
                  q.id !== queueId ? q : { ...q, totalGenerated: sequence }
                ),
              }
        ),
      };
    }

    case 'CANCEL_TOKEN': {
      const { tokenId } = action.payload;
      return {
        ...state,
        tokens: state.tokens.map((t) =>
          t.id === tokenId && t.status === 'waiting' ? { ...t, status: 'cancelled' } : t
        ),
      };
    }

    case 'NEXT_CLIENT': {
      const { orgId, queueId } = action.payload;
      const { queue } = findOrgQueue(state.organizations, orgId, queueId);
      if (!queue) return state;

      const sortedWaiting = getSortedWaiting(state.tokens, queueId);
      const next = sortedWaiting[0] || null;

      const tokens = state.tokens.map((t) => {
        if (t.id === queue.currentServingTokenId && t.status === 'serving') {
          return { ...t, status: 'served' };
        }
        if (next && t.id === next.id) {
          return { ...t, status: 'serving' };
        }
        return t;
      });

      return {
        ...state,
        tokens,
        organizations: state.organizations.map((o) =>
          o.id !== orgId
            ? o
            : {
                ...o,
                queues: o.queues.map((q) =>
                  q.id !== queueId ? q : { ...q, currentServingTokenId: next ? next.id : null }
                ),
              }
        ),
      };
    }

    case 'ADD_QUEUE': {
      const { orgId, queue } = action.payload;
      const id = `q-${orgId}-${Date.now()}`;
      return {
        ...state,
        organizations: state.organizations.map((o) =>
          o.id !== orgId
            ? o
            : {
                ...o,
                queues: [
                  ...o.queues,
                  {
                    id,
                    name: queue.name,
                    prefix: queue.prefix || queue.name,
                    maxQuota: queue.maxQuota,
                    totalGenerated: 0,
                    estimatedWaitTimePerPerson: queue.estimatedWaitTimePerPerson,
                    active: true,
                    currentServingTokenId: null,
                  },
                ],
              }
        ),
      };
    }

    case 'DELETE_QUEUE': {
      const { orgId, queueId } = action.payload;
      return {
        ...state,
        organizations: state.organizations.map((o) =>
          o.id !== orgId ? o : { ...o, queues: o.queues.filter((q) => q.id !== queueId) }
        ),
        tokens: state.tokens.filter((t) => t.queueId !== queueId),
      };
    }

    case 'TOGGLE_QUEUE_ACTIVE': {
      const { orgId, queueId } = action.payload;
      return {
        ...state,
        organizations: state.organizations.map((o) =>
          o.id !== orgId
            ? o
            : {
                ...o,
                queues: o.queues.map((q) =>
                  q.id !== queueId ? q : { ...q, active: !q.active }
                ),
              }
        ),
      };
    }

    case 'UPDATE_QUOTA': {
      const { orgId, queueId, maxQuota } = action.payload;
      return {
        ...state,
        organizations: state.organizations.map((o) =>
          o.id !== orgId
            ? o
            : {
                ...o,
                queues: o.queues.map((q) =>
                  q.id !== queueId ? q : { ...q, maxQuota: Math.max(q.totalGenerated, maxQuota) }
                ),
              }
        ),
      };
    }

    default:
      return state;
  }
}

export function QueueProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      bookToken: (orgId, queueId, priority, holder = 'me') =>
        dispatch({ type: 'BOOK_TOKEN', payload: { orgId, queueId, priority, holder } }),
      cancelToken: (tokenId) => dispatch({ type: 'CANCEL_TOKEN', payload: { tokenId } }),
      nextClient: (orgId, queueId) => dispatch({ type: 'NEXT_CLIENT', payload: { orgId, queueId } }),
      addQueue: (orgId, queue) => dispatch({ type: 'ADD_QUEUE', payload: { orgId, queue } }),
      deleteQueue: (orgId, queueId) => dispatch({ type: 'DELETE_QUEUE', payload: { orgId, queueId } }),
      toggleQueueActive: (orgId, queueId) =>
        dispatch({ type: 'TOGGLE_QUEUE_ACTIVE', payload: { orgId, queueId } }),
      updateQuota: (orgId, queueId, maxQuota) =>
        dispatch({ type: 'UPDATE_QUOTA', payload: { orgId, queueId, maxQuota } }),
    }),
    []
  );

  return (
    <QueueStateContext.Provider value={state}>
      <QueueActionsContext.Provider value={actions}>{children}</QueueActionsContext.Provider>
    </QueueStateContext.Provider>
  );
}

export function useQueueState() {
  const ctx = useContext(QueueStateContext);
  if (!ctx) throw new Error('useQueueState must be used inside <QueueProvider>');
  return ctx;
}

export function useQueueActions() {
  const ctx = useContext(QueueActionsContext);
  if (!ctx) throw new Error('useQueueActions must be used inside <QueueProvider>');
  return ctx;
}

export function useQueue() {
  const state = useQueueState();
  const actions = useQueueActions();

  const getOrg = useCallback((orgId) => state.organizations.find((o) => o.id === orgId), [
    state.organizations,
  ]);
  const getQueue = useCallback(
    (orgId, queueId) => getOrg(orgId)?.queues.find((q) => q.id === queueId),
    [getOrg]
  );
  const getMyTokens = useCallback(
    () =>
      state.tokens
        .filter((t) => t.holder === 'me' && t.status !== 'cancelled')
        .sort((a, b) => b.bookedAt - a.bookedAt),
    [state.tokens]
  );

  return { ...state, ...actions, getOrg, getQueue, getMyTokens };
}

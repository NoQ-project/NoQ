import API from './api';

export const adminService = {
  // Dashboard
  getDashboard: async () => {
    const response = await API.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async (page = 1, limit = 20, search = '') => {
    const response = await API.get('/admin/users', { params: { page, limit, search } });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await API.get(`/admin/users/${userId}`);
    return response.data;
  },

  toggleUserStatus: async (userId, currentActiveStatus) => {
    const response = await API.patch(`/admin/users/${userId}/status`, null, {
      params: { is_active: !currentActiveStatus }
    });
    return response.data;
  },

  // Institutions
  getInstitutions: async (page = 1, limit = 20, search = '') => {
    const response = await API.get('/admin/institutions', { params: { page, limit, search } });
    return response.data;
  },

  getInstitutionDetail: async (institutionId) => {
    const response = await API.get(`/admin/institutions/${institutionId}`);
    return response.data;
  },

  // Queues
  getQueues: async (page = 1, limit = 20, search = '') => {
    const response = await API.get('/admin/queues', { params: { page, limit, search } });
    return response.data;
  },

  getQueueById: async (queueId) => {
    const response = await API.get(`/admin/queues/${queueId}`);
    return response.data;
  },

  toggleQueueStatus: async (queueId, currentActiveStatus) => {
    const response = await API.patch(`/admin/queues/${queueId}/status`, null, {
      params: { is_active: !currentActiveStatus }
    });
    return response.data;
  },

  // Tokens
  getTokens: async (page = 1, limit = 20) => {
    const response = await API.get('/admin/tokens', { params: { page, limit } });
    return response.data;
  },

  getTokenById: async (tokenId) => {
    const response = await API.get(`/admin/tokens/${tokenId}`);
    return response.data;
  },

  cancelToken: async (tokenId) => {
    const response = await API.patch(`/admin/tokens/${tokenId}/cancel`);
    return response.data;
  },

  // Audit Logs
  getLogs: async (page = 1, limit = 20) => {
    const response = await API.get('/admin/logs', { params: { page, limit } });
    return response.data;
  },

  getLogById: async (logId) => {
    const response = await API.get(`/admin/logs/${logId}`);
    return response.data;
  }
};
import API from './api';

export const institutionsService = {
  async createInstitution(data) {
    const response = await API.post('/institutions/', data);
    return response.data;
  },

  async getDashboard() {
    const response = await API.get('/institutions/dashboard');
    return response.data;
  },

  async updateInstitution(institutionId, data) {
    const response = await API.put(`/institutions/${institutionId}`, data);
    return response.data;
  },

  async fetchQueues() {
    const response = await API.get('/institutions/queues');
    return response.data;
  },

  async createQueue(queueData) {
    const response = await API.post('/institutions/queues', queueData);
    return response.data;
  },

  async deleteQueue(queueId) {
    const response = await API.delete(`/institutions/queues/${queueId}`);
    return response.data;
  },

  async setQueueLimits(queueId, limitsData) {
    const response = await API.patch(`/institutions/queues/${queueId}/limits`, limitsData);
    return response.data;
  },
};

export default institutionsService;
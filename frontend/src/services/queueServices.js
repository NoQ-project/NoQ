import API from './api';

export const queueServices = {
  // POST /queues/ (Create Queue)
  async createQueue(queueData) {
    const response = await API.post('/queues/', queueData);
    return response.data;
  },

  // PUT /queues/{queue_id} (Update Queue)
  async updateQueue(queueId, queueData) {
    const response = await API.put(`/queues/${queueId}`, queueData);
    return response.data;
  },

  // DELETE /queues/{queue_id} (Delete Queue)
  async deleteQueue(queueId) {
    const response = await API.delete(`/queues/${queueId}`);
    return response.data;
  },

  // GET /queues/{institution_id} (Get Queues for Institution)
  async getQueuesByInstitution(institutionId) {
    const response = await API.get(`/queues/${institutionId}`);
    return response.data;
  },

  // GET /queues/details/{queue_id} (Get Queue Details)
  async getQueueDetails(queueId) {
    const response = await API.get(`/queues/details/${queueId}`);
    return response.data;
  },

  // GET /queues/dashboard/{queue_id} (Get Queue Dashboard)
  async getQueueDashboard(queueId) {
    const response = await API.get(`/queues/dashboard/${queueId}`);
    return response.data;
  },

  // GET /queues/statistics/{queue_id} (Get Queue Statistics)
  async getQueueStatistics(queueId) {
    const response = await API.get(`/queues/statistics/${queueId}`);
    return response.data;
  },

  // PATCH /queues/{queue_id}/toggle-status (Toggle Active/Pause State)
  async toggleQueueStatus(queueId) {
    const response = await API.patch(`/queues/${queueId}/toggle-status`);
    return response.data;
  },
};

export default queueServices;
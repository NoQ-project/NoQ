const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Helper function to retrieve authorization headers with JWT token.
 * Checks for both 'token' and 'access_token' keys in localStorage.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Common response handler for checking non-2xx HTTP responses
 */
const handleResponse = async (response, defaultMessage) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || defaultMessage);
  }
  return await response.json();
};

export const queueServices = {
  // POST /queues/ (Create Queue)
  async createQueue(queueData) {
    const response = await fetch(`${API_BASE_URL}/queues/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(queueData),
    });
    return handleResponse(response, 'Failed to create queue.');
  },

  // PUT /queues/{queue_id} (Update Queue)
  async updateQueue(queueId, queueData) {
    const response = await fetch(`${API_BASE_URL}/queues/${queueId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(queueData),
    });
    return handleResponse(response, 'Failed to update queue.');
  },

  // DELETE /queues/{queue_id} (Delete Queue)
  async deleteQueue(queueId) {
    const response = await fetch(`${API_BASE_URL}/queues/${queueId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to delete queue.');
  },

  // GET /queues/{institution_id} (Get Queues for Institution)
  async getQueuesByInstitution(institutionId) {
    const response = await fetch(`${API_BASE_URL}/queues/${institutionId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to fetch queues for institution.');
  },

  // GET /queues/details/{queue_id} (Get Queue Details)
  async getQueueDetails(queueId) {
    const response = await fetch(`${API_BASE_URL}/queues/details/${queueId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to fetch queue details.');
  },

  // GET /queues/dashboard/{queue_id} (Get Queue Dashboard)
  async getQueueDashboard(queueId) {
    const response = await fetch(`${API_BASE_URL}/queues/dashboard/${queueId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to fetch queue dashboard.');
  },

  // GET /queues/statistics/{queue_id} (Get Queue Statistics)
  async getQueueStatistics(queueId) {
    const response = await fetch(`${API_BASE_URL}/queues/statistics/${queueId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to fetch queue statistics.');
  },

  // PATCH /queues/{queue_id}/toggle-status (Toggle Active/Pause State)
  async toggleQueueStatus(queueId) {
    const response = await fetch(`${API_BASE_URL}/queues/${queueId}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to toggle queue status.');
  },
};

export default queueServices;
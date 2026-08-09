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

/**
 * Service to handle all Institution and Queue-related API calls
 */
export const institutionsService = {
  // --- Institution Profile Operations ---
  
  // POST /institutions/
  async createInstitution(data) {
    const response = await fetch(`${API_BASE_URL}/institutions/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response, 'Failed to create institution profile.');
  },

  // GET /institutions/dashboard
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/institutions/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to fetch dashboard metrics.');
  },

  // PUT /institutions/{institutionId}
  async updateInstitution(institutionId, data) {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response, 'Failed to update institution profile.');
  },

  // --- Queue Structure & Constraint Operations ---

  // GET /institutions/queues
  async fetchQueues() {
    const response = await fetch(`${API_BASE_URL}/institutions/queues`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to fetch queue list.');
  },

  // POST /institutions/queues
  async createQueue(queueData) {
    const response = await fetch(`${API_BASE_URL}/institutions/queues`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(queueData),
    });
    return handleResponse(response, 'Failed to create queue.');
  },

  // DELETE /institutions/queues/{queueId}
  async deleteQueue(queueId) {
    const response = await fetch(`${API_BASE_URL}/institutions/queues/${queueId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, 'Failed to delete queue.');
  },

  // PATCH /institutions/queues/{queueId}/limits
  async setQueueLimits(queueId, limitsData) {
    const response = await fetch(`${API_BASE_URL}/institutions/queues/${queueId}/limits`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(limitsData),
    });
    return handleResponse(response, 'Failed to update queue parameters.');
  },
};

export default institutionsService;
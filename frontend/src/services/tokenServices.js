import API from './api';

export const tokenService = {
  async getNotifications() {
    const response = await API.get('/notifications');
    return response.data;
  },

  async markNotificationRead(notificationId) {
    const response = await API.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllNotificationsRead() {
    const response = await API.patch('/notifications/read-all');
    return response.data;
  },

  async getMyTokens() {
    const response = await API.get('/tokens/my-tokens');
    return response.data; // returns a flat array of tokens
  },

  // Updated to match the backend route: prefix '/institutions' + GET '/'
  async getOrganizations() {
    const response = await API.get('/institutions/');
    return response.data;
  },

  // Book token for a specific queue. Backend expects `queue_id` as a query param.
  async bookToken(queueId, bookingDate) {
    const response = await API.post(
      '/tokens/book',
      null,
      {
        params: {
          queue_id: queueId,
          booking_date: bookingDate,
        },
      }
    );
    return response.data;
  },

  // Cancel a token. Backend: PATCH /tokens/{token_id}/cancel?queue_id=...
  async cancelToken(tokenId, queueId) {
    const response = await API.patch(
      `/tokens/${tokenId}/cancel`,
      null,
      {
        params: { queue_id: queueId },
      }
    );
    return response.data;
  },

  // Get waiting position for a token. Backend: GET /tokens/{token_id}/waiting-position
  async getWaitingPosition(tokenId) {
    const response = await API.get(`/tokens/${tokenId}/waiting-position`);
    return response.data; // returns { token_number, waiting_position, estimated_waiting_time }
  },

  // Get currently serving token for a queue. Backend: GET /tokens/current-token/{queue_id}
  async getCurrentToken(queueId) {
    const response = await API.get(`/tokens/current-token/${queueId}`);
    return response.data; // returns { token_number, status }
  },

  // Get all waiting tokens for a queue. Backend: GET /tokens/waiting-tokens/{queue_id}
  async getWaitingTokens(queueId) {
    const response = await API.get(`/tokens/waiting-tokens/${queueId}`);
    return response.data; // returns array of { token_number, status }
  },

  // Advance queue: mark current serving token as COMPLETED or MISSED, serve next.
  // result: 'COMPLETED' | 'MISSED' (default COMPLETED)
  // Backend: POST /tokens/advance/{queue_id}?result=...
  async advanceToken(queueId, result = 'COMPLETED') {
    const response = await API.post(`/tokens/advance/${queueId}`, null, {
      params: { result },
    });
    return response.data;
  },

  // Close the day: cancel all remaining WAITING tokens for today and notify users.
  // Backend: POST /tokens/close-day/{queue_id}
  async closeDay(queueId) {
    const response = await API.post(`/tokens/close-day/${queueId}`);
    return response.data;
  },
};

export default tokenService;
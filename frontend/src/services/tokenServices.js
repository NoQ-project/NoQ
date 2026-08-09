import API from './api';

export const tokenService = {
  async getNotifications() {
    const response = await API.get('/notifications');
    return response.data;
  },

  async getMyTokens() {
    const response = await API.get('/tokens/my-tokens');
    return response.data;
  },

  // Updated to match the backend route: prefix '/institutions' + GET '/'
  async getOrganizations() {
    const response = await API.get('/institutions/');
    return response.data;
  },

  // Add this method to resolve the error
  async bookToken(orgId, bookingDate) {
    const response = await API.post('/tokens/book', { 
      org_id: orgId, 
      booking_date: bookingDate 
    });
    return response.data;
  }
};

export default tokenService;
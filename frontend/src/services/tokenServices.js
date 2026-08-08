import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000', // Adjust to your API base URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tokenService = {
  // GET /tokens/my-tokens
  getMyTokens: async () => {
    const response = await API.get('/tokens/my-tokens');
    return response.data;
  },

  // POST /tokens/book
  bookToken: async (queueId) => {
    const response = await API.post('/tokens/book', {
      queue_id: Number(queueId)
    });
    return response.data;
  },

  // PATCH /tokens/{token_id}/cancel
  cancelToken: async (tokenId) => {
    const response = await API.patch(`/tokens/${tokenId}/cancel`);
    return response.data;
  },

  // GET /tokens/{token_id}/waiting-position
  getWaitingPosition: async (tokenId) => {
    const response = await API.get(`/tokens/${tokenId}/waiting-position`);
    return response.data;
  }
};

export default tokenService;
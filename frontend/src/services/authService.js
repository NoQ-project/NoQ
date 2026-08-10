import API from './api';

export const authService = {
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  verifyRegister: async (payload) => {
    const response = await API.post('/auth/verify_register', payload);
    return response.data;
  },

  resendOtp: async (email) => {
    const response = await API.post('/auth/resend_otp', { email });
    return response.data;
  },

  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },

  // 👈 Get current user details and role
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  requestResetPassword: async (email) => {
    const response = await API.post('/auth/request_reset_password', { email });
    return response.data;
  },

  verifyResetPassword: async (email, otp) => {
    const response = await API.post('/auth/verify_reset_password', { email, otp });
    return response.data;
  },

  resetPassword: async (email, new_password) => {
    const response = await API.post('/auth/reset_password', { email, new_password });
    return response.data;
  },

  refreshToken: async () => {
    const response = await API.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await API.post('/auth/logout');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    return response.data;
  }
};
import API from './api';

export const authService = {
  // 1. POST /auth/register
  register: async (first_name, last_name, role, email, password) => {
    const response = await API.post('/auth/register', {
      first_name,
      last_name,
      role: role || 'USER',
      email,
      password,
    });
    return response.data;
  },

  // 2. POST /auth/verify_register
  verifyRegister: async (email, otp) => {
    const response = await API.post('/auth/verify_register', { email, otp });
    return response.data;
  },

  // 3. POST /auth/resend_otp
  resendOtp: async (email) => {
    const response = await API.post('/auth/resend_otp', { email });
    return response.data;
  },

  // 4. POST /auth/login
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },

  // 5. POST /auth/request_reset_password
  requestResetPassword: async (email) => {
    const response = await API.post('/auth/request_reset_password', { email });
    return response.data;
  },

  // 6. POST /auth/verify_reset_password
  verifyResetPassword: async (email, otp) => {
    const response = await API.post('/auth/verify_reset_password', { email, otp });
    return response.data;
  },

  // 7. POST /auth/reset_password
  resetPassword: async (email, otp, new_password) => {
    const response = await API.post('/auth/reset_password', {
      email,
      otp,
      new_password,
    });
    return response.data;
  },

  // 8. POST /auth/refresh
  refreshToken: async (refresh_token) => {
    const response = await API.post('/auth/refresh', { refresh_token });
    return response.data;
  },
};
import API from './api';

/**
 * Authentication service for handling user registration, login, and password reset
 * All endpoints use the API service which has proper error handling and auth headers
 */
export const authService = {
  /**
   * Register a new user (email verification required)
   * @param {Object} data - User registration data
   * @param {string} data.first_name - User's first name
   * @param {string} data.last_name - User's last name
   * @param {string} data.email - User's email
   * @param {string} data.password - User's password
   * @param {string} data.role - User's role ('user' or 'institution')
   * @returns {Promise} Response data including message and registration details
   */
  register: async ({ first_name, last_name, role, email, password }) => {
    try {
      // Normalize role to lowercase
      let normalizedRole = (role || 'user').toLowerCase();
      if (normalizedRole === 'organization') {
        normalizedRole = 'institution';
      }

      const response = await API.post('/auth/register', {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: normalizedRole, 
        email: email.trim().toLowerCase(),
        password: password,
      });

      console.log(' Registration initiated:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Registration error:', error.message);
      throw error;
    }
  },

  /**
   * Verify email with OTP code
   * @param {string} email - User's email
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise} Response data including user info and tokens (optional)
   */
  verifyRegister: async (email, otp) => {
    try {
      const response = await API.post('/auth/verify_register', {
        email: email.trim().toLowerCase(),
        otp: String(otp).trim(),
      });

      console.log('Email verified:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Verification error:', error.message);
      throw error;
    }
  },

  /**
   * Resend OTP to user's email
   * @param {string} email - User's email
   * @returns {Promise} Response data with message
   */
  resendOtp: async (email) => {
    try {
      const response = await API.post('/auth/resend_otp', {
        email: email.trim().toLowerCase()
      });

      console.log(' OTP resent:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Resend OTP error:', error.message);
      throw error;
    }
  },

  /**
   * Login user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} Response data including message and auth info
   */
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Login error:', error.message);
      throw error;
    }
  },

  /**
   * Request password reset (sends OTP to email)
   * @param {string} email - User's email
   * @returns {Promise} Response data with message
   */
  requestResetPassword: async (email) => {
    try {
      const response = await API.post('/auth/request_reset_password', {
        email: email.trim().toLowerCase()
      });

      console.log(' Password reset requested:', response.data);
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error.message);
      throw error;
    }
  },

  /**
   * Verify password reset OTP
   * @param {string} email - User's email
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise} Response data with verification status
   */
  verifyResetPassword: async (email, otp) => {
    try {
      const response = await API.post('/auth/verify_reset_password', {
        email: email.trim().toLowerCase(),
        otp: String(otp).trim()
      });

      console.log(' Reset password verified:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Reset password verification error:', error.message);
      throw error;
    }
  },

  /**
   * Reset password with new password
   * @param {string} email - User's email
   * @param {string} otp - 6-digit OTP code (from verification)
   * @param {string} new_password - New password
   * @returns {Promise} Response data with success message
   */
  resetPassword: async (email, otp, new_password) => {
    try {
      const response = await API.post('/auth/reset_password', {
        email: email.trim().toLowerCase(),
        otp: String(otp).trim(),
        new_password: new_password
      });

      console.log(' Password reset successful:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Password reset error:', error.message);
      throw error;
    }
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refresh_token - Refresh token (usually from localStorage)
   * @returns {Promise} Response data with new access token
   */
  refreshToken: async (refresh_token) => {
    try {
      const response = await API.post('/auth/refresh', {
        refresh_token: refresh_token
      });

      console.log('✅ Token refreshed');
      return response.data;
    } catch (error) {
      console.error('❌ Token refresh error:', error.message);
      throw error;
    }
  },

  /**
   * Logout user (clears tokens)
   * @returns {Promise} Response data with logout message
   */
  logout: async () => {
    try {
      const response = await API.post('/auth/logout', {});
      
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');

      console.log(' Logout successful:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Logout error:', error.message);
      // Clear tokens anyway
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      throw error;
    }
  }
};
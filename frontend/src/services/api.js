import axios from 'axios';

/**
 * Get the base URL for API calls based on environment
 * Uses VITE_API_BASE_URL from .env, defaults to localhost:8000
 */
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Default for development
  return 'http://localhost:8000';
};

const BASE_URL = getBaseURL();

console.log(`🌐 API Base URL: ${BASE_URL}`);

/**
 * Create Axios instance with default configuration
 */
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,  // ✅ CRITICAL: Enable cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,  // ✅ CRITICAL: Timeout after 10 seconds to prevent hanging
});

/**
 * Request Interceptor
 * Adds authorization token to requests if available in localStorage
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors and implements retry logic for 401 responses
 */
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          console.log('🔄 Attempting to refresh token...');
          
          const response = await API.post('/auth/refresh', {
            refresh_token: refreshToken
          });

          const newAccessToken = response.data.access_token;
          localStorage.setItem('accessToken', newAccessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.message);
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }

    // Extract error message from response
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: message,
      timestamp: new Date().toISOString()
    });

    return Promise.reject(new Error(message));
  }
);

export default API;
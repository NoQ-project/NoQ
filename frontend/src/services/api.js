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

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

/**
 * Response Interceptor
 * Handles errors and implements retry logic for 401 responses using HTTP-only cookies
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
        console.log('🔄 Attempting to refresh token via cookie...');
        
        // Backend handles refresh token automatically via cookies
        await API.post('/auth/refresh');
        
        // Retry original request
        return API(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.message);
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
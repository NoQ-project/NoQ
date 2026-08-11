import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    if (
      envUrl.startsWith('http://localhost:8000') ||
      envUrl.startsWith('http://127.0.0.1:8000') ||
      envUrl.startsWith('https://localhost:8000') ||
      envUrl.startsWith('https://127.0.0.1:8000')
    ) {
      return '/api';
    }
    return envUrl;
  }

  // Use the Vite dev proxy in development so cookies are sent correctly
  // from the same origin and backend auth cookies can be stored.
  return '/api';
};

const BASE_URL = getBaseURL();

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// ============================================
// REQUEST INTERCEPTOR - Add token to headers
// ============================================
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (token) {
      // Add Bearer token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - Handle 401 & refresh
// ============================================
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if:
    // 1. Status is 401 (Unauthorized)
    // 2. Haven't already retried this request
    // 3. This isn't an auth endpoint itself (login/register/refresh/etc - prevent infinite loop
    //    and prevent bad-credential 401s from being misread as expired-session 401s)
    const isAuthEndpoint =
      originalRequest.url &&
      [
        '/auth/refresh',
        '/auth/login',
        '/auth/register',
        '/auth/verify_register',
        '/auth/resend_otp',
        '/auth/request_reset_password',
        '/auth/verify_reset_password',
        '/auth/reset_password',
      ].some((path) => originalRequest.url.includes(path));

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Token expired. Attempting refresh...');
        
        // Call refresh endpoint
        const refreshResponse = await API.post('/auth/refresh');
        
        // Extract new token from response
        const newToken = refreshResponse.data?.access_token || refreshResponse.data?.token;
        
        if (newToken) {
          // Store new token
          localStorage.setItem('token', newToken);
          
          // Update the failed request's Authorization header
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          console.log('✅ Token refreshed successfully');
          
          // Retry the original request with new token
          return API(originalRequest);
        } else {
          throw new Error('No token in refresh response');
        }
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.message);
        
        // Clear all stored tokens
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        // Redirect to login (only if not already on login page)
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/' && currentPath !== '/auth') {
          console.log('🔴 Redirecting to login...');
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // If not a 401 or refresh already attempted, extract error message
    const status = error.response?.status;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred.';

    const isExpected404 = status === 404 && originalRequest?.url?.includes('/tokens/current-token/');

    if (!isExpected404) {
      console.error('API Error:', {
        status: status,
        message: message,
        url: originalRequest?.url,
      });
    }

    const errObj = new Error(message);
    errObj.status = status;
    return Promise.reject(errObj);
  }
);

export default API;
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

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop if the refresh endpoint itself returns 401
    if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await API.post('/auth/refresh');
        return API(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.message);
        // Clear local storage tokens if any exist
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        
        // Redirect to login only once
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    return Promise.reject(new Error(message));
  }
);

export default API;
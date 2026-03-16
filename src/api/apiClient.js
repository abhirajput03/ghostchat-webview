import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-dev-98922003738.europe-west1.run.app';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let memToken = null;

export const setAuthToken = (token) => {
  memToken = token;
};

// Request interceptor — attach auth token if available
apiClient.interceptors.request.use(
  (config) => {
    if (memToken) {
      config.headers.Authorization = `Bearer ${memToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error || error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  },
);

export default apiClient;

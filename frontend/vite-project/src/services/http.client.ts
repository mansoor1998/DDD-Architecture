import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.detail ?? 
      error.response?.data?.message ?? 
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

// Request interceptor to add the auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

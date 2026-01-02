import axios from 'axios';

// Define the base URL (can come from .env environment variables)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Before Sending)
api.interceptors.request.use(
  (config) => {
    // Aqui você pode injetar o token de autenticação automaticamente
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (When returning from the server)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Comprehensive error handling
    if (error.response?.status === 401) {
      // Ex: Redirect to login if token expires.
      console.error('Sessão expirada');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export { api };
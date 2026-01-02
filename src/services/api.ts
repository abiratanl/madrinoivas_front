import axios from 'axios';

// Create the instance
const api = axios.create({
  // Use your backend URL.
// Tip: In Vite, we use import.meta.env for environment variables.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', 
});

// REQUEST INTERCEPTOR (The "Toll")
// Before each request is sent, it injects the token.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// RESPONSE INTERCEPTOR (Optional, but recommended)
// If the backend returns a 401 (Token Expired), automatically log the user out.
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn("Sessão expirada. Limpando dados locais.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Opcional: window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;
export { api }; // Double export to avoid import errors.
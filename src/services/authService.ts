import api from './api';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  /**
   * Send the recovery link to the user's email.
   * POST /auth/forgot-password
   */
  forgotPassword: async (email: string) => {
    // Ajuste '/auth' se o prefixo da sua rota no backend for diferente
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Change the user's password while authenticated.
   * PUT /users/change-password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
  // O caminho deve incluir o prefixo /api que você usa no seu app.js
  const response = await api.post('/auth/change-password', { 
    currentPassword, 
    newPassword 
  });
  return response.data;
},

  /**
   * Reset your password using the token received by email..
   * POST /auth/reset-password/:token
   */
  resetPassword: async (token: string, password: string) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  }
};
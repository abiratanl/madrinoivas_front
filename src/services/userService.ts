// src/services/userService.ts
import api from './api'; 

// --- Interfaces ---

export interface User {
  id: number; // CHANGED: from string to number (MySQL INT)
  name: string;
  email: string;
  role: 'admin' | 'proprietario' | 'atendente' | 'cliente';
  is_active: boolean | number;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role: string;
  store_id?: string | number | null;
}

// Better than 'any', defines exactly what can be updated
export interface UpdateUserDTO {
  name?: string;
  role?: string;
  is_active?: boolean;
  store_id?: string | number | null;
}

// --- Service Object ---

export const userService = {
  /**
   * GET /users
   * Retrieves all users.
   */
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  /**
   * POST /users
   * Creates a new user.
   */
  create: async (data: CreateUserDTO) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  /**
   * PUT /users/:id
   * Updates an existing user.
   */
  update: async (id: number | string, data: UpdateUserDTO) => { 
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /users/:id
   * Removes (or deactivates) a user.
   */
  delete: async (id: number | string) => { 
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
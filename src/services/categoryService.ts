import { api } from './api';

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number | null; // Para subcategorias
}

export const categoryService = {
  // GET / (Public or Protected)
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data; // Retorna { status: 'success', data: [...] }
  },

  // GET /:id
  getById: async (id: number | string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // POST / (Protected)
  create: async (data: Omit<Category, 'id'>) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // PUT /:id (Protected)
  update: async (id: number | string, data: Partial<Category>) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // DELETE /:id (Protected)
  delete: async (id: number | string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};
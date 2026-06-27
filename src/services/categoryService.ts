import { api } from "./api";

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number | null;
}

export const categoryService = {
  // ADICIONAMOS ': Promise<Category[]>' para o TypeScript entender que devolve uma lista
  getAll: async (): Promise<Category[]> => {
    const response = await api.get("/categories");

    // CORREÇÃO: Pegamos o .data interno onde está a lista real
    // Se o seu backend retorna { status: 'success', data: [...] }, usamos response.data.data
    // Se retornar direto [...], usamos response.data
    // O código abaixo cobre os dois casos:
    return response.data.data || response.data || [];
  },
  getById: async (id: string | number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // POST / (Protected)
  create: async (data: Omit<Category, "id">) => {
    const response = await api.post("/categories", data);
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
  },
};

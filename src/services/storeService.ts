import { api } from './api';

export interface Store {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  cnpj?: string;
  digital_signature_base64?: string;
}

export const storeService = {
  // Busca todas as lojas
  getAll: async () => {
    const response = await api.get('/stores');
    
    // Garante que retorna um Array limpo, independente do formato { data: [...] } ou [...]
    return response.data.data || response.data || [];
  },

  // Busca uma loja específica (útil futuramente)
  getById: async (id: number | string) => {
    const response = await api.get(`/stores/${id}`);
    return response.data.data || response.data;
  }
};
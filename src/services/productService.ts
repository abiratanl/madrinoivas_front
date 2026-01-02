import { api } from './api';

// Tipagem dos dados do Produto (conforme seu Model)
export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  size?: string;
  color?: string;
  brand?: string;
  purchase_price?: number;
  rental_price: number;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  category_id: number;
  store_id: number;
  is_featured: boolean;
  images?: { id: number; url: string; url_thumb: string }[]; // Array de imagens
}

// Filtros aceitos pelo GetAll
export interface ProductFilters {
  store_id?: number;
  category_id?: number;
  status?: string;
  is_featured?: boolean;
  global_search?: boolean;
  search?: string; // Caso queira buscar por nome/código
}

export const productService = {
  // 1. Listar Produtos (com filtros)
  getAll: async (filters?: ProductFilters) => {
    // O Axios converte o objeto filters em query string automaticamente:
    // ?store_id=1&status=available
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  // 2. Obter Detalhes (com Imagens)
  getById: async (id: number | string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // 3. Criar Produto (COM UPLOAD DE IMAGEM)
  // Nota: Recebe FormData porque o backend usa multer
  create: async (formData: FormData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Obrigatório para envio de arquivos
      },
    });
    return response.data;
  },

  // 4. Atualizar Produto
  update: async (id: number | string, formData: FormData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 5. Deletar Produto
  delete: async (id: number | string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
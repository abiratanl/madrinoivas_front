import { api } from './api';

// Interface para o item do aluguel (frontend envia ID e Quantidade)
export interface RentalProductItem {
  id: number;     // ID do produto
  quantity?: number; // Backend assume 1 se não enviar, mas bom ter
}

// Interface para criar um aluguel (Payload do POST)
export interface CreateRentalDTO {
  customer_id: number;
  start_date: string;       // Formato ISO ou YYYY-MM-DD
  end_date_scheduled: string;
  products: RentalProductItem[]; // Array de produtos
  installments_config?: any;     // Configuração de parcelamento (se houver)
  store_id?: number;             // Opcional (backend pega do token se for vendedor)
  status?: 'budget' | 'active';  // Opcional (default costuma ser active ou budget)
}

// Interface de Leitura (O que vem do banco)
export interface Rental {
  id: number;
  customer_id: number;
  store_id: number;
  status: 'pending' | 'active' | 'picked_up' | 'returned' | 'late' | 'cancelled' | 'budget';
  total_price: number;
  start_date: string;
  end_date_scheduled: string;
  items?: any[]; // Itens populados se o backend retornar
}

export const rentalService = {
  // GET / - Listar aluguéis (aceita filtros como status)
  getAll: async (filters?: { status?: string }) => {
    const response = await api.get('/rentals', { params: filters });
    return response.data; // { status: 'success', data: [...] }
  },

  // GET /:id - Detalhes do aluguel
  getById: async (id: number | string) => {
    const response = await api.get(`/rentals/${id}`);
    return response.data;
  },

  // POST / - Criar Aluguel (Transacional)
  create: async (data: CreateRentalDTO) => {
    const response = await api.post('/rentals', data);
    return response.data;
  },

  // POST /:id/return - Realizar Devolução
  // O backend apenas altera status e libera produtos (clean return)
  returnRental: async (id: number | string) => {
    const response = await api.post(`/rentals/${id}/return`);
    return response.data;
  },

  // POST /:id/cancel - Cancelar Aluguel
  // Só permitido se não foi retirado (picked_up)
  cancelRental: async (id: number | string) => {
    const response = await api.post(`/rentals/${id}/cancel`);
    return response.data;
  }
};
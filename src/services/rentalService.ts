import { api } from './api';

// Interface para o item do aluguel (frontend envia ID e Quantidade)
export interface RentalProductItem {
  id: string;     // ID do produto (UUID)
  quantity?: number; // Backend assume 1 se não enviar, mas bom ter
}

// Interface para criar um aluguel (Payload do POST)
export interface CreateRentalDTO {
  customer_id: string;
  start_date: string;       // Formato ISO ou YYYY-MM-DD
  end_date_scheduled: string;
  products: RentalProductItem[]; // Array de produtos
  installments_config?: any;     // Configuração de parcelamento (se houver)
  store_id?: string;             // Opcional (backend pega do token se for vendedor)
  status?: 'budget' | 'reserved';  // Opcional (default costuma ser active ou budget)
  discount?: number;             // Desconto em reais
}

// Interface de Leitura (O que vem do banco)
export interface Rental {
  id: string;
  customer_id?: string;
  customer_name?: string; // Nome do cliente (vem do getAll)
  store_id: string;
  status: 'pending' | 'active' | 'picked_up' | 'returned' | 'late' | 'cancelled' | 'budget' | 'reserved';
  total_price: number;
  total_amount?: string | number; // Campo alternativo que pode vir do backend
  start_date: string;
  end_date_scheduled: string;
  items?: any[]; // Itens populados se o backend retornar
  customer?: {
    id: string;
    name: string;
    cpf?: string;
    main_phone?: string;
  };
  discount?: number;
}

export const rentalService = {
  // GET / - Listar aluguéis (aceita filtro de status)
  getAll: async (filters?: { status?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    const response = await api.get('/rentals', { params });
    return response.data.data || response.data;
  },

  // GET /:id - Detalhes do aluguel
  getById: async (id: number | string) => {
    const response = await api.get(`/rentals/${id}`);
    console.log('🔍 Rental getById response:', response.data);
    return response.data.data || response.data;
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
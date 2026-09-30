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
  products?: RentalProductItem[]; // Array de produtos (opcional para update)
  installments_config?: any;     // Configuração de parcelamento (se houver)
  store_id?: string;             // Opcional (backend pega do token se for vendedor)
  status?: 'budget' | 'reserved';  // Opcional (default costuma ser active ou budget)
  discount?: number;             // Desconto em reais
  penalty_fee?: number;          // Valor da multa por atraso
}

// Interface de Leitura (O que vem do banco)
export interface Rental {
  id: string;
  customer_id?: string;
  customer_name?: string; // Nome do cliente (vem do getAll)
  customer_cpf?: string; // CPF do cliente
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
  penalty_fee?: number; // Valor da multa por atraso
  
  // Campos para contrato
  deposit_paid?: number; // Sinal pago
  sinal?: number; // Alias para deposit_paid
  extra_daily_rate?: number; // Valor da diária extra
  daily_rate?: number; // Alias para extra_daily_rate
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
    try {
      // Try sending return_date in case backend expects it
      const response = await api.post(`/rentals/${id}/return`, {
        return_date: new Date().toISOString().split('T')[0]
      });
      return response.data;
    } catch (err: any) {
      console.error('returnRental error:', {
        status: err.response?.status,
        data: JSON.stringify(err.response?.data, null, 2),
        message: err.message
      });
      throw err;
    }
  },

  // POST /:id/pickup - Marcar como Retirado
  pickupRental: async (id: number | string) => {
    const response = await api.post(`/rentals/${id}/pickup`);
    return response.data;
  },

  // POST /:id/cancel - Cancelar Aluguel
  // Só permitido se não foi retirado (picked_up)
  cancelRental: async (id: number | string) => {
    const response = await api.post(`/rentals/${id}/cancel`);
    return response.data;
  },

  // PUT /:id - Atualizar Aluguel
  update: async (id: number | string, data: CreateRentalDTO) => {
    const response = await api.put(`/rentals/${id}`, data);
    return response.data;
  },

  // CONTRATOS
  
  // POST /:id/contract - Gerar contrato com assinatura
  generateContract: async (id: string, data: { lessee_signature: string }) => {
    const response = await api.post(`/rentals/${id}/contract`, data);
    return response.data;
  },

  // POST /:id/contract/send-email - Enviar contrato por email
  sendContractEmail: async (id: string, data: { email: string }) => {
    const response = await api.post(`/rentals/${id}/contract/send-email`, data);
    return response.data;
  },

  // POST /:id/contract/send-whatsapp - Enviar contrato por WhatsApp
  sendContractWhatsApp: async (id: string, data: { phone: string }) => {
    const response = await api.post(`/rentals/${id}/contract/send-whatsapp`, data);
    return response.data;
  },

  // GET /:id/contract/pdf - Baixar PDF do contrato
  getContractPdf: async (id: string) => {
    const response = await api.get(`/rentals/${id}/contract/pdf`, { responseType: 'blob' });
    return response.data;
  },
};
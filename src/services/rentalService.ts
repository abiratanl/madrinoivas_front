import { api } from '@/lib/axios';
import type { RentalInstallment } from './paymentService';

// Interface para o item do aluguel (frontend envia ID e Quantidade)
export interface RentalProductItem {
  id: string;     // ID do produto (UUID)
  quantity?: number; // Backend assume 1 se não enviar, mas bom ter
  // Campos apenas para exibição no front (o backend ignora no payload)
  name?: string;
  code?: string;
  size?: string;
  rental_price?: number;
  image_url?: string;
}

// Item de aluguel como retornado pelo backend (join rental_items + products)
export interface RentalItem {
  id?: string;
  product_id?: string;
  productId?: string;
  product_name?: string;
  product_code?: string;
  name?: string;
  code?: string;
  image_url?: string;
  unit_price?: number | string;
  quantity?: number;
  size?: string;
  product?: {
    name?: string;
    code?: string;
    color?: string;
    size?: string;
    brand?: string;
    model?: string;
    accessories?: string;
    rental_price?: number;
    sale_price?: number;
    image_url?: string;
  };
}

// Interface para criar um aluguel (Payload do POST)
export interface CreateRentalDTO {
  customer_id: string;
  start_date?: string;      // Formato ISO ou YYYY-MM-DD
  end_date_scheduled?: string;
  fitting_date?: string | null; // Data/hora da prova (ISO 8601, opcional)
  products?: RentalProductItem[]; // Array de produtos (opcional para update)
  installments_config?: unknown;     // Configuração de parcelamento (se houver)
  store_id?: string;             // Opcional (backend pega do token se for vendedor)
  status?: 'budget' | 'reserved';  // Opcional (default costuma ser active ou budget)
  discount?: number;             // Desconto em reais
  penalty_fee?: number;          // Valor da multa por atraso
  notes?: string;                // Observações do aluguel
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
  fitting_date?: string | null; // Data/hora da prova (ISO 8601, opcional)
  created_at?: string;
  items?: RentalItem[]; // Itens populados se o backend retornar
  installments?: RentalInstallment[]; // Parcelas populadas no detalhe do aluguel
  customer?: {
    id: string;
    name: string;
    cpf?: string;
    main_phone?: string;
  };
  discount?: number;
  penalty_fee?: number; // Valor da multa por atraso
  notes?: string; // Observações do aluguel
  
  // Campos para contrato
  deposit_paid?: number; // Sinal pago
  sinal?: number; // Alias para deposit_paid
  extra_daily_rate?: number; // Valor da diária extra
  daily_rate?: number; // Alias para extra_daily_rate
}

export const rentalService = {
  // GET / - Listar aluguéis (aceita filtro de status)
  getAll: async (filters?: { status?: string; storeId?: string | number }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.storeId) params.store_id = String(filters.storeId);
    const response = await api.get('/rentals', { params });
    return response.data.data || response.data;
  },

  // GET /:id - Detalhes do aluguel
  getById: async (id: number | string, storeId?: string | number) => {
    const params: Record<string, string> = {};
    if (storeId) params.store_id = String(storeId);
    const response = await api.get(`/rentals/${id}`, { params });
    return response.data.data || response.data;
  },

  // POST / - Criar Aluguel (Transacional)
  create: async (data: CreateRentalDTO) => {
    const response = await api.post('/rentals', data);
    return response.data;
  },

  // POST /:id/return - Realizar Devolução
  // O backend apenas altera status e libera produtos (clean return)
  returnRental: async (id: number | string, options?: { makeAvailable?: boolean; penaltyFee?: number }) => {
    try {
      const response = await api.post(`/rentals/${id}/return`, {
        makeAvailable: options?.makeAvailable || false,
        penaltyFee: options?.penaltyFee || 0,
      });
      return response.data;
    } catch (err) {
      const axiosErr = err as { response?: { status?: number; data?: unknown }; message?: string };
      console.error('returnRental error:', {
        status: axiosErr.response?.status,
        data: JSON.stringify(axiosErr.response?.data, null, 2),
        message: axiosErr.message
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

  // DELETE /:id - Hard Delete (Exclusão física)
  // Apenas para admin/proprietario em registros com status 'cancelled'
  deleteRental: async (id: number | string) => {
    const response = await api.delete(`/rentals/${id}`);
    return response.data;
  },

  // PUT /:id - Atualizar Aluguel
  update: async (id: number | string, data: CreateRentalDTO) => {
    const response = await api.put(`/rentals/${id}`, data);
    return response.data;
  },

  // CONTRATOS
  
  // POST /:id/contract - Gerar contrato com assinatura (fluxo legado)
  generateContract: async (id: string, data: { lessee_signature: string }) => {
    const response = await api.post(`/rentals/${id}/contract`, data);
    return response.data;
  },

  // POST /contracts/generate - Gerar e persistir o PDF original (draft) no R2
  generateContractDraft: async (rentalId: string) => {
    const response = await api.post('/contracts/generate', { rental_id: rentalId });
    return response.data?.data || response.data;
  },

  // POST /contracts/:id/sign - Assinar o draft e persistir o PDF definitivo no R2
  signContract: async (contractId: string, data: { lessee_signature: string }) => {
    const response = await api.post(`/contracts/${contractId}/sign`, data);
    return response.data?.data || response.data;
  },

  // POST /contracts/:id/cancel - Cancelar contrato (admin/owner/local_manager)
  cancelContract: async (contractId: string, notes: string) => {
    const response = await api.post(`/contracts/${contractId}/cancel`, { notes });
    return response.data?.data || response.data;
  },

  // GET /:id/contract - Buscar o contrato assinado mais recente do aluguel
  getContractByRental: async (id: string) => {
    const response = await api.get(`/rentals/${id}/contract`);
    return response.data?.data || response.data;
  },

  // POST /contracts/:id/send-email - Enviar contrato por email (id = contractId)
  sendContractEmail: async (id: string, data: { email: string }) => {
    const response = await api.post(`/contracts/${id}/send-email`, data);
    return response.data?.data || response.data;
  },

  // POST /contracts/:id/send-whatsapp - Enviar contrato por WhatsApp (id = contractId)
  sendContractWhatsApp: async (id: string, data: { phone: string }) => {
    const response = await api.post(`/contracts/${id}/send-whatsapp`, data);
    return response.data?.data || response.data;
  },

  // POST /rentals/:id/contract/send-whatsapp - Send the unsigned contract
  // preview by WhatsApp so the customer can read it before signing
  sendContractPreviewWhatsApp: async (id: string, data: { phone: string }) => {
    const response = await api.post(`/rentals/${id}/contract/send-whatsapp`, data);
    return response.data?.data || response.data;
  },

  // GET /rentals/:id/contract/preview/pdf - Download the unsigned preview PDF
  getContractPreviewPdf: async (id: string) => {
    const response = await api.get(`/rentals/${id}/contract/preview/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // POST /rentals/:id/contract/send-email - Send the unsigned contract preview
  // by e-mail so the customer can read it before signing
  sendContractPreviewEmail: async (id: string, data: { email: string }) => {
    const response = await api.post(`/rentals/${id}/contract/send-email`, data);
    return response.data?.data || response.data;
  },

  // GET /:id/contract/pdf - Baixar PDF do contrato
  getContractPdf: async (id: string) => {
    const response = await api.get(`/rentals/${id}/contract/pdf`, { responseType: 'blob' });
    return response.data;
  },

  // GET /contracts/:id/pdf - Baixar PDF de um contrato já gerado (id = contractId)
  getContractPdfById: async (id: string) => {
    const response = await api.get(`/contracts/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },
};
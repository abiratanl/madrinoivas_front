import { api } from './api';
import { type Customer } from '../types/customer';

export const customerService = {
  // 1. LISTAR CLIENTES (Usa a busca por Nome/CPF que você criou no Model)
  getAll: async (search?: string, includeInactives: boolean = false): Promise<Customer[]> => {
    // Montamos os parâmetros de consulta para a URL
    const params: any = {};
    if (search) params.search = search;
    if (includeInactives) params.includeInactives = true; // Enviado como query string
    
    // Faz a chamada à API: /customers?search=...&includeInactives=true
    const response = await api.get('/customers', { params });
    
    const rawData = response.data.data || [];
    
    // Mantemos a conversão de 0/1 para boolean para evitar erros no TS
    return rawData.map((customer: any) => ({
      ...customer,
      is_active: !!customer.is_active
    }));
  },

  // 2. OBTER DETALHES COMPLETOS (Traz Endereços e Contatos)
  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data.data || response.data;
  },

  // 3. CRIAR CLIENTE (Envia o objeto completo com arrays de addresses e contacts)
  create: async (customerData: Partial<Customer>): Promise<Customer> => {
    const response = await api.post('/customers', customerData);
    return response.data.data || response.data;
  },

  // 4. ATUALIZAR CLIENTE (Focado nos dados principais conforme seu Model.update)
  update: async (id: string, customerData: Partial<Customer>): Promise<boolean> => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data.status === 'success';
  },

  // 5. EXCLUSÃO LÓGICA (Soft Delete)
  softDelete: async (id: string): Promise<boolean> => {
    // Chamada para a rota que marcamos com deleted_at no backend
    const response = await api.delete(`/customers/${id}`);
    return response.data.status === 'success';
  },

  // 6. EXCLUSÃO PERMANENTE (Hard Delete)
  hardDelete: async (id: string): Promise<boolean> => {
    // Caso você crie a rota /customers/:id/hard no futuro
    const response = await api.delete(`/customers/${id}/hard`);
    return response.data.status === 'success';
  }
};
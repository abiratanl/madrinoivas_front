import { api } from './api';
import { type Customer } from '../types/customer';

export const customerService = {
  // 1. LISTAR CLIENTES (Usa a busca por Nome/CPF que você criou no Model)
  getAll: async (search?: string): Promise<Customer[]> => {
    const params = search ? { search } : {};
    const response = await api.get('/customers', { params });
    
    // O seu controller retorna { status: 'success', data: [...] }
    return response.data.data || response.data || [];
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
  }
};
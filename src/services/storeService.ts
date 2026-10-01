// src/services/storeService.ts
import api from './api'; 

// --- Interfaces ---

export interface StoreAddress {
  id?: string;
  type?: 'commercial' | 'residential' | 'delivery';
  label?: string;
  zip_code: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  is_default?: boolean;
}

export interface Store {
  id: string; 
  name: string;
  address: string | null; // formatted address from backend join
  address_id: string | null; // raw FK
  phone: string | null;
  city: string | null;
  state: string | null;
  cnpj: string | null;
  email: string | null;
  digital_signature_base64?: string | undefined;
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
  addresses?: StoreAddress[];
}

export interface CreateStoreDTO {
  name: string;
  phone?: string | null;
  addresses?: StoreAddress[];
}

export interface UpdateStoreDTO {
  name?: string;
  phone?: string | null;
  addresses?: StoreAddress[];
  is_active?: boolean;
}

// --- Service Object ---

export const storeService = {
  /**
   * GET /stores
   * Retrieves all stores.
   */
  getAll: async (showInactive = false) => {
    const response = await api.get('/stores', { params: { showInactive } });
    return response.data;
  },
   
  /**
   * GET /stores/:id
   * Retrieves a single store by ID.
   */
  getById: async (id: string) => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  /**
   * POST /stores
   * Creates a new store.
   */
  create: async (data: CreateStoreDTO) => {
    const response = await api.post('/stores', data);
    return response.data;
  },

  /**
   * PUT /stores/:id
   * Updates an existing store.
   */
  update: async (id: string, data: UpdateStoreDTO) => { 
    const response = await api.put(`/stores/${id}`, data);
    return response.data;
  },

  /**
   * PATCH /stores/:id/active
   * Toggles store active status.
   */
  toggleActive: async (id: string) => { 
    const response = await api.patch(`/stores/${id}/active`);
    return response.data;
  }
};
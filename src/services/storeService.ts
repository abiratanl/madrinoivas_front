// src/services/storeService.ts
import { api } from '@/lib/axios'; 

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

// Must match the `type` ENUM of the contacts table on the backend
export type StoreContactType = 'mobile' | 'whatsapp' | 'landline' | 'email' | 'instagram' | 'facebook';

export interface StoreContact {
  id?: string;
  store_id?: string;
  type: StoreContactType;
  value: string;
  is_primary?: boolean | number;
}

export const STORE_PHONE_CONTACT_TYPES: StoreContactType[] = ['whatsapp', 'mobile', 'landline'];

// Pick the store's main phone-like contact (primary first)
export function getStoreMainPhone(store?: Pick<Store, 'contacts'> | null): string | null {
  const contact = (store?.contacts || [])
    .filter((c) => STORE_PHONE_CONTACT_TYPES.includes(c.type))
    .sort((a, b) => Number(b.is_primary || 0) - Number(a.is_primary || 0))[0];
  return contact?.value || null;
}

// Pick the store's main email contact (primary first)
export function getStoreMainEmail(store?: Pick<Store, 'contacts'> | null): string | null {
  const contact = (store?.contacts || [])
    .filter((c) => c.type === 'email')
    .sort((a, b) => Number(b.is_primary || 0) - Number(a.is_primary || 0))[0];
  return contact?.value || null;
}

export interface Store {
  id: string; 
  name: string;
  address: string | null; // formatted address from backend join
  address_id: string | null; // raw FK
  city: string | null;
  state: string | null;
  cnpj: string | null;
  digital_signature_base64?: string | undefined;
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
  addresses?: StoreAddress[];
  contacts?: StoreContact[];
}

export interface CreateStoreDTO {
  name: string;
  addresses?: StoreAddress[];
  contacts?: StoreContact[];
}

export interface UpdateStoreDTO {
  name?: string;
  addresses?: StoreAddress[];
  contacts?: StoreContact[];
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
   * GET /stores/for-transfer
   * Retrieves stores available for transfer (excludes user's own store).
   * Accessible by attendants.
   */
  getForTransfer: async () => {
    const response = await api.get('/stores/for-transfer');
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
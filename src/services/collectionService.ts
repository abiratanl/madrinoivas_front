import { api } from "./api";

export interface Collection {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  position: number;
  is_active: boolean;
  start_at?: string;
  end_at?: string;
  created_at: string;
  updated_at: string;
  products_count?: number;
  store_name?: string;
}

export interface CreateCollectionDTO {
  store_id: string;
  name: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  position?: number;
  is_active?: boolean;
  start_at?: string;
  end_at?: string;
}

export interface UpdateCollectionDTO extends Partial<CreateCollectionDTO> {}

export const collectionService = {
  getAll: async (filters?: {
    storeId?: string;
    isActive?: boolean;
    slug?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append("store_id", filters.storeId);
    if (filters?.isActive !== undefined) params.append("is_active", String(filters.isActive));
    if (filters?.slug) params.append("slug", filters.slug);

    const queryString = params.toString();
    const url = queryString ? `/collections?${queryString}` : "/collections";

    const response = await api.get(url);
    return response.data.data || response.data || [];
  },

  getAllPublic: async (filters?: {
    storeId?: string;
    isActive?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append("store_id", filters.storeId);
    if (filters?.isActive !== undefined) params.append("is_active", String(filters.isActive));

    const queryString = params.toString();
    const url = queryString ? `/public/collections?${queryString}` : "/public/collections";

    const response = await api.get(url);
    return response.data.data || response.data || [];
  },

  getById: async (id: string) => {
    const response = await api.get(`/collections/${id}`);
    return response.data.data || response.data;
  },

  getBySlug: async (slug: string, storeId: string) => {
    const params = new URLSearchParams();
    params.append("store_id", storeId);
    const response = await api.get(`/public/collections/${slug}?${params.toString()}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateCollectionDTO | FormData) => {
    const response = await api.post("/collections", data);
    return response.data;
  },

  update: async (id: string, data: UpdateCollectionDTO | FormData) => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  },

  linkProducts: async (collectionId: string, productIds: string[]) => {
    const response = await api.patch(`/collections/${collectionId}/products`, {
      product_ids: productIds,
    });
    return response.data;
  },

  unlinkProducts: async (collectionId: string, productIds: string[]) => {
    const response = await api.delete(`/collections/${collectionId}/products`, {
      data: { product_ids: productIds },
    });
    return response.data;
  },
};
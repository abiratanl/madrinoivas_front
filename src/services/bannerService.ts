import { api } from '@/lib/axios';

export interface Banner {
  id: string;
  store_id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  collection_id?: string;
  button_text?: string;
  button_variant: "primary" | "outline" | "ghost";
  overlay_position: "left" | "center" | "right";
  overlay_bg_color?: string;
  text_color: string;
  position: number;
  is_active: boolean;
  start_at?: string;
  end_at?: string;
  target_blank: boolean;
  created_at: string;
  updated_at: string;
  collection_name?: string;
  collection_slug?: string;
  store_name?: string;
}

export interface CreateBannerDTO {
  store_id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  collection_id?: string;
  button_text?: string;
  button_variant?: "primary" | "outline" | "ghost";
  overlay_position?: "left" | "center" | "right";
  overlay_bg_color?: string;
  text_color?: string;
  position?: number;
  is_active?: boolean;
  start_at?: string;
  end_at?: string;
  target_blank?: boolean;
}

export interface UpdateBannerDTO extends Partial<CreateBannerDTO> {}

export const bannerService = {
  getAll: async (filters?: {
    storeId?: string;
    isActive?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append("store_id", filters.storeId);
    if (filters?.isActive !== undefined) params.append("is_active", String(filters.isActive));

    const queryString = params.toString();
    const url = queryString ? `/banners?${queryString}` : "/banners";

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
    const url = queryString ? `/public/banners?${queryString}` : "/public/banners";

    const response = await api.get(url);
    return response.data.data || response.data || [];
  },

  getById: async (id: string) => {
    const response = await api.get(`/banners/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateBannerDTO | FormData) => {
    const response = await api.post("/banners", data);
    return response.data;
  },

  update: async (id: string, data: UpdateBannerDTO | FormData) => {
    const response = await api.put(`/banners/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  },
};
import { api } from "./api";

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  size?: string;
  color?: string;
  brand?: string;
  purchase_price?: number;
  rental_price: number;
  status: "available" | "rented" | "maintenance" | "retired";
  category_id: number;
  store_id: number;
  is_featured: boolean;

  // --- CAMPOS EXTRAS QUE VÊM DO JOIN ---
  image_url?: string; // Foto de capa (Já está aí, ótimo!)
  category_name?: string; // <--- ADICIONE ESTA LINHA (Para a coluna Categoria)

  images?: { id: number; url: string; url_thumb: string }[];
}

export const productService = {
  // 1. LISTAR TODOS (Com Filtros de Categoria e Global)
  getAll: async (filters?: {
    categoryId?: string;
    globalSearch?: boolean;
    status?: string;
  }) => {
    const params = new URLSearchParams();

    if (filters?.categoryId) {
      params.append("category_id", filters.categoryId);
    }

    if (filters?.globalSearch) {
      params.append("global_search", "true");
    }

    if (filters?.status) {
      params.append("status", filters.status);
    }

    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : "/products";

    const response = await api.get(url);

    return response.data.data || response.data || [];
  },

  // 2. OBTER DETALHES
  getById: async (id: number | string) => {
    const response = await api.get(`/products/${id}`);

    // --- CORREÇÃO AQUI TAMBÉM ---
    // Retorna os dados limpos do produto
    return response.data.data || response.data;
  },

  // 3. CRIAR PRODUTO (Mantido o suporte a Upload/FormData)
  create: async (formData: FormData) => {
    const response = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 4. ATUALIZAR PRODUTO (Mantido)
  update: async (id: number | string, formData: FormData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 5. DELETAR PRODUTO (Mantido)
  delete: async (id: number | string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

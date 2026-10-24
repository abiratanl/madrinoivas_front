import { api } from '@/lib/axios';

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  size?: string;
  color?: string;
  brand?: string;
  model?: string;
  purchase_price?: number;
  rental_price: number;
  sale_price?: number;
  accessories?: string;
  status: "available" | "rented" | "maintenance" | "discarded" | "transferring" | "reserved" | "laundry";
  category_id: string;
  store_id: string;
  collection_id?: string;
  is_featured: boolean;

  // --- CAMPOS EXTRAS QUE VÊM DO JOIN ---
  image_url?: string;
  category_name?: string;
  store_name?: string;
  collection_name?: string;
  collection_slug?: string;
  retired_at?: string | null;

  images?: { id: string; url: string; url_thumb: string }[];
}

export interface ProductTransfer {
  id: string;
  product_id: string;
  from_store_id: string;
  to_store_id: string;
  requested_by: string;
  received_by: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  status: "active" | "completed" | "cancelled";
  notes: string | null;
  requested_at: string;
  received_at: string | null;
  product?: Product;
  from_store?: { id: string; name: string };
  to_store?: { id: string; name: string };
  requested_by_name?: string;
  received_by_name?: string;
  cancelled_by_name?: string;
}

export interface ProductWithTransfer extends Product {
  transfer_id: string;
  from_store?: { id: string; name: string };
  to_store?: { id: string; name: string };
}

export interface TransferProductDTO {
  to_store_id: string;
  notes?: string;
}

export interface ReceiveProductDTO {
  transfer_id: string;
}

export const productService = {
  // 1. LISTAR TODOS (Com Filtros de Categoria e Global) - Rota autenticada
  getAll: async (filters?: {
    categoryId?: string;
    collectionId?: string;
    globalSearch?: boolean;
    status?: string;
    storeId?: string | number;
  }) => {
    const params = new URLSearchParams();

    if (filters?.categoryId) {
      params.append("category_id", filters.categoryId);
    }

    if (filters?.collectionId) {
      params.append("collection_id", filters.collectionId);
    }

    if (filters?.globalSearch) {
      params.append("global_search", "true");
    }

    if (filters?.status) {
      params.append("status", filters.status);
    }

    // Pass store_id explicitly if provided (fallback for attendants with old tokens)
    if (filters?.storeId) {
      params.append("store_id", String(filters.storeId));
    }

    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : "/products";

    const response = await api.get(url);

    return response.data.data || response.data || [];
  },

  // 1b. LISTAR TODOS PÚBLICO (Para Home Page) - Rota sem autenticação
  getAllPublic: async (filters?: {
    categoryId?: string;
    collectionId?: string;
    status?: string;
    storeId?: string | number;
    isFeatured?: boolean;
  }) => {
    const params = new URLSearchParams();

    if (filters?.categoryId) {
      params.append("category_id", filters.categoryId);
    }

    if (filters?.collectionId) {
      params.append("collection_id", filters.collectionId);
    }

    if (filters?.status) {
      params.append("status", filters.status);
    }

    if (filters?.storeId) {
      params.append("store_id", String(filters.storeId));
    }

    if (filters?.isFeatured !== undefined) {
      params.append("is_featured", String(filters.isFeatured));
    }

    const queryString = params.toString();
    const url = queryString ? `/public/products?${queryString}` : "/public/products";

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

  // 6. TRANSFERIR PRODUTO ENTRE LOJAS
  transfer: async (productId: number | string, data: TransferProductDTO) => {
    const response = await api.post(`/products/${productId}/transfer`, data);
    return response.data;
  },

  // 7. RECEBER PRODUTO TRANSFERIDO
  receive: async (productId: number | string, data: ReceiveProductDTO) => {
    const response = await api.post(`/products/${productId}/receive`, data);
    return response.data;
  },

  // 8. CANCELAR TRANSFERÊNCIA DE PRODUTO
  cancelTransfer: async (transferId: number | string) => {
    const response = await api.patch(`/transfers/${transferId}/cancel`);
    return response.data;
  },

  // 9. ATUALIZAR TRANSFERÊNCIA (Editar loja de destino / observações)
  updateTransfer: async (transferId: number | string, data: { to_store_id?: string; notes?: string }) => {
    const response = await api.put(`/transfers/${transferId}`, data);
    return response.data;
  },

  // 10. LISTAR TRANSFERÊNCIAS (Opcional - para histórico)
  getTransfers: async (productId?: number | string) => {
    const url = productId ? `/products/${productId}/transfers` : "/transfers";
    const response = await api.get(url);
    const transfers: Array<ProductTransfer & { transfer_id?: string }> =
      response.data.data || response.data || [];
    // Backend returns transfer_id as the transfer ID, map it to id for frontend interface
    return transfers.map((t) => ({
      ...t,
      id: t.transfer_id || t.id
    }));
  },

  // 10. LISTAR PRODUTOS EM TRANSFERÊNCIA PARA UMA LOJA ESPECÍFICA
  getTransferringToStore: async (storeId: string | number): Promise<ProductWithTransfer[]> => {
    // Try with query parameters first (if backend supports it)
    let transfers: ProductTransfer[] = [];
    try {
      const params = new URLSearchParams();
      params.append("to_store_id", String(storeId));
      params.append("status", "active");
      const response = await api.get(`/transfers?${params.toString()}`);
      transfers = response.data.data || response.data || [];
      // Backend returns transfer_id as the transfer ID, map it to id for frontend interface
      transfers = transfers.map((t) => ({ ...t, id: (t as { transfer_id?: string }).transfer_id || t.id }));
    } catch {
      // Fallback: fetch all transfers and filter locally
      try {
        const response = await api.get("/transfers");
        const allTransfers: ProductTransfer[] = response.data.data || response.data || [];
        // Backend returns transfer_id as the transfer ID, map it to id for frontend interface
        const mappedTransfers = allTransfers.map((t) => ({
          ...t,
          id: (t as { transfer_id?: string }).transfer_id || t.id,
        }));
        transfers = mappedTransfers.filter(
          (t: ProductTransfer) => String(t.to_store_id) === String(storeId) && t.status === "active"
        );
      } catch {
        transfers = [];
      }
    }
    
    // Use product data from transfer join (transfer.product) instead of separate API calls
    // Attendants may not have permission to access /products/{id} endpoint
    const productsWithTransfers = transfers.map((transfer: ProductTransfer) => {
      const product = transfer.product;
      if (!product) {
        return null;
      }
      return {
        ...product,
        transfer_id: transfer.id,
      } as Product & { transfer_id: string };
    }).filter((p): p is ProductWithTransfer => p !== null);

    return productsWithTransfers;
  },
};

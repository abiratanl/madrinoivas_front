import { api } from "./api";

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
  status: "available" | "rented" | "maintenance" | "discarded" | "transferring" | "reserved";
  category_id: number;
  store_id: number;
  is_featured: boolean;

  // --- CAMPOS EXTRAS QUE VÊM DO JOIN ---
  image_url?: string;
  category_name?: string;
  store_name?: string;

  images?: { id: number; url: string; url_thumb: string }[];
}

export interface ProductTransfer {
  id: string;
  product_id: string;
  from_store_id: string;
  to_store_id: string;
  requested_by: string;
  received_by: string | null;
  status: "active" | "completed" | "cancelled";
  notes: string | null;
  requested_at: string;
  received_at: string | null;
  product?: Product;
  from_store?: { id: string; name: string };
  to_store?: { id: string; name: string };
  requested_by_name?: string;
  received_by_name?: string;
}

export interface ProductWithTransfer extends Product {
  transfer_id: string;
}

export interface TransferProductDTO {
  to_store_id: string;
  notes?: string;
}

export interface ReceiveProductDTO {
  transfer_id: string;
}

export const productService = {
  // 1. LISTAR TODOS (Com Filtros de Categoria e Global)
  getAll: async (filters?: {
    categoryId?: string;
    globalSearch?: boolean;
    status?: string;
    storeId?: string | number;
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

    // Pass store_id explicitly if provided (fallback for attendants with old tokens)
    if (filters?.storeId) {
      params.append("store_id", String(filters.storeId));
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

  // 8. LISTAR TRANSFERÊNCIAS (Opcional - para histórico)
  getTransfers: async (productId?: number | string) => {
    const url = productId ? `/products/${productId}/transfers` : "/transfers";
    const response = await api.get(url);
    const transfers = response.data.data || response.data || [];
    // Backend returns transfer_id as the transfer ID, map it to id for frontend interface
    return transfers.map((t: any) => ({
      ...t,
      id: t.transfer_id || t.id
    }));
  },

  // 9. LISTAR PRODUTOS EM TRANSFERÊNCIA PARA UMA LOJA ESPECÍFICA
  getTransferringToStore: async (storeId: string | number): Promise<ProductWithTransfer[]> => {
    console.log("[productService.getTransferringToStore] Buscando para storeId:", storeId);
    // Try with query parameters first (if backend supports it)
    let transfers: ProductTransfer[] = [];
    try {
      const params = new URLSearchParams();
      params.append("to_store_id", String(storeId));
      params.append("status", "active");
      console.log("[productService.getTransferringToStore] Tentando com query params:", params.toString());
      const response = await api.get(`/transfers?${params.toString()}`);
      transfers = response.data.data || response.data || [];
      // Backend returns transfer_id as the transfer ID, map it to id for frontend interface
      transfers = transfers.map((t: any) => ({ ...t, id: t.transfer_id || t.id }));
      console.log("[productService.getTransferringToStore] Resposta com query params:", transfers);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 403) {
        console.warn("[productService.getTransferringToStore] Sem permissão para acessar /transfers (403)");
      } else {
        console.warn("[productService.getTransferringToStore] Query params falhou, tentando fallback:", error);
      }
      // Fallback: fetch all transfers and filter locally
      try {
        const response = await api.get("/transfers");
        const allTransfers = response.data.data || response.data || [];
        console.log("[productService.getTransferringToStore] Todas as transferências (fallback):", allTransfers);
        // Backend returns transfer_id as the transfer ID, map it to id for frontend interface
        const mappedTransfers = allTransfers.map((t: any) => ({ ...t, id: t.transfer_id || t.id }));
        transfers = mappedTransfers.filter(
          (t: ProductTransfer) => String(t.to_store_id) === String(storeId) && t.status === "active"
        );
        console.log("[productService.getTransferringToStore] Transferências filtradas (fallback):", transfers);
      } catch (fallbackError) {
        console.error("[productService.getTransferringToStore] Fallback também falhou:", fallbackError);
        transfers = [];
      }
    }
    
    // Use product data from transfer join (transfer.product) instead of separate API calls
    // Attendants may not have permission to access /products/{id} endpoint
    const productsWithTransfers = transfers.map((transfer: ProductTransfer) => {
      const product = transfer.product;
      if (!product) {
        console.warn("[productService.getTransferringToStore] Transfer sem produto no join:", transfer.id);
        return null;
      }
      return {
        ...product,
        transfer_id: transfer.id,
      } as Product & { transfer_id: string };
    }).filter((p): p is ProductWithTransfer => p !== null);
    
    console.log("[productService.getTransferringToStore] Produtos finais (do join):", productsWithTransfers);
    return productsWithTransfers;
  },
};

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productService, type Product, type ProductTransfer, type ProductWithTransfer } from "../../services/productService";
import { categoryService, type Category } from "../../services/categoryService";
import { useAuth } from "../../contexts/AuthContext";
import { Edit2, Trash2, ArrowRightLeft, Package, Truck, CheckCircle, RotateCcw, AlertTriangle, Search, Wrench, XCircle, Settings } from "lucide-react";
import { TransferModal } from "../../components/products/TransferModal";
import { ReceiveModal } from "../../components/products/ReceiveModal";
import { EditTransferModal } from "../../components/products/EditTransferModal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { toast } from "react-hot-toast";

function Products() {
  const { selectedStore, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isAttendant = user?.role?.toLowerCase() === 'attendant' || user?.role?.toLowerCase() === 'atendente';

  // Modal states
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [receiveProduct, setReceiveProduct] = useState<ProductWithTransfer | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  // Edit Transfer Modal
  const [editTransfer, setEditTransfer] = useState<ProductTransfer | null>(null);
  const [isEditTransferModalOpen, setIsEditTransferModalOpen] = useState(false);

  // Confirmation modals
  const [confirmAction, setConfirmAction] = useState<"discard" | "makeAvailable" | "sendToMaintenance" | "cancelTransfer" | null>(null);
  const [confirmProductId, setConfirmProductId] = useState<string | null>(null);
  const [confirmTransferId, setConfirmTransferId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Cache de permissões para editar transferência
  const [editTransferPermissions, setEditTransferPermissions] = useState<Record<string, boolean>>({});

  const loadCategories = async () => {
    try {
      const result = await categoryService.getAll();
      if (Array.isArray(result)) {
        setCategories(result);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias", error);
    }
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    let allProducts: Product[] = [];

    try {
      // Busca os produtos da loja do atendente (already returns clean array from service)
      const result = await productService.getAll({
        categoryId: selectedCategory,
        globalSearch: isGlobal,
        storeId: selectedStore?.id,
        status: selectedStatus,
      });

      allProducts = Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("[Products] Erro ao buscar produtos da loja:", error);
      // Continue mesmo com erro para tentar buscar produtos em transferência
      allProducts = [];
    }

    // Se não é busca global e há uma loja selecionada, buscar também produtos em transferência PARA esta loja
    if (!isGlobal && selectedStore?.id) {
      try {
        const transferringProducts = await productService.getTransferringToStore(selectedStore.id);
        
        // Filtrar por categoria se necessário
        let filteredTransferring = transferringProducts;
        if (selectedCategory) {
          filteredTransferring = transferringProducts.filter(
            (p) => String(p.category_id) === selectedCategory
          );
        }
        // Filtrar por status se necessário (produtos em transferência têm status "transferring")
        if (selectedStatus && selectedStatus !== "transferring") {
          filteredTransferring = filteredTransferring.filter(
            (p) => p.status === selectedStatus
          );
        }
        // Merge evitando duplicados (pelo ID do produto)
        const existingIds = new Set(allProducts.map((p) => p.id));
        const newProducts = filteredTransferring.filter((p) => !existingIds.has(p.id));
        allProducts = [...allProducts, ...newProducts];
      } catch (transferError) {
        console.error("[Products] Error fetching transferring products:", transferError);
      }
    }
    
    setProducts(allProducts);
    setLoading(false);
  }, [selectedCategory, isGlobal, selectedStore?.id, selectedStatus]);

  // Load categories on screen open
  useEffect(() => {
    loadCategories();
  }, []);

  // Force isGlobal = false for attendant
  useEffect(() => {
    if (isAttendant && isGlobal) {
      setIsGlobal(false);
    }
  }, [isAttendant, isGlobal]);

  // Reload products if filter or global checkbox changes
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleDiscard(id: string) {
    setConfirmAction("discard");
    setConfirmProductId(id);
    setIsConfirmModalOpen(true);
  }

  async function handleMakeAvailable(id: string) {
    setConfirmAction("makeAvailable");
    setConfirmProductId(id);
    setIsConfirmModalOpen(true);
  }

  async function handleSendToMaintenance(id: string) {
    setConfirmAction("sendToMaintenance");
    setConfirmProductId(id);
    setIsConfirmModalOpen(true);
  }

  async function executeConfirmAction() {
    if (!confirmAction || !confirmProductId) return;
    
    const id = confirmProductId;
    let newStatus: Product["status"];
    let successMessage: string;
    let errorMessage: string;

    switch (confirmAction) {
      case "discard":
        newStatus = "discarded";
        successMessage = "Produto descartado!";
        errorMessage = "Erro ao descartar produto.";
        break;
      case "makeAvailable":
        newStatus = "available";
        successMessage = "Produto disponível novamente!";
        errorMessage = "Erro ao tornar produto disponível.";
        break;
      case "sendToMaintenance":
        newStatus = "maintenance";
        successMessage = "Produto enviado para manutenção!";
        errorMessage = "Erro ao enviar produto para manutenção.";
        break;
      case "cancelTransfer":
        newStatus = "available";
        successMessage = "Transferência cancelada! Produto disponível novamente.";
        errorMessage = "Erro ao cancelar transferência.";
        break;
      default:
        return;
    }

    try {
      if (confirmAction === "cancelTransfer") {
        await productService.cancelTransfer(confirmTransferId || id);
      } else {
        const formData = new FormData();
        formData.append("status", newStatus);
        await productService.update(id, formData);
      }
      setProducts(products.map((p) => (p.id === id ? { ...p, status: "available" } : p)));
      toast.success(successMessage, { style: { borderRadius: "10px", background: "#333", color: "#fff" } });
    } catch {
      toast.error(errorMessage, { style: { borderRadius: "10px", background: "#333", color: "#fff" } });
    } finally {
      setConfirmAction(null);
      setConfirmProductId(null);
      setConfirmTransferId(null);
      setIsConfirmModalOpen(false);
    }
  }

  function handleOpenTransfer(product: Product) {
    // Validate if product can be transferred
    if (product.status === "rented") {
      toast.error("Não é possível transferir um produto alugado.", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      return;
    }
    if (product.status === "transferring") {
      toast.error("Este produto já está em transferência.", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      return;
    }
    if (product.status === "discarded") {
      toast.error("Não é possível transferir um produto descartado.", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      return;
    }
    setTransferProduct(product);
    setIsTransferModalOpen(true);
  }

  async function handleOpenReceive(product: Product) {
    if (product.status !== "transferring") {
      toast.error("Este produto não está em transferência.", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      return;
    }
    
    // Find active transfer for this product
    try {
      const transfers = await productService.getTransfers(product.id);
      const userStoreId = String(selectedStore?.id);
      
      const activeTransfer = transfers.find(
        (t: ProductTransfer) => t.status === "active" && String(t.to_store_id) === userStoreId
      );
      
      if (!activeTransfer) {
        // Fallback: if not found for specific store, get any active
        const anyActiveTransfer = transfers.find(
          (t: ProductTransfer) => t.status === "active"
        );
        
        if (anyActiveTransfer) {
          // Use transfer found even if for another store
          setReceiveProduct({ 
            ...product, 
            transfer_id: anyActiveTransfer.id,
            from_store: anyActiveTransfer.from_store,
            to_store: anyActiveTransfer.to_store
          });
          setIsReceiveModalOpen(true);
          return;
        }
        
        toast.error("Nenhuma transferência pendente encontrada para este produto.", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        });
        return;
      }
      
      setReceiveProduct({ 
        ...product, 
        transfer_id: activeTransfer.id,
        from_store: activeTransfer.from_store,
        to_store: activeTransfer.to_store
      });
      setIsReceiveModalOpen(true);
    } catch (error) {
      console.error("Erro ao buscar transferência:", error);
      toast.error("Erro ao carregar informações da transferência.", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
    }
  }

  async function handleCancelTransfer(product: Product) {
    if (product.status !== "transferring") {
      toast.error("Este produto não está em transferência.", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      return;
    }

// Find active transfer for this product (to get transfer_id and from_store_id)
    try {
      const transfers = await productService.getTransfers(product.id);
      
      const activeTransfer = transfers.find(
        (t: ProductTransfer) => t.status === "active"
      );
      
      if (!activeTransfer) {
        toast.error("Nenhuma transferência ativa encontrada para este produto.", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        });
        return;
      }
      
      // Frontend permission check (UX): admin/owner OR origin store
      const userRole = user?.role?.toLowerCase();
      const isAdminOrOwner = userRole === "admin" || userRole === "owner";
      const isFromStore = selectedStore && String(selectedStore.id) === String(activeTransfer.from_store_id);

      if (!isAdminOrOwner && !isFromStore) {
        toast.error("Você não tem permissão para cancelar esta transferência.", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        });
        return;
      }

      setConfirmAction("cancelTransfer");
      setConfirmProductId(product.id);
      setConfirmTransferId(activeTransfer.id);
      setIsConfirmModalOpen(true);
    } catch (error) {
      console.error("Erro ao buscar transferência para cancelamento:", error);
      toast.error("Erro ao carregar informações da transferência.", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
    }
  }

  // Check transfer edit permission (uses cache)
  const canEditTransfer = (productId: string): boolean => {
    return editTransferPermissions[productId] === true;
  };

  // Load transfer edit permission for a product
  const loadEditTransferPermission = useCallback(async (product: Product) => {
    if (product.status !== "transferring") return;
    if (product.id in editTransferPermissions) return;

    try {
      const transfers = await productService.getTransfers(product.id);
      const activeTransfer = transfers.find((t: ProductTransfer) => t.status === "active");
      if (!activeTransfer) {
        setEditTransferPermissions((prev) => ({ ...prev, [product.id]: false } as Record<string, boolean>));
        return;
      }

      const userRole = user?.role?.toLowerCase();
      const isAdminOrOwner = userRole === "admin" || userRole === "owner";
      const isFromStore = selectedStore && String(selectedStore.id) === String(activeTransfer.from_store_id);

      setEditTransferPermissions((prev) => ({ ...prev, [product.id]: isAdminOrOwner || isFromStore } as Record<string, boolean>));
    } catch (error) {
      console.error("Error checking transfer edit permission:", error);
      setEditTransferPermissions((prev) => ({ ...prev, [product.id]: false } as Record<string, boolean>));
    }
  }, [user?.role, selectedStore?.id, editTransferPermissions]);

  // Load permissions when products change
  useEffect(() => {
    products.forEach((product) => {
      if (product.status === "transferring") {
        loadEditTransferPermission(product);
      }
    });
  }, [products, loadEditTransferPermission]);

  async function handleEditTransfer(product: Product) {
    if (product.status !== "transferring") return;

    // Check cache first
    if (!editTransferPermissions[product.id]) {
      toast.error("Você não tem permissão para editar esta transferência.", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      return;
    }

    try {
      const transfers = await productService.getTransfers(product.id);
      const activeTransfer = transfers.find((t: ProductTransfer) => t.status === "active");
      
      if (!activeTransfer) {
        toast.error("Nenhuma transferência ativa encontrada.", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        });
        return;
      }

      setEditTransfer(activeTransfer);
      setIsEditTransferModalOpen(true);
    } catch (error) {
      console.error("Error fetching transfer for edit:", error);
      toast.error("Erro ao carregar informações da transferência.", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
    }
  }

  function handleTransferSuccess() {
    loadProducts();
    setTransferProduct(null);
    setIsTransferModalOpen(false);
  }

  function handleReceiveSuccess() {
    loadProducts();
    setReceiveProduct(null);
    setIsReceiveModalOpen(false);
  }

  function handleEditTransferSuccess() {
    loadProducts();
    setEditTransfer(null);
    setIsEditTransferModalOpen(false);
  }

  // Helper to display image (Main from Join or Images Array)
  const getThumb = (product: Product) => {
    // 1. Try direct URL (from optimized SQL)
    if (product.image_url) return product.image_url;

    // 2. Try from images array (if full object)
    if (product.images && product.images.length > 0) {
      return product.images[0].url_thumb || product.images[0].url;
    }

    // 3. Fallback if no photo
    return "https://placehold.co/50x50?text=S/Foto";
  };

  const formatMoney = (val?: number) => {
    if (val === undefined) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return { class: "bg-green-100 text-green-800", label: "Disponível", icon: <CheckCircle className="w-3 h-3" /> };
      case "reserved":
        return { class: "bg-indigo-100 text-indigo-800", label: "Reservado", icon: <Package className="w-3 h-3" /> };
      case "rented":
        return { class: "bg-blue-100 text-blue-800", label: "Alugado", icon: <Package className="w-3 h-3" /> };
      case "maintenance":
        return { class: "bg-yellow-100 text-yellow-800", label: "Manutenção", icon: <Truck className="w-3 h-3" /> };
      case "transferring":
        return { class: "bg-amber-100 text-amber-800", label: "Em Transferência", icon: <Truck className="w-3 h-3" /> };
      case "discarded":
        return { class: "bg-red-100 text-red-800", label: "Descartado", icon: <AlertTriangle className="w-3 h-3" /> };
      default:
        return { class: "bg-gray-100 text-gray-800", label: status, icon: null };
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* --- CABEÇALHO E FILTROS --- */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Linha 1: Título */}
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>

        {/* Linha 2: Busca + Filtros + Botão Novo */}
        <div className="flex flex-wrap items-center gap-4 w-full">
          {/* Busca por Nome/Código - primeiro, margem esquerda */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Dropdown Categorias */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Dropdown Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm min-w-[160px]"
          >
            <option value="">Todos</option>
            <option value="available">Disponível</option>
            <option value="reserved">Reservado</option>
            <option value="rented">Alugado</option>
            <option value="maintenance">Manutenção</option>
            <option value="transferring">Em Transferência</option>
            <option value="discarded">Descartado</option>
          </select>

          {/* Checkbox Busca Global - oculto para atendente */}
          {!isAttendant && (
            <label className="flex items-center gap-2 cursor-pointer bg-white hover:bg-gray-50 px-3 py-2 rounded border border-gray-300 shadow-sm transition-colors">
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => setIsGlobal(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Ver Todas as Lojas
              </span>
            </label>
          )}

          {/* Botão Novo - por último */}
          <Link
            to="/products/new"
            className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 transition-colors whitespace-nowrap shadow-sm font-medium ml-auto"
          >
            + Novo Produto
          </Link>
        </div>
      </div>

      {/* --- TABELA DE DADOS --- */}
      {loading ? (
        <div className="p-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
          <p className="mt-2 text-rose-600 font-medium">
            Carregando produtos...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3 font-semibold">Foto</th>
                <th className="px-6 py-3 font-semibold">Produto</th>
                <th className="px-6 py-3 font-semibold">Categoria</th>
                <th className="px-6 py-3 font-semibold">Aluguel</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products
                .filter((product) => {
                  if (!searchTerm) return true;
                  const term = searchTerm.toLowerCase();
                  return product.name.toLowerCase().includes(term) || product.code.toLowerCase().includes(term);
                })
                .map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-2">
                    <img
                      src={getThumb(product)}
                      alt="Thumb"
                      className="h-12 w-12 rounded object-cover border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/50x50?text=Erro";
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="font-mono text-xs text-gray-500 mt-0.5">{product.code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.category_name || "-"}
                  </td>
                  <td className="px-6 py-4 text-rose-600 font-bold">
                    {formatMoney(product.rental_price)}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const badge = getStatusBadge(product.status);
                      return (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${badge.class}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {/* Editar - não exibir para produtos em transferência */}
                      {product.status !== "transferring" && (
                        <button
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Transfer - for transferring (admin, owner, origin store) */}
                      {product.status === "transferring" && canEditTransfer(product.id) && (
                        <button
                          onClick={() => handleEditTransfer(product)}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
                          title="Editar Transferência"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      )}

                      {/* Transfer - for available, reserved, maintenance */}
                      {["available", "reserved", "maintenance"].includes(product.status) && (
                        <button
                          onClick={() => handleOpenTransfer(product)}
                          className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all active:scale-90"
                          title="Transferir"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      )}

                      {/* Receive - for transferring */}
                      {product.status === "transferring" && (
                        <button
                          onClick={() => handleOpenReceive(product)}
                          className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all active:scale-90"
                          title="Receber Produto"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                      )}

                      {/* Cancel Transfer - for transferring */}
                      {product.status === "transferring" && (
                        <button
                          onClick={() => handleCancelTransfer(product)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                          title="Cancelar Transferência"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Send to Maintenance - for available, reserved */}
                      {["available", "reserved"].includes(product.status) && (
                        <button
                          onClick={() => handleSendToMaintenance(product.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all active:scale-90"
                          title="Enviar para Manutenção"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                      )}

                      {/* Tornar Disponível - para maintenance */}
                      {product.status === "maintenance" && (
                        <button
                          onClick={() => handleMakeAvailable(product.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                          title="Tornar Disponível"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}

                      {/* Descartar Produto - para available, maintenance */}
                      {["available", "maintenance"].includes(product.status) && (
                        <button
                          onClick={() => handleDiscard(product.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                          title="Descartar Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
</tbody>
          </table>

          {!loading && products.length === 0 && (
            <div className="p-10 text-center text-gray-500 bg-white">
              <p>Nenhum produto encontrado com os filtros atuais.</p>
              {!isAttendant && isGlobal === false && (
                <p className="text-xs mt-2 text-gray-400">
                  Tente marcar "Ver Todas as Lojas".
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferProduct(null);
        }}
        product={transferProduct}
        onSuccess={handleTransferSuccess}
      />

      {/* Receive Modal */}
      <ReceiveModal
        isOpen={isReceiveModalOpen}
        onClose={() => {
          setIsReceiveModalOpen(false);
          setReceiveProduct(null);
        }}
        product={receiveProduct}
        onSuccess={handleReceiveSuccess}
      />

      {/* Edit Transfer Modal */}
      <EditTransferModal
        isOpen={isEditTransferModalOpen}
        onClose={() => {
          setIsEditTransferModalOpen(false);
          setEditTransfer(null);
        }}
        transfer={editTransfer}
        onSuccess={handleEditTransferSuccess}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setConfirmAction(null);
          setConfirmProductId(null);
          setConfirmTransferId(null);
        }}
        onConfirm={executeConfirmAction}
        title={
          confirmAction === "discard"
            ? "Confirmar Descarte"
            : confirmAction === "makeAvailable"
            ? "Tornar Disponível"
            : confirmAction === "cancelTransfer"
            ? "Cancelar Transferência"
            : "Enviar para Manutenção"
        }
        description={
          confirmAction === "discard"
            ? "O produto será marcado como descartado e não aparecerá mais nas listagens normais."
            : confirmAction === "makeAvailable"
            ? "O produto voltará a ficar disponível para aluguel e transferência."
            : confirmAction === "cancelTransfer"
            ? "Deseja realmente cancelar a transferência deste produto? O status do produto voltará para 'Disponível' e a transferência será marcada como cancelada."
            : "O produto será marcado como em manutenção e não ficará disponível para aluguel até que retorne."
        }
        confirmText={confirmAction === "discard" ? "Descartar" : confirmAction === "makeAvailable" ? "Confirmar" : confirmAction === "cancelTransfer" ? "Cancelar Transferência" : "Enviar"}
        variant={confirmAction === "discard" ? "danger" : "warning"}
      />
    </div>
  );
}

export default Products;

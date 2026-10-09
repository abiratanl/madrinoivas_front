import { useEffect, useState, useCallback } from "react";
import { X, Truck, Store as StoreIcon, AlertCircle, CheckCircle } from "lucide-react";
import { storeService, type Store } from "../../services/storeService";
import { productService, type Product, type TransferProductDTO } from "../../services/productService";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../utils/cn";
import { toast } from "react-hot-toast";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export function TransferModal({ isOpen, onClose, product, onSuccess }: TransferModalProps) {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const loadStores = useCallback(async () => {
    try {
      // Attendants use /for-transfer endpoint, admins/owners use /stores
      const isAttendant = user?.role?.toLowerCase() === 'attendant' || user?.role?.toLowerCase() === 'atendente';
      const data = isAttendant ? await storeService.getForTransfer() : await storeService.getAll();
      const storeList = Array.isArray(data) ? data : data.data || [];
      setStores(storeList);
    } catch (err) {
      console.error("Erro ao carregar lojas:", err);
      setError("Não foi possível carregar a lista de lojas.");
    }
  }, [user?.role]);

  useEffect(() => {
    if (isOpen) {
      loadStores();
      setError("");
      setSelectedStoreId("");
    }
  }, [isOpen, loadStores]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !selectedStoreId) return;

    setSubmitting(true);
    setError("");

    try {
      const transferData: TransferProductDTO = {
        to_store_id: selectedStoreId,
        notes: notes.trim() || undefined,
      };

      await productService.transfer(product.id, transferData);
      toast.success("Produto transferido com sucesso!", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : "Erro ao transferir produto.";
      const errorMessage = msg ?? "Erro ao transferir produto.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen || !product) return null;

  // Ensure origin store is in the list (it's excluded from /for-transfer for attendants)
  const currentStore = stores.find((s) => String(s.id) === String(product.store_id));
  
  // If origin store not in list (attendant case), add it for display purposes
  const originStore: Store = {
    id: String(product.store_id),
    name: product.store_name || "Minha Loja",
    address: null,
    address_id: null,
    phone: null,
    city: null,
    state: null,
    cnpj: null,
    email: null,
    is_active: true,
    created_at: "",
    updated_at: "",
  };
  
  const displayStores = currentStore ? stores : [...stores, originStore];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              <Truck className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Transferir Produto</h3>
          <p className="text-gray-500 leading-relaxed mb-4">
            Selecione a loja de destino para transferir este produto.
          </p>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={
                  product.image_url ||
                  product.images?.[0]?.url_thumb ||
                  "https://placehold.co/50x50?text=S/Foto"
                }
                alt={product.name}
                className="h-14 w-14 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 font-mono">Código: {product.code}</p>
                <p className="text-xs text-gray-500">Status: <span className="font-medium capitalize">{product.status}</span></p>
              </div>
            </div>
          </div>

          {/* Origin Store (Read Only) */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Loja de Origem
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <StoreIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 font-medium">{currentStore?.name || product.store_name || "Minha Loja"}</span>
              <span className="ml-auto px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">Origem</span>
            </div>
          </div>

          {/* Destination Store Select */}
          <div className="mb-4">
            <label htmlFor="to_store_id" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Loja de Destino <span className="text-red-500">*</span>
            </label>
            <select
              id="to_store_id"
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              disabled={submitting}
              className={cn(
                "w-full px-3 py-2 rounded-lg border bg-white",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error ? "border-red-300 text-red-900" : "border-gray-300 text-gray-900"
              )}
            >
              <option value="">Selecione a loja de destino...</option>
              {stores.filter((s) => String(s.id) !== String(product?.store_id)).length === 0 ? (
                <option value="" disabled>
                  Nenhuma outra loja disponível
                </option>
              ) : (
                stores
                  .filter((s) => String(s.id) !== String(product?.store_id))
                  .map((store) => (
                    <option key={store.id} value={String(store.id)}>
                      {store.name}
                    </option>
                  ))
              )}
            </select>
            {error && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label htmlFor="transfer_notes" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Observações (opcional)
            </label>
            <textarea
              id="transfer_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              rows={3}
              className={cn(
                "w-full px-3 py-2 rounded-lg border bg-white",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "border-gray-300 text-gray-900"
              )}
              placeholder="Observações sobre a transferência..."
            />
          </div>

          {selectedStoreId && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Pronto para transferir</p>
                <p className="text-xs text-green-700">
                  O produto será movido para <strong>{displayStores.find((s) => String(s.id) === selectedStoreId)?.name}</strong>
                  e ficará com status "Em Transferência" até o recebimento.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedStoreId}
            className={cn(
              "flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              submitting
                ? "bg-gray-400 cursor-wait"
                : "bg-purple-600 hover:bg-purple-700"
            )}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Transferindo...
              </span>
            ) : (
              "Confirmar Transferência"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
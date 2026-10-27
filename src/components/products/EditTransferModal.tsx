import { useEffect, useState, useCallback } from "react";
import { X, Store as StoreIcon, AlertCircle, CheckCircle, Truck } from "lucide-react";
import { storeService, type Store } from "../../services/storeService";
import { productService, type ProductTransfer } from "../../services/productService";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../utils/cn";
import { toast } from "react-hot-toast";

interface EditTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: ProductTransfer | null;
  onSuccess: () => void;
}

export function EditTransferModal({ isOpen, onClose, transfer, onSuccess }: EditTransferModalProps) {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const loadStores = useCallback(async () => {
    try {
      const role = user?.role?.toLowerCase();
      const isStoreScoped =
        role === 'attendant' ||
        role === 'atendente' ||
        role === 'local_manager' ||
        role === 'gerente_local';
      const data = isStoreScoped
        ? await storeService.getForTransfer()
        : await storeService.getAll();
      const storeList = Array.isArray(data) ? data : data.data || [];
      setStores(storeList);
    } catch (err) {
      console.error("Erro ao carregar lojas:", err);
      setError("Não foi possível carregar a lista de lojas.");
    }
  }, [user?.role]);

  useEffect(() => {
    if (isOpen && transfer) {
      loadStores();
      setError("");
      setSelectedStoreId(String(transfer.to_store_id));
      setNotes(transfer.notes || "");
    }
  }, [isOpen, transfer, loadStores]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transfer || !selectedStoreId) return;

    setSubmitting(true);
    setError("");

    try {
      const updateData: { to_store_id?: string; notes?: string } = {
        to_store_id: selectedStoreId,
        notes: notes.trim() || undefined,
      };

      await productService.updateTransfer(transfer.id, updateData);
      toast.success("Transferência atualizada com sucesso!", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : "Erro ao atualizar transferência.";
      const errorMessage = msg ?? "Erro ao atualizar transferência.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen || !transfer) return null;

  const originStoreName = transfer.from_store?.name || transfer.product?.store_name || "Loja de Origem";
  const currentDestStore = stores.find((s) => String(s.id) === String(transfer.to_store_id));
  const currentDestStoreName = currentDestStore?.name || transfer.to_store?.name || "Carregando...";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
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

          <h3 className="text-xl font-bold text-gray-900 mb-2">Editar Transferência</h3>
          <p className="text-gray-500 leading-relaxed mb-4">
            Altere a loja de destino ou as observações desta transferência.
          </p>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={
                  transfer.product?.image_url ||
                  transfer.product?.images?.[0]?.url_thumb ||
                  "https://placehold.co/50x50?text=S/Foto"
                }
                alt={transfer.product?.name || "Produto"}
                className="h-14 w-14 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{transfer.product?.name}</p>
                <p className="text-xs text-gray-500 font-mono">Código: {transfer.product?.code}</p>
                <p className="text-xs text-gray-500">Status: <span className="font-medium capitalize">{transfer.product?.status}</span></p>
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
              <span className="text-gray-700 font-medium">{originStoreName}</span>
              <span className="ml-auto px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">Origem</span>
            </div>
          </div>

          {/* Current Destination Store (Read Only) */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Loja de Destino Atual
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <StoreIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 font-medium">{currentDestStoreName}</span>
              <span className="ml-auto px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Destino Atual</span>
            </div>
          </div>

          {/* New Destination Store Select */}
          <div className="mb-4">
            <label htmlFor="new_to_store_id" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Nova Loja de Destino <span className="text-red-500">*</span>
            </label>
            <select
              id="new_to_store_id"
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              disabled={submitting}
              className={cn(
                "w-full px-3 py-2 rounded-lg border bg-white",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error ? "border-red-300 text-red-900" : "border-gray-300 text-gray-900"
              )}
            >
              <option value="">Selecione a nova loja de destino...</option>
              {stores.filter((s) => String(s.id) !== String(transfer.from_store_id)).length === 0 ? (
                <option value="" disabled>
                  Nenhuma outra loja disponível
                </option>
              ) : (
                stores
                  .filter((s) => String(s.id) !== String(transfer.from_store_id))
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
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "border-gray-300 text-gray-900"
              )}
              placeholder="Observações sobre a transferência..."
            />
          </div>

          {selectedStoreId && selectedStoreId !== String(transfer.to_store_id) && (
            <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-800">Destino alterado</p>
                <p className="text-xs text-indigo-700">
                  O produto será transferido para <strong>{stores.find((s) => String(s.id) === selectedStoreId)?.name}</strong>
                  em vez de <strong>{currentDestStoreName}</strong>.
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
            disabled={submitting || !selectedStoreId || selectedStoreId === String(transfer.to_store_id)}
            className={cn(
              "flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              submitting
                ? "bg-gray-400 cursor-wait"
                : "bg-indigo-600 hover:bg-indigo-700"
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
                Salvando...
              </span>
            ) : (
              "Salvar Alterações"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
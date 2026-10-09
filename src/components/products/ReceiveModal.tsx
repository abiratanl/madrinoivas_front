import { useState } from "react";
import { X, CheckCircle, Package, AlertCircle, Store as StoreIcon } from "lucide-react";
import { productService, type Product, type ReceiveProductDTO, type ProductTransfer } from "../../services/productService";
import { cn } from "../../utils/cn";
import { toast } from "react-hot-toast";

interface ProductWithTransfer extends Product {
  transfer_id?: string;
  from_store?: { id: string; name: string };
  to_store?: { id: string; name: string };
}

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithTransfer | null;
  onSuccess: () => void;
}

export function ReceiveModal({ isOpen, onClose, product, onSuccess }: ReceiveModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !product.transfer_id) return;

    setSubmitting(true);
    setError("");

    try {
      const receiveData: ReceiveProductDTO = {
        transfer_id: product.transfer_id,
      };

      await productService.receive(product.id, receiveData);
      const fromStore = product.from_store?.name || product.store_name || "Loja de Origem";
      const toStore = product.to_store?.name || "Loja de Destino";
      toast.success(`Produto recebido com sucesso! Transferido de "${fromStore}" para "${toStore}".`, {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : "Erro ao receber produto.";
      const errorMessage = msg ?? "Erro ao receber produto.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <Package className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Receber Produto</h3>
          <p className="text-gray-500 leading-relaxed mb-4">
            Confirme o recebimento deste produto que estava em transferência.
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
                <p className="text-xs text-gray-500">Status atual: <span className="font-medium text-purple-600">Transferindo</span></p>
              </div>
            </div>
          </div>

          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Confirmação de Recebimento</p>
              <p className="text-xs text-amber-700">
                Ao confirmar, o produto será marcado como <strong>Disponível</strong> na nova loja
                e a transferência será finalizada.
              </p>
            </div>
          </div>

          {/* Transfer Details */}
          {(product.from_store || product.to_store) && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Detalhes da Transferência</p>
              <div className="flex items-center gap-2 text-sm">
                <StoreIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Origem:</span>
                <span className="font-medium text-gray-900">{product.from_store?.name || product.store_name || "Loja de Origem"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <StoreIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Destino:</span>
                <span className="font-medium text-gray-900">{product.to_store?.name || "Loja de Destino"}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="mb-4 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
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
            disabled={submitting}
            className={cn(
              "flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              submitting
                ? "bg-gray-400 cursor-wait"
                : "bg-green-600 hover:bg-green-700"
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
                Recebendo...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Confirmar Recebimento
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
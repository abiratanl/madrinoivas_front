import { useState } from "react";
import { X, CheckCircle, Undo2 } from "lucide-react";
import { cn } from "../../utils/cn";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (makeAvailable: boolean) => void;
  rentalStatus: string;
}

export function ReturnModal({ isOpen, onClose, onConfirm, rentalStatus }: ReturnModalProps) {
  const [makeAvailable, setMakeAvailable] = useState(false);

  const handleConfirm = () => {
    onConfirm(makeAvailable);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-amber-50 text-amber-600">
              <Undo2 className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Registrar Devolução</h3>
          <p className="text-gray-500 leading-relaxed mb-4">
            Confirmar a devolução deste aluguel. Os produtos serão liberados.
          </p>

          {/* Checkbox Make Available */}
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setMakeAvailable(!makeAvailable)}
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  makeAvailable
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-300 text-transparent hover:border-gray-400"
                )}
              >
                {makeAvailable && <CheckCircle className="w-3.5 h-3.5" />}
              </button>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Tornar produtos disponíveis imediatamente</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {makeAvailable 
                    ? "Produtos voltarão ao status 'Disponível' para novo aluguel imediato"
                    : "Produtos irão para 'Manutenção' (lavanderia) antes de ficarem disponíveis"
                  }
                </p>
              </div>
            </label>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            Status atual do aluguel: <strong>{rentalStatus === 'late' ? 'Atrasado' : 'Retirado'}</strong>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              "flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-lg active:scale-95 transition-all",
              "bg-green-600 hover:bg-green-700"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <Undo2 className="w-5 h-5" />
              Confirmar Devolução
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
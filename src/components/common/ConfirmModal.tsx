import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "p-3 rounded-full",
              variant === 'danger' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            )}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 leading-relaxed">{description}</p>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              "flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-lg active:scale-95 transition-all",
              variant === 'danger' ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
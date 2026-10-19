import { useEffect, useState } from 'react';
import { X, Ban, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { paymentService, type Payment } from '@/services/paymentService';
import { cn } from '@/utils/cn';

interface CancelPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onSuccess: () => void;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function CancelPaymentModal({ isOpen, onClose, payment, onSuccess }: CancelPaymentModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset the reason every time the modal opens
  useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  const canSubmit = !!payment && reason.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!payment || !canSubmit) return;

    setSubmitting(true);
    try {
      await paymentService.cancel(payment.id, reason.trim());
      toast.success('Pagamento cancelado com sucesso!');
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao cancelar pagamento. Tente novamente.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-red-50 text-red-600">
              <Ban className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">Cancelar Pagamento</h3>
          <p className="text-gray-500 text-sm mb-4">
            O pagamento será estornado e removido do saldo pago, mas ficará registrado no histórico
            para auditoria.
          </p>

          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Valor:</span>
              <span className="font-bold text-gray-800">
                {formatBRL(parseFloat(String(payment.amount || 0)))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Data:</span>
              <span className="font-medium text-gray-800">
                {new Date(payment.paid_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {payment.user_name && (
              <div className="flex justify-between">
                <span className="text-gray-500">Registrado por:</span>
                <span className="font-medium text-gray-800">{payment.user_name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo do cancelamento <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Ex: valor registrado incorretamente"
              className={cn(
                'w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 transition-all border resize-none',
                !reason.trim() ? 'border-gray-100 focus:ring-red-500' : 'border-gray-100 focus:ring-rose-500'
              )}
            />
            {!reason.trim() && (
              <p className="mt-1 text-xs text-red-600">Informe o motivo do cancelamento.</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all',
              canSubmit ? 'bg-red-600 hover:bg-red-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed shadow-none'
            )}
          >
            <span className="flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ban className="w-5 h-5" />}
              {submitting ? 'Cancelando...' : 'Sim, Cancelar Pagamento'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

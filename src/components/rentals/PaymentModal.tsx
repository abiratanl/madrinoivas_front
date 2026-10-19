import { useEffect, useMemo, useState } from 'react';
import { X, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { rentalService } from '../../services/rentalService';
import {
  paymentService,
  type Payment,
  type PaymentMethod,
  type PaymentType,
  type RentalInstallment,
} from '../../services/paymentService';
import { cn } from '../../utils/cn';
import { maskCurrency, numberToCurrencyInput, parseCurrency } from '../../utils/masks';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: string | null;
  customerName?: string;
  onSuccess: () => void;
  // When provided, the modal switches to edit mode for this payment
  payment?: Payment | null;
}

export const PAYMENT_TYPE_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: 'entry', label: 'Entrada' },
  { value: 'spontaneous', label: 'Pagamento Avulso / Amortização' },
  { value: 'installment', label: 'Pagamento de Parcela' },
  { value: 'pickup_balance', label: 'Quitação na Retirada' },
];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'bank_transfer', label: 'Transferência Bancária' },
];

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function PaymentModal({
  isOpen,
  onClose,
  rentalId,
  customerName,
  onSuccess,
  payment,
}: PaymentModalProps) {
  const isEditMode = !!payment;
  const paymentAmount = payment ? parseFloat(String(payment.amount || 0)) : 0;

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [openInstallments, setOpenInstallments] = useState<RentalInstallment[]>([]);
  const [linkedInstallment, setLinkedInstallment] = useState<RentalInstallment | null>(null);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<PaymentType>('spontaneous');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [installmentId, setInstallmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // In edit mode the payment's own amount is added back to the available balance
  const remainingBalance = useMemo(
    () => Math.max(0, totalAmount - totalPaid + (isEditMode ? paymentAmount : 0)),
    [totalAmount, totalPaid, isEditMode, paymentAmount]
  );

  // Remaining value of an installment; in edit mode the payment's own amount is
  // added back for the installment currently linked to the payment
  const getInstallmentRemaining = (inst: RentalInstallment) => {
    const remaining = parseFloat(String(inst.value)) - parseFloat(String(inst.amount_paid || 0));
    return isEditMode && payment?.installment_id === inst.id ? remaining + paymentAmount : remaining;
  };

  // Load financial summary (rental details + payment history) whenever the modal opens
  useEffect(() => {
    if (!isOpen || !rentalId) return;

    const loadSummary = async () => {
      setLoadingSummary(true);
      setSummaryError(null);
      if (payment) {
        // Edit mode: prefill the form with the payment being edited
        setAmount(numberToCurrencyInput(parseFloat(String(payment.amount || 0))));
        setType(payment.type);
        setPaymentMethod(payment.payment_method);
        setInstallmentId(payment.installment_id || '');
        setNotes(payment.notes || '');
      } else {
        // Reset form state for each new payment
        setAmount('');
        setType('spontaneous');
        setPaymentMethod('pix');
        setInstallmentId('');
        setNotes('');
      }

      try {
        const [details, payments] = await Promise.all([
          rentalService.getById(rentalId),
          paymentService.getByRental(rentalId),
        ]);

        const rental = details?.data || details;
        setTotalAmount(parseFloat(rental.total_amount || '0'));
        setTotalPaid(
          (Array.isArray(payments) ? payments : [])
            .filter((p) => p.status !== 'cancelled')
            .reduce((sum, p) => sum + parseFloat(String(p.amount || 0)), 0)
        );
        const allInstallments: RentalInstallment[] = rental.installments || [];
        setOpenInstallments(
          allInstallments.filter((i) => ['pending', 'partially_paid', 'overdue'].includes(i.status))
        );
        // Keep the installment currently linked to the payment selectable in edit
        // mode, even if it is already fully paid
        setLinkedInstallment(
          payment?.installment_id
            ? allInstallments.find((i) => i.id === payment.installment_id) || null
            : null
        );
      } catch (err) {
        console.error('Error loading payment summary:', err);
        setSummaryError('Erro ao carregar dados financeiros do aluguel.');
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [isOpen, rentalId, payment]);

  // Installments selectable in the dropdown: open ones plus the installment
  // currently linked to the payment in edit mode
  const selectableInstallments = useMemo(() => {
    if (!linkedInstallment || openInstallments.some((i) => i.id === linkedInstallment.id)) {
      return openInstallments;
    }
    return [...openInstallments, linkedInstallment];
  }, [openInstallments, linkedInstallment]);

  // Selecting an installment forces the "installment" type and suggests its remaining value
  const handleInstallmentChange = (id: string) => {
    setInstallmentId(id);
    if (!id) return;
    setType('installment');
    const inst = selectableInstallments.find((i) => i.id === id);
    if (inst) {
      const suggested = Math.min(getInstallmentRemaining(inst), remainingBalance);
      if (suggested > 0) setAmount(numberToCurrencyInput(suggested));
    }
  };

  const numericAmount = parseCurrency(amount);
  const isAmountInvalid =
    Number.isNaN(numericAmount) || numericAmount <= 0 || numericAmount > remainingBalance + 0.009;
  const isInstallmentMissing = type === 'installment' && !installmentId;
  const canSubmit = !loadingSummary && !submitting && !isAmountInvalid && !isInstallmentMissing && remainingBalance > 0;

  const handleSubmit = async () => {
    if (!rentalId || !canSubmit) return;

    setSubmitting(true);
    try {
      if (isEditMode && payment) {
        await paymentService.update(payment.id, {
          amount: numericAmount,
          type,
          payment_method: paymentMethod,
          installment_id: installmentId || null,
          notes: notes.trim() || undefined,
        });
        toast.success('Pagamento atualizado com sucesso!');
      } else {
        await paymentService.create({
          rental_id: rentalId,
          installment_id: installmentId || null,
          amount: numericAmount,
          type,
          payment_method: paymentMethod,
          notes: notes.trim() || undefined,
        });
        toast.success('Pagamento registrado com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isEditMode
          ? 'Erro ao atualizar pagamento. Tente novamente.'
          : 'Erro ao registrar pagamento. Tente novamente.');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-amber-50 text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {isEditMode ? 'Editar Pagamento' : 'Registrar Pagamento'}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {customerName ? `Cliente: ${customerName}` : 'Informe os dados do pagamento recebido.'}
          </p>

          {loadingSummary ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
              <span className="ml-3">Carregando resumo financeiro...</span>
            </div>
          ) : summaryError ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {summaryError}
            </div>
          ) : (
            <>
              {/* Financial summary */}
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor total do aluguel:</span>
                  <span className="font-medium text-gray-800">{formatBRL(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total já pago:</span>
                  <span className="font-medium text-green-600">{formatBRL(totalPaid)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-bold text-gray-800">Saldo devedor:</span>
                  <span className={cn('font-bold', remainingBalance > 0 ? 'text-rose-600' : 'text-green-600')}>
                    {formatBRL(remainingBalance)}
                  </span>
                </div>
              </div>

              {remainingBalance <= 0 ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium text-center">
                  Este aluguel já está totalmente quitado.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Amount */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Valor a pagar</label>
                      <button
                        type="button"
                        onClick={() => setAmount(numberToCurrencyInput(remainingBalance))}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Quitar saldo ({formatBRL(remainingBalance)})
                      </button>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(maskCurrency(e.target.value))}
                      placeholder="0,00"
                      className={cn(
                        'w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 transition-all border',
                        amount && isAmountInvalid
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-100 focus:ring-rose-500'
                      )}
                    />
                    {amount && isAmountInvalid && (
                      <p className="mt-1 text-xs text-red-600">
                        Informe um valor maior que zero e até o saldo devedor ({formatBRL(remainingBalance)}).
                      </p>
                    )}
                  </div>

                  {/* Payment type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de pagamento</label>
                    <select
                      value={type}
                      onChange={(e) => {
                        const newType = e.target.value as PaymentType;
                        setType(newType);
                        if (newType !== 'installment') setInstallmentId('');
                      }}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all border border-gray-100"
                    >
                      {PAYMENT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Linked installment (only when there are open installments) */}
                  {selectableInstallments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parcela vinculada {type === 'installment' && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        value={installmentId}
                        onChange={(e) => handleInstallmentChange(e.target.value)}
                        className={cn(
                          'w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 transition-all border',
                          isInstallmentMissing
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-100 focus:ring-rose-500'
                        )}
                      >
                        <option value="">Nenhuma (pagamento avulso)</option>
                        {selectableInstallments.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            Parcela {inst.number}/{inst.total_installments} —{' '}
                            {formatBRL(getInstallmentRemaining(inst))} restantes (vence{' '}
                            {new Date(inst.due_date).toLocaleDateString('pt-BR')})
                          </option>
                        ))}
                      </select>
                      {isInstallmentMissing && (
                        <p className="mt-1 text-xs text-red-600">Selecione a parcela que está sendo paga.</p>
                      )}
                    </div>
                  )}

                  {/* Payment method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all border border-gray-100"
                    >
                      {PAYMENT_METHOD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Ex: cliente pagou em dinheiro no balcão"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all border border-gray-100 resize-none"
                    />
                  </div>
                </div>
              )}
            </>
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
            disabled={!canSubmit}
            className={cn(
              'flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all',
              canSubmit ? 'bg-amber-500 hover:bg-amber-600 active:scale-95' : 'bg-gray-300 cursor-not-allowed shadow-none'
            )}
          >
            <span className="flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
              {submitting
                ? isEditMode
                  ? 'Salvando...'
                  : 'Registrando...'
                : isEditMode
                  ? 'Salvar Alterações'
                  : 'Confirmar Pagamento'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

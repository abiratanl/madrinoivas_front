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
import { issueReceipt, issueReceiptForPrint } from '../../services/receiptService';
import { cn } from '../../utils/cn';
import { maskCurrency, numberToCurrencyInput, parseCurrency } from '../../utils/masks';
import { PAYMENT_METHOD_OPTIONS, PAYMENT_TYPE_OPTIONS } from './paymentOptions';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: string | null;
  customerName?: string;
  onSuccess: () => void;
  // When provided, the modal switches to edit mode for this payment
  payment?: Payment | null;
}

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
  const [penaltyFee, setPenaltyFee] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [penaltyPaid, setPenaltyPaid] = useState(0);
  const [openInstallments, setOpenInstallments] = useState<RentalInstallment[]>([]);
  const [linkedInstallment, setLinkedInstallment] = useState<RentalInstallment | null>(null);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<PaymentType>('spontaneous');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [installmentId, setInstallmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [includePenalty, setIncludePenalty] = useState(true);
  const [sendReceiptWhatsApp, setSendReceiptWhatsApp] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Remaining value of an installment; in edit mode the payment's own amount is
  // added back for the installment currently linked to the payment
  const getInstallmentRemaining = (inst: RentalInstallment) => {
    const remaining = parseFloat(String(inst.value)) - parseFloat(String(inst.amount_paid || 0));
    return isEditMode && payment?.installment_id === inst.id ? remaining + paymentAmount : remaining;
  };

  // Late-return penalty: tracked through its own installment (type 'penalty') so
  // it can be charged as a separate payment record for managerial reporting
  const penaltyInstallment = useMemo(() => {
    const candidates = linkedInstallment ? [...openInstallments, linkedInstallment] : openInstallments;
    return candidates.find((i) => i.type === 'penalty') || null;
  }, [openInstallments, linkedInstallment]);

  // Penalty still owed: the rental's penalty_fee minus what was already paid
  // against the penalty installment. The fee (not the installment value) is the
  // source of truth, keeping this consistent with the financial summary.
  const penaltyRemaining = useMemo(() => {
    const base =
      penaltyFee > 0
        ? Math.max(0, penaltyFee - penaltyPaid)
        : penaltyInstallment
          ? Math.max(
              0,
              parseFloat(String(penaltyInstallment.value)) -
                parseFloat(String(penaltyInstallment.amount_paid || 0))
            )
          : 0;
    return isEditMode && payment?.installment_id && payment.installment_id === penaltyInstallment?.id
      ? base + paymentAmount
      : base;
  }, [penaltyFee, penaltyPaid, penaltyInstallment, isEditMode, payment, paymentAmount]);

  const isPenaltySelected = !!penaltyInstallment && installmentId === penaltyInstallment.id;

  // Penalty line with checkbox: create mode only, while the penalty is still open
  // and not already being paid through its installment in the dropdown
  const showPenaltyLine = !isEditMode && penaltyRemaining > 0 && !isPenaltySelected;

  // In edit mode the payment's own amount is added back to the available balance.
  // total_amount already includes the penalty fee (items - discount + penalty),
  // so the overall balance covers the fine as well.
  const rentalBalance = useMemo(
    () => Math.max(0, totalAmount - totalPaid + (isEditMode ? paymentAmount : 0)),
    [totalAmount, totalPaid, isEditMode, paymentAmount]
  );

  // The typed amount is the total being charged now. When the penalty checkbox
  // is checked, the ceiling includes the unpaid penalty; unchecked, the penalty
  // is reserved and cannot be charged here. Selecting the penalty installment
  // in the dropdown also unlocks the full balance.
  const chargePenalty = showPenaltyLine && includePenalty;
  const amountCeiling =
    isPenaltySelected || chargePenalty
      ? rentalBalance
      : Math.max(0, rentalBalance - Math.min(penaltyRemaining, rentalBalance));

  // total_amount already includes the penalty fee, so the rental's base value
  // is the total minus the fee. Showing both lines additively keeps the
  // summary arithmetic consistent (base + penalty - paid = balance).
  const baseAmount = Math.max(0, totalAmount - penaltyFee);

  // Balance displayed in the summary follows the penalty checkbox: unchecked
  // means the penalty is not being charged now, so the chargeable balance
  // excludes it. When the penalty installment is selected in the dropdown the
  // full balance is always shown.
  const displayedBalance =
    showPenaltyLine && !includePenalty ? amountCeiling : rentalBalance;

  // Keep the typed amount within the ceiling when the checkbox toggles:
  // an amount that included the penalty is clamped once it is unchecked
  useEffect(() => {
    const typed = parseCurrency(amount);
    if (!Number.isNaN(typed) && typed > amountCeiling + 0.009) {
      setAmount(amountCeiling > 0 ? numberToCurrencyInput(amountCeiling) : '');
    }
  }, [amountCeiling]); // eslint-disable-line react-hooks/exhaustive-deps

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
        setIncludePenalty(true);
        setSendReceiptWhatsApp(true);
      }

      try {
        const [details, payments] = await Promise.all([
          rentalService.getById(rentalId),
          paymentService.getByRental(rentalId),
        ]);

        const rental = details?.data || details;
        setTotalAmount(parseFloat(rental.total_amount || '0'));
        setPenaltyFee(parseFloat(rental.penalty_fee || '0'));
        setTotalPaid(
          (Array.isArray(payments) ? payments : [])
            .filter((p) => p.status !== 'cancelled')
            .reduce((sum, p) => sum + parseFloat(String(p.amount || 0)), 0)
        );
        const allInstallments: RentalInstallment[] = rental.installments || [];
        const penaltyInst = allInstallments.find((i) => i.type === 'penalty');
        setPenaltyPaid(
          (Array.isArray(payments) ? payments : [])
            .filter((p) => p.status !== 'cancelled' && penaltyInst && p.installment_id === penaltyInst.id)
            .reduce((sum, p) => sum + parseFloat(String(p.amount || 0)), 0)
        );
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
      const suggested = Math.min(getInstallmentRemaining(inst), amountCeiling);
      if (suggested > 0) setAmount(numberToCurrencyInput(suggested));
    }
  };

  const numericAmount = parseCurrency(amount);
  const isAmountInvalid =
    Number.isNaN(numericAmount) || numericAmount <= 0 || numericAmount > amountCeiling + 0.009;
  const isInstallmentMissing = type === 'installment' && !installmentId;
  const canSubmit =
    !loadingSummary && !submitting && !isAmountInvalid && !isInstallmentMissing && amountCeiling > 0;

  // Issue the receipt for each newly created payment, following the modal's
  // checkbox: WhatsApp delivery or a printable PDF opened in a new tab
  const issueReceiptsFor = async (paymentIds: string[]) => {
    for (const paymentId of paymentIds) {
      try {
        if (sendReceiptWhatsApp) {
          const result = await issueReceipt(paymentId);
          if (result.whatsappDeliveryStatus === 'failed') {
            toast.error('Recibo emitido, mas não foi possível enviá-lo pelo WhatsApp.');
          } else {
            toast.success('Recibo emitido e enviado pelo WhatsApp!');
          }
        } else {
          const blob = await issueReceiptForPrint(paymentId);
          const url = URL.createObjectURL(blob);
          const printWindow = window.open(url, '_blank');
          if (printWindow) {
            printWindow.onload = () => printWindow.print();
          } else {
            toast.error('Recibo gerado, mas o navegador bloqueou a janela de impressão.');
          }
        }
      } catch (err) {
        console.error('Error issuing receipt:', err);
        toast.error('Pagamento registrado, mas houve erro ao emitir o recibo.');
      }
    }
  };

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
        // The typed amount may include the penalty (checkbox). The penalty part
        // is recorded as its own payment, linked to the penalty installment,
        // so it can be tracked separately in reports.
        const penaltyPart = chargePenalty ? Math.min(penaltyRemaining, numericAmount) : 0;
        const mainAmount = numericAmount - penaltyPart;
        const createdPaymentIds: string[] = [];
        if (mainAmount > 0) {
          const created = await paymentService.create({
            rental_id: rentalId,
            installment_id: installmentId || null,
            amount: mainAmount,
            type,
            payment_method: paymentMethod,
            notes: notes.trim() || undefined,
          });
          if (created?.data?.id) createdPaymentIds.push(created.data.id);
        }
        if (penaltyPart > 0) {
          try {
            const created = await paymentService.create({
              rental_id: rentalId,
              installment_id: penaltyInstallment?.id || null,
              amount: penaltyPart,
              type: penaltyInstallment ? 'installment' : 'spontaneous',
              payment_method: paymentMethod,
              notes: 'Multa por atraso',
            });
            if (created?.data?.id) createdPaymentIds.push(created.data.id);
          } catch (penaltyErr) {
            console.error('Error registering penalty payment:', penaltyErr);
            toast.error('Pagamento registrado, mas houve erro ao lançar a multa. Registre-a separadamente.');
          }
        }
        toast.success('Pagamento registrado com sucesso!');
        await issueReceiptsFor(createdPaymentIds);
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
                  <span className="text-gray-500">
                    {penaltyFee > 0 ? 'Valor do aluguel (sem multa):' : 'Valor total do aluguel:'}
                  </span>
                  <span className="font-medium text-gray-800">{formatBRL(baseAmount)}</span>
                </div>
                {penaltyFee > 0 && (
                  <div className="flex justify-between items-center">
                    <label
                      className={cn(
                        'flex items-center gap-2 text-gray-500',
                        showPenaltyLine && 'cursor-pointer select-none'
                      )}
                    >
                      {showPenaltyLine && (
                        <input
                          type="checkbox"
                          checked={includePenalty}
                          onChange={(e) => setIncludePenalty(e.target.checked)}
                          className="w-4 h-4 accent-rose-600 cursor-pointer"
                        />
                      )}
                      Multa por atraso:
                    </label>
                    <span
                      className={cn(
                        'font-medium',
                        penaltyRemaining > 0 ? 'text-amber-600' : 'text-green-600'
                      )}
                    >
                      {formatBRL(penaltyFee)}
                      {penaltyRemaining <= 0 && ' (quitada)'}
                      {showPenaltyLine && !includePenalty && ' (não cobrada)'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Total já pago:</span>
                  <span className="font-medium text-green-600">{formatBRL(totalPaid)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-bold text-gray-800">
                    {showPenaltyLine && !includePenalty ? 'Saldo a cobrar:' : 'Saldo devedor:'}
                  </span>
                  <span
                    className={cn(
                      'font-bold',
                      displayedBalance > 0 ? 'text-rose-600' : 'text-green-600'
                    )}
                  >
                    {formatBRL(displayedBalance)}
                  </span>
                </div>
              </div>

              {amountCeiling <= 0 ? (
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
                        onClick={() => setAmount(numberToCurrencyInput(amountCeiling))}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Quitar saldo ({formatBRL(amountCeiling)})
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
                        Informe um valor maior que zero e até o saldo devedor ({formatBRL(amountCeiling)}).
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
                            {inst.type === 'penalty'
                              ? `Multa por atraso — ${formatBRL(getInstallmentRemaining(inst))} restantes`
                              : `Parcela ${inst.number}/${inst.total_installments} — ${formatBRL(getInstallmentRemaining(inst))} restantes (vence ${new Date(inst.due_date).toLocaleDateString('pt-BR')})`}
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

                  {/* Receipt delivery: WhatsApp when checked, printable PDF otherwise */}
                  {!isEditMode && (
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sendReceiptWhatsApp}
                        onChange={(e) => setSendReceiptWhatsApp(e.target.checked)}
                        className="w-4 h-4 accent-rose-600 cursor-pointer"
                      />
                      Enviar recibo por WhatsApp
                    </label>
                  )}
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

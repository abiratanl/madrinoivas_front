import { useState, useMemo, useEffect, Fragment } from 'react';
import { UserPlus, Search, Package, Calendar, Loader2, RotateCcw, Trash2, ChevronDown, ChevronRight, Truck, Undo2, Ban, User, Edit2, DollarSign, FileText, Receipt } from 'lucide-react';
import { useRentals } from '../../hooks/useRentals';
import { rentalService, type Rental } from '../../services/rentalService';
import { paymentService, type Payment, type RentalInstallment } from '../../services/paymentService';
import { customerService } from '../../services/customerService';
import type { Customer } from '../../types/customer';
import type { Product } from '../../services/productService';
import { issueReceipt } from '../../services/receiptService';
import {
  storeService,
  getStoreMainPhone,
  getStoreMainEmail,
  type Store,
} from '../../services/storeService';
import { RentalModal } from './components/RentalModal';
import { ContractModal } from './components/ContractModal';
import { ReturnModal } from '../../components/rentals/ReturnModal';
import { PaymentModal } from '../../components/rentals/PaymentModal';
import {
  PAYMENT_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '../../components/rentals/paymentOptions';
import { CancelPaymentModal } from '@/components/rentals/CancelPaymentModal';
import { cn } from '../../utils/cn';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const buildStoreData = (store: Store | null) => {
  const primaryAddress = store?.addresses?.[0];
  return {
    name: store?.name || 'Madrinoivas',
    address: store?.address || '',
    city: store?.city || primaryAddress?.city || '',
    state: store?.state || primaryAddress?.state || '',
    cnpj: store?.cnpj || '',
    phone: getStoreMainPhone(store) || '(00) 0000-0000',
    email: getStoreMainEmail(store) || 'contato@madrinoivas.com',
    owner_name: store?.owner_name,
    owner_signature_url: store?.owner_signature_url,
    digital_signature_base64: store?.digital_signature_base64,
  };
};

const INSTALLMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  partially_paid: 'Parcialmente paga',
  paid: 'Paga',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

const INSTALLMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  partially_paid: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-400 line-through',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PAYMENT_TYPE_OPTIONS.map((o) => [o.value, o.label])
);
const PAYMENT_METHOD_LABELS: Record<string, string> = Object.fromEntries(
  PAYMENT_METHOD_OPTIONS.map((o) => [o.value, o.label])
);

function StopPropagationButton({ children, onClick, ...props }: {
  children: React.ReactNode; 
  onClick: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      {...props}
    >
      {children}
    </button>
  );
}

function ExpandedRowContent({
  rental,
  rentalDetailsCache,
  availableProducts,
  customers,
  canManagePayments,
  onEditPayment,
  onCancelPayment,
}: {
  rental: Rental;
  rentalDetailsCache: Record<string, Rental>;
  availableProducts: Product[];
  customers: Customer[];
  canManagePayments: boolean;
  onEditPayment: (payment: Payment) => void;
  onCancelPayment: (payment: Payment) => void;
}) {
  const detailed = rentalDetailsCache[rental.id];

  // Load payment history so the financial summary reflects what was already paid.
  // Re-fetches whenever the cached details are invalidated (e.g. after a new payment).
  const [payments, setPayments] = useState<Payment[] | null>(null);
  // Tracks which payment is currently having a receipt issued (per-row loading state)
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);

  // Issue a payment receipt and report the WhatsApp delivery outcome
  const handleIssueReceipt = async (payment: Payment) => {
    setReceiptLoadingId(payment.id);
    try {
      const result = await issueReceipt(payment.id);
      if (result.whatsappDeliveryStatus === 'failed') {
        toast.error(
          'Recibo emitido, mas não foi possível enviá-lo pelo WhatsApp. Tente novamente mais tarde.'
        );
      } else {
        toast.success('Recibo emitido e enviado pelo WhatsApp com sucesso!');
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao emitir o recibo. Tente novamente.';
      toast.error(message);
    } finally {
      setReceiptLoadingId(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setPayments(null);
    paymentService
      .getByRental(rental.id)
      .then((data) => {
        if (!cancelled) setPayments(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setPayments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [rental.id, detailed]);

  if (!detailed) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        <span className="ml-3 text-gray-500">Carregando detalhes...</span>
      </div>
    );
  }

  const items = detailed.items || [];
  const customer = customers.find(c => String(c.id) === String(detailed.customer_id));
  
  // Calcular subtotal dos itens
  const itemsSubtotal = items.reduce((sum: number, item) => {
    const unitPrice = Number(item.unit_price || item.product?.rental_price || 0);
    const qty = Number(item.quantity || 1);
    return sum + (unitPrice * qty);
  }, 0);
  
  const totalPrice = Number(detailed.total_price || detailed.total_amount || 0);
  const penaltyFee = Number(detailed.penalty_fee || 0);
  const discount = itemsSubtotal - totalPrice + penaltyFee;
  const hasDiscount = discount > 0.01;
  const hasPenalty = penaltyFee > 0.01;

  const totalPaid = (payments || [])
    .filter((p) => p.status !== 'cancelled')
    .reduce((sum: number, p) => sum + parseFloat(String(p.amount || 0)), 0);
  const remainingBalance = Math.max(0, totalPrice - totalPaid);
  const installments: RentalInstallment[] = detailed.installments || [];
  
  const getItemCount = (r: { items?: Array<{ quantity?: number }> }) =>
    (r.items || []).reduce((sum: number, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      {/* Cliente Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-rose-600" />
          Dados do Cliente
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Nome:</span>
            <span className="ml-2 font-medium text-gray-800">{customer?.name || 'Não encontrado'}</span>
          </div>
          <div>
            <span className="text-gray-500">CPF:</span>
            <span className="ml-2 font-medium text-gray-800">{customer?.cpf || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">Telefone:</span>
            <span className="ml-2 font-medium text-gray-800">{customer?.main_phone || '-'}</span>
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="mb-4">
        <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-rose-600" />
          Produtos do Aluguel ({items.length})
        </h4>
        <div className="space-y-2">
          {items.map((item, idx: number) => {
            const product = availableProducts.find(p => p.id === item.product_id);
            const productName = item.product_name || product?.name || item.product?.name || 'Produto não encontrado';
            const productCode = item.product_code || product?.code || item.product?.code || '';
            const productSize = product?.size || item.product?.size || '';
            const productImage = item.image_url || product?.image_url || '';
            const unitPrice = Number(item.unit_price || product?.rental_price || item.product?.rental_price || 0);
            const qty = Number(item.quantity || 1);
            const subtotal = unitPrice * qty;
            const itemKey = item.id || item.product_id || item.productId;
            
            return (
              <div key={`${rental.id}-${itemKey}-${idx}`} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  {productImage && (
                    <img src={productImage} alt={productName} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{productName}</p>
                    <p className="text-xs text-gray-500">{productCode} {productSize && `• Tam: ${productSize}`}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-sm">
                  <div>
                    <span className="text-gray-500">Qtd:</span>
                    <span className="ml-1 font-bold text-gray-800">{qty}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Vlr. Unit.:</span>
                    <span className="ml-1 font-medium text-gray-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="ml-1 font-bold text-rose-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              Nenhum produto vinculado
            </div>
          )}
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5 text-rose-600" />
          Resumo Financeiro
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal dos produtos ({getItemCount(detailed)} un.):</span>
            <span className="font-medium text-gray-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemsSubtotal)}
            </span>
          </div>
          {hasDiscount && (
            <div className="flex justify-between text-green-600">
              <span className="font-medium">Desconto aplicado:</span>
              <span className="font-bold">
                -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}
              </span>
            </div>
          )}
          {hasPenalty && (
            <div className="flex justify-between text-amber-600">
              <span className="font-medium">Multa por atraso:</span>
              <span className="font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(penaltyFee)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 text-lg">
            <span className="font-bold text-gray-800">Total:</span>
            <span className="font-bold text-rose-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}
            </span>
          </div>
          {payments === null ? (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Carregando pagamentos...</span>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total pago:</span>
                <span className="font-bold text-green-600">{formatBRL(totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">Saldo devedor:</span>
                <span className={cn('font-bold', remainingBalance > 0 ? 'text-rose-600' : 'text-green-600')}>
                  {formatBRL(remainingBalance)}
                </span>
              </div>
            </div>
          )}

          {installments.length > 0 && (
            <div className="border-t border-gray-200 pt-3 space-y-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Parcelas</p>
              {installments.map((inst) => {
                const instValue = Number(inst.value || 0);
                const instPaid = Number(inst.amount_paid || 0);
                const isPenalty = inst.type === 'penalty';
                return (
                  <div key={inst.id} className="flex items-center justify-between gap-2">
                    <span className="text-gray-600">
                      {isPenalty
                        ? 'Multa por atraso'
                        : `Parcela ${inst.number}/${inst.total_installments}`}{' '}
                      — vence {new Date(inst.due_date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {instPaid > 0 && instPaid < instValue
                          ? `${formatBRL(instPaid)} / ${formatBRL(instValue)}`
                          : formatBRL(instValue)}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter',
                          INSTALLMENT_STATUS_COLORS[inst.status] || 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {INSTALLMENT_STATUS_LABELS[inst.status] || inst.status}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      {payments !== null && payments.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-rose-600" />
            Histórico de Pagamentos ({payments.length})
          </h4>
          <div className="space-y-2">
            {payments.map((payment) => {
              const isCancelled = payment.status === 'cancelled';
              return (
                <div
                  key={payment.id}
                  className={cn(
                    'flex items-center justify-between gap-2 bg-white rounded-lg p-3 border text-sm',
                    isCancelled ? 'border-gray-200 opacity-60' : 'border-gray-100'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'font-bold',
                          isCancelled ? 'text-gray-400 line-through' : 'text-green-600'
                        )}
                      >
                        {formatBRL(parseFloat(String(payment.amount || 0)))}
                      </span>
                      <span
                        className={cn(
                          'text-gray-600',
                          isCancelled && 'line-through text-gray-400'
                        )}
                      >
                        {PAYMENT_TYPE_LABELS[payment.type] || payment.type} •{' '}
                        {PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method}
                      </span>
                      {isCancelled && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-gray-100 text-gray-500">
                          Cancelado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(payment.paid_at).toLocaleDateString('pt-BR')}
                      {payment.user_name && ` • Registrado por ${payment.user_name}`}
                    </p>
                    {isCancelled && payment.cancellation_reason && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">
                        Motivo: {payment.cancellation_reason}
                        {payment.cancelled_by_name && ` (por ${payment.cancelled_by_name})`}
                      </p>
                    )}
                  </div>
                  {!isCancelled && canManagePayments && (
                    <div className="flex gap-1">
                      {payment.status === 'confirmed' && (
                        <StopPropagationButton
                          onClick={() => handleIssueReceipt(payment)}
                          title="Enviar Recibo"
                          className={cn(
                            'p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all active:scale-90',
                            receiptLoadingId === payment.id && 'opacity-50 cursor-wait'
                          )}
                        >
                          {receiptLoadingId === payment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Receipt className="w-4 h-4" />
                          )}
                        </StopPropagationButton>
                      )}
                      <StopPropagationButton
                        onClick={() => onEditPayment(payment)}
                        title="Editar Pagamento"
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                      >
                        <Edit2 className="w-4 h-4" />
                      </StopPropagationButton>
                      <StopPropagationButton
                        onClick={() => onCancelPayment(payment)}
                        title="Cancelar Pagamento"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                      >
                        <Ban className="w-4 h-4" />
                      </StopPropagationButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Observações */}
      {detailed.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-rose-600" />
            Observações
          </h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{detailed.notes}</p>
        </div>
      )}

      {!detailed.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-rose-600" />
            Observações
          </h4>
          <p className="text-sm text-gray-400 italic">Nenhuma observação registrada</p>
        </div>
      )}
    </>
  );
}

export default function Rentals() {
  const {
    rentals: allRentals,
    customers,
    availableProducts,
    loading,
    formData,
    setFormData,
    isModalOpen,
    isEditing,
    currentStep,
    setCurrentStep,
    searchTerm,
    statusFilter,
    setShowInactives,
    openCreateModal,
    openEditModal,
    closeModal,
    addProduct,
    removeProduct,
    updateProductQuantity,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    handleReturn,
    handlePickup,
    handleCancel,
    handleDelete,
    handleSearch,
    handleStatusFilter,
    getStatusColor,
    getStatusLabel,
    validateStep1,
    validateStep2,
    validateStep3,
    loadRentalDetails,
    rentalDetailsCache,
    clearRentalDetailsCache,
    loadRentals,
    loadingCancelled,
    loadingReturned,
    hasLoadedCancelled,
    hasLoadedReturned,
    loadCancelledRentals,
    loadReturnedRentals,
  } = useRentals();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'return' | 'cancel' | 'pickup' | 'contract' | 'delete' | null>(null);
  const [confirmRentalId, setConfirmRentalId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [expandingRow, setExpandingRow] = useState<string | null>(null);
  const [highlightedRentalId, setHighlightedRentalId] = useState<string | null>(null);
  const [showOnlyNew, setShowOnlyNew] = useState(false);

  // Return modal state
  const [returnModalRentalId, setReturnModalRentalId] = useState<string | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Payment modal state
  const [paymentRentalId, setPaymentRentalId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [cancellingPayment, setCancellingPayment] = useState<Payment | null>(null);

  const { selectedStore, user } = useAuth();
  const canManagePayments = !!user?.role && ['admin', 'owner'].includes(user.role.toLowerCase());

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setPaymentRentalId(payment.rental_id);
    setIsPaymentModalOpen(true);
  };

  const handleCancelPayment = (payment: Payment) => {
    setCancellingPayment(payment);
  };

  // Refresh balances and the list after a payment is created/edited/cancelled
  const refreshAfterPaymentChange = (rentalId: string | null) => {
    if (rentalId) {
      clearRentalDetailsCache(rentalId);
      // If the row is expanded, reload its details immediately
      if (expandedRow === rentalId) loadRentalDetails(rentalId);
    }
    loadRentals({ status: statusFilter || undefined });
  };
  
  // Contract modal state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractRental, setContractRental] = useState<Rental | null>(null);
  const [contractCustomer, setContractCustomer] = useState<Customer | undefined>(undefined);
  const [contractStore, setContractStore] = useState<Store | null>(null);
  const [contractItems, setContractItems] = useState<
    { product: Product; quantity: number; unit_price: number }[]
  >([]);
  const [contractPayments, setContractPayments] = useState<Payment[]>([]);

  const handleActionClick = (action: 'return' | 'cancel' | 'payment' | 'pickup' | 'contract' | 'delete', id: string) => {
    if (action === 'contract') {
      openContractModal(id);
      return;
    }
    if (action === 'return') {
      setReturnModalRentalId(id);
      setIsReturnModalOpen(true);
      return;
    }
    if (action === 'payment') {
      setPaymentRentalId(id);
      setIsPaymentModalOpen(true);
      return;
    }
    setConfirmAction(action);
    setConfirmRentalId(id);
    setIsConfirmOpen(true);
  };

  const openContractModal = async (id: string) => {
    try {
      setContractStore(null);

      // Load rental details if not in cache
      let rental = allRentals.find(r => r.id === id);
      if (!rental) return;

      // Ensure we have detailed rental data
      if (!rental.items?.length) {
        const detailed = await loadRentalDetails(id);
        if (detailed) rental = detailed;
      }

      if (!rental) return; // TypeScript narrowing

      const customerSummary =
        customers.find(c => String(c.id) === String(rental.customer_id)) ||
        customers.find(
          c =>
            c.name.toLowerCase().trim() ===
            (rental.customer_name || '').toLowerCase().trim(),
        );

      // Load full customer, payment history and the rental's store in parallel.
      // The store is always read from the database so contract fields such as
      // CNPJ, city and state reflect the rental's actual store.
      const [fullCustomer, payments, storeResponse] = await Promise.all([
        customerSummary?.id
          ? customerService.getById(customerSummary.id).catch(() => customerSummary)
          : Promise.resolve(customerSummary),
        paymentService.getByRental(rental.id).catch(() => [] as Payment[]),
        rental.store_id
          ? storeService.getById(rental.store_id).catch(() => null)
          : Promise.resolve(null),
      ]);
      const fullStore = (storeResponse?.data ?? storeResponse) as Store | null;

      // Build items with product details
      const itemsWithProducts = (rental.items || []).map((item) => {
        const product = availableProducts.find(p => p.id === item.product_id || p.id === item.id);
        return {
          product: product || ({
            id: item.product_id || item.id,
            name: item.product?.name || item.name || 'Produto',
            color: item.product?.color,
            size: item.product?.size,
            brand: item.product?.brand,
            model: item.product?.model,
            accessories: item.product?.accessories,
            sale_price: item.product?.sale_price || (item.product?.rental_price || 0) * 10,
            rental_price: item.product?.rental_price || item.unit_price,
          } as Product),
          quantity: item.quantity || 1,
          unit_price: Number(item.unit_price || item.product?.rental_price || 0),
        };
      });

      setContractRental(rental);
      setContractCustomer(fullCustomer);
      setContractStore(fullStore);
      setContractItems(itemsWithProducts);
      setContractPayments(payments);
      setIsContractModalOpen(true);
    } catch (err) {
      console.error('Erro ao abrir contrato:', err);
      toast.error('Erro ao carregar dados do contrato');
    }
  };

  const handleRowClick = async (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
      return;
    }

    // Caso contrário, carrega detalhes primeiro
    // O loadRentalDetails já verifica o cache internamente
    setExpandingRow(id);
    await loadRentalDetails(id);
    setExpandingRow(null);
    setExpandedRow(id);
  };

  // Wrapper para handleStatusFilter para carregar cancelados/devolvidos sob demanda
  const handleStatusFilterWrapper = (status: string) => {
    if (status === 'cancelled' && !hasLoadedCancelled) {
      loadCancelledRentals();
    } else if (status === 'returned' && !hasLoadedReturned) {
      loadReturnedRentals();
    }
    // 'late' é tratado dentro do handleStatusFilter (carrega picked_up e filtra client-side)
    handleStatusFilter(status);
  };

  const handleConfirmAction = async () => {
    if (!confirmRentalId || !confirmAction) return;
    
    // Validar status antes de executar ações
    const rental = allRentals.find(r => r.id === confirmRentalId);

    // 'return' is now handled by ReturnModal
    if (confirmAction === 'cancel') {
      if (rental && !canCancel(rental.status)) {
        toast.error(`Não é possível cancelar: status "${getStatusLabel(rental.status)}".`);
        setIsConfirmOpen(false);
        setConfirmAction(null);
        setConfirmRentalId(null);
        return;
      }
      await handleCancel(confirmRentalId);
    } else if (confirmAction === 'delete') {
      if (!rental) {
        toast.error('Aluguel não encontrado na lista.');
        setIsConfirmOpen(false);
        setConfirmAction(null);
        setConfirmRentalId(null);
        return;
      }
      if (!canDelete(rental.status, user?.role)) {
        toast.error('Apenas administradores/proprietários podem excluir aluguéis cancelados permanentemente.');
        setIsConfirmOpen(false);
        setConfirmAction(null);
        setConfirmRentalId(null);
        return;
      }
      await handleDelete(confirmRentalId);
    } else if (confirmAction === 'pickup') {
      if (rental && !canMarkAsPickedUp(rental.status)) {
        toast.error(`Não é possível marcar como retirado: status "${getStatusLabel(rental.status)}".`);
        setIsConfirmOpen(false);
        setConfirmAction(null);
        setConfirmRentalId(null);
        return;
      }
      await handlePickup(confirmRentalId);
    }
    
    setIsConfirmOpen(false);
    setConfirmAction(null);
    setConfirmRentalId(null);
  };

  const canReturn = (status: string) => ['picked_up', 'late'].includes(status);
  const canCancel = (status: string) => ['budget', 'reserved'].includes(status);
  const canDelete = (status: string, userRole?: string) => {
    const isAdminOrOwner = userRole && ['admin', 'owner'].includes(userRole.toLowerCase());
    return isAdminOrOwner && status === 'cancelled';
  };
  const canPay = (status: string) => ['budget', 'reserved', 'picked_up', 'late'].includes(status);
  const canMarkAsPickedUp = (status: string) => ['budget', 'reserved'].includes(status);
  const canEdit = (status: string) => ['budget', 'reserved', 'picked_up', 'late', 'cancelled'].includes(status);

  // Filtro local por busca e status
  const filteredRentals = useMemo(() => {
    let result = allRentals;
    
    if (showOnlyNew && highlightedRentalId) {
      result = result.filter(rental => rental.id === highlightedRentalId);
    }
    
    // Filtrar por status (o status já vem computado do loadRentals com a regra de late)
    if (statusFilter) {
      result = result.filter(rental => rental.status === statusFilter);
    }
    
    if (!searchTerm.trim()) return result;
    const term = searchTerm.toLowerCase();
    return result.filter(rental => {
      const customerName = (rental.customer_name || '').toLowerCase();
      const customerCpf = (rental.customer_cpf || '').toLowerCase();
      return customerName.includes(term) || customerCpf.includes(term) || String(rental.id).includes(term);
    });
  }, [allRentals, searchTerm, highlightedRentalId, showOnlyNew, statusFilter]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Aluguéis</h1>
          <p className="text-sm text-gray-500">Gerencie aluguéis, devoluções e orçamentos.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" /> Novo Aluguel
        </button>
      </div>

      {/* BUSCA E FILTROS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar cliente por nome ou CPF"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all border border-gray-100"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {highlightedRentalId && (
            <button
              onClick={() => {
                if (showOnlyNew) {
                  setShowOnlyNew(false);
                } else {
                  handleSearch('');
                  handleStatusFilter('');
                  setShowInactives(false);
                  setShowOnlyNew(true);
                }
              }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-2 animate-pulse",
                showOnlyNew
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
              )}
              title={showOnlyNew ? "Mostrar todos os aluguéis" : "Mostrar apenas o aluguel recém-criado"}
            >
              <Package className="w-4 h-4" />
              {showOnlyNew ? 'Mostrar Todos' : 'Mostrar Novo'}
            </button>
          )}
          {['', 'budget', 'picked_up', 'late', 'reserved', 'returned', 'cancelled'].map((status) => {
            const isLoading = (status === 'cancelled' && loadingCancelled) || (status === 'returned' && loadingReturned);
            return (
            <button
              key={status}
              onClick={() => handleStatusFilterWrapper(status)}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-1",
                statusFilter === status
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-600",
                isLoading && "opacity-50 cursor-wait"
              )}
            >
              {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              {status ? getStatusLabel(status) : 'Ativos'}
            </button>
            );
          })}
        </div>
      </div>

      {/* TABELA DE ALUGUÉIS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
            <p className="font-medium">Carregando aluguéis...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-20 flex flex-col items-center gap-4 text-gray-400">
            <Package className="w-16 h-16 text-gray-300" />
            <p className="font-medium text-gray-500">
              {searchTerm ? 'Nenhum aluguel encontrado para esta busca' : 'Nenhum aluguel cadastrado'}
            </p>
            {!searchTerm && <p className="text-sm text-gray-400">Clique em "Novo Aluguel" para criar o primeiro</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50">
                  <th className="px-6 py-5 w-12"></th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5">Período</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Valor Total</th>
                  <th className="px-6 py-5 text-right w-48">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRentals.map((rental) => {
                  const customerName = rental.customer_name || 'Cliente não encontrado';
                  const customerInitial = customerName.charAt(0).toUpperCase() || '?';
                  const isExpanded = expandedRow === rental.id;
                  const isHighlighted = highlightedRentalId === rental.id;
                  
                  return (
                    <Fragment key={rental.id}>
                      <tr 
                        key={rental.id} 
                        className={cn(
                          "hover:bg-gray-50/50 transition-colors cursor-pointer",
                          isExpanded && "bg-rose-50",
                          isHighlighted && "bg-green-50 ring-2 ring-green-300 animate-pulse"
                        )}
                        onClick={() => handleRowClick(rental.id)}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRowClick(rental.id); }}
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                          >
                            {expandingRow === rental.id ? <Loader2 className="w-5 h-5 animate-spin" /> : isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
                              {customerInitial}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm flex items-center gap-2">
                                {customerName}
                                {isHighlighted && (
                                  <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full animate-pulse">
                                    Novo
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400">CPF: {rental.customer_cpf || 'Não informado'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {rental.start_date ? new Date(rental.start_date).toLocaleDateString('pt-BR') : '-'}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1.5">
                              <RotateCcw className="w-3.5 h-3.5" />
                              {rental.end_date_scheduled ? new Date(rental.end_date_scheduled).toLocaleDateString('pt-BR') : '-'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border",
                            getStatusColor(rental.status)
                          )}>
                            {getStatusLabel(rental.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800">
                            {rental.total_price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rental.total_price) : '-'}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            {/* EDITAR - para budget, reserved, picked_up, late, cancelled */}
                            {canEdit(rental.status) && (
                              <StopPropagationButton
                                onClick={() => openEditModal(rental.id)}
                                title="Editar Aluguel"
                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                              >
                                <Edit2 className="w-4 h-4" />
                              </StopPropagationButton>
                            )}

                            {/* REGISTRAR PAGAMENTO - para budget, reserved, picked_up, late */}
                            {canPay(rental.status) && (
                              <StopPropagationButton
                                onClick={() => handleActionClick('payment', rental.id)}
                                title="Registrar Pagamento"
                                className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all active:scale-90"
                              >
                                <DollarSign className="w-4 h-4" />
                              </StopPropagationButton>
                            )}

                            {/* GERAR CONTRATO - para budget, reserved */}
                            {(rental.status === 'budget' || rental.status === 'reserved') && (
                              <StopPropagationButton
                                onClick={() => handleActionClick('contract', rental.id)}
                                title="Gerar Contrato"
                                className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all active:scale-90"
                              >
                                <FileText className="w-4 h-4" />
                              </StopPropagationButton>
                            )}

                            {/* MARCAR COMO RETIRADO - para budget, reserved */}
                            {canMarkAsPickedUp(rental.status) && (
                              <StopPropagationButton
                                onClick={() => handleActionClick('pickup', rental.id)}
                                title="Marcar como Retirado"
                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                              >
                                <Truck className="w-4 h-4" />
                              </StopPropagationButton>
                            )}

                            {/* REGISTRAR DEVOLUÇÃO - para picked_up, late */}
                            {canReturn(rental.status) && (
                              <StopPropagationButton
                                onClick={() => handleActionClick('return', rental.id)}
                                title="Registrar Devolução"
                                className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all active:scale-90"
                              >
                                <Undo2 className="w-4 h-4" />
                              </StopPropagationButton>
                            )}

                            {/* CANCELAR - para budget, reserved */}
                            {canCancel(rental.status) && (
                              <StopPropagationButton
                                onClick={() => handleActionClick('cancel', rental.id)}
                                title="Cancelar Aluguel"
                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                              >
                                <Ban className="w-4 h-4" />
                              </StopPropagationButton>
                            )}

                            {/* EXCLUIR - apenas cancelados para admin/owner */}
                            {canDelete(rental.status, user?.role) && (
                              <StopPropagationButton
                                onClick={() => handleActionClick('delete', rental.id)}
                                title="Excluir permanentemente"
                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                              >
                                <Trash2 className="w-4 h-4" />
                              </StopPropagationButton>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* LINHA EXPANDIDA - DETALHES DOS PRODUTOS */}
                      {isExpanded && (
                        <tr key={`${rental.id}-detail`} className="bg-rose-50/50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="bg-white rounded-xl border border-gray-100 p-4 ml-12">
                              <ExpandedRowContent
                                rental={rental}
                                rentalDetailsCache={rentalDetailsCache}
                                availableProducts={availableProducts}
                                customers={customers}
                                canManagePayments={canManagePayments}
                                onEditPayment={handleEditPayment}
                                onCancelPayment={handleCancelPayment}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => { setIsConfirmOpen(false); setConfirmAction(null); setConfirmRentalId(null); }}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === 'cancel' ? 'Cancelar Aluguel' :
          confirmAction === 'pickup' ? 'Marcar como Retirado' :
          'Excluir Permanentemente'
        }
        description={
          confirmAction === 'cancel'
            ? 'Esta ação cancelará o aluguel. Somente aluguéis não retirados podem ser cancelados.'
            : confirmAction === 'pickup'
            ? 'Esta ação marcará o aluguel como retirado pelo cliente.'
            : 'Esta ação excluirá PERMANENTEMENTE o aluguel cancelado. Esta ação NÃO PODE SER DESFEITA.'
        }
        confirmText={
          confirmAction === 'cancel' ? 'Sim, Cancelar' :
          confirmAction === 'pickup' ? 'Confirmar Retirada' :
          'Sim, Excluir Permanentemente'
        }
        variant={
          confirmAction === 'delete' || confirmAction === 'cancel' ? 'danger' : 'warning'
        }
      />

      {/* MODAL DE ALUGUEL */}
      <RentalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        isEditing={isEditing}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        formData={formData}
        setFormData={setFormData}
        customers={customers}
        availableProducts={availableProducts}
        handleSubmit={async (e) => {
          const createdRental = await handleSubmit(e);
          if (createdRental?.id) {
            setHighlightedRentalId(createdRental.id);
            // Clear highlight after 10 seconds
            setTimeout(() => setHighlightedRentalId(null), 10000);
          }
        }}
        addProduct={addProduct}
        removeProduct={removeProduct}
        updateProductQuantity={updateProductQuantity}
        handleNextStep={handleNextStep}
        handlePrevStep={handlePrevStep}
        validateStep1={validateStep1}
        validateStep2={validateStep2}
        validateStep3={validateStep3}
      />

      {/* MODAL DE CONTRATO */}
      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        rental={contractRental}
        customer={contractCustomer}
        store={buildStoreData(contractStore ?? selectedStore)}
        items={contractItems}
        payments={contractPayments}
        onGenerateContract={async (rentalId, signatureBase64) => {
          const response = await rentalService.generateContract(rentalId, { lessee_signature: signatureBase64 });
          return {
            contractId: response.data?.id || response.id,
            pdfUrl: response.data?.pdf_url || response.pdf_url,
          };
        }}
        onSendEmail={async (contractId, email) => {
          return rentalService.sendContractEmail(contractId, { email });
        }}
        onSendWhatsApp={async (contractId, phone) => {
          return rentalService.sendContractWhatsApp(contractId, { phone });
        }}
      />

      {/* MODAL DE DEVOLUÇÃO */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setReturnModalRentalId(null);
        }}
        onConfirm={async (makeAvailable) => {
          if (returnModalRentalId) {
            await handleReturn(returnModalRentalId, makeAvailable);
          }
        }}
        rentalStatus={allRentals.find(r => r.id === returnModalRentalId)?.status || 'picked_up'}
      />

      {/* MODAL DE PAGAMENTO */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentRentalId(null);
          setEditingPayment(null);
        }}
        rentalId={editingPayment?.rental_id || paymentRentalId}
        customerName={
          editingPayment
            ? allRentals.find((r) => r.id === editingPayment.rental_id)?.customer_name
            : allRentals.find((r) => r.id === paymentRentalId)?.customer_name
        }
        payment={editingPayment}
        onSuccess={() => {
          refreshAfterPaymentChange(editingPayment?.rental_id || paymentRentalId);
          setEditingPayment(null);
        }}
      />

      {/* MODAL DE CANCELAMENTO DE PAGAMENTO */}
      <CancelPaymentModal
        isOpen={!!cancellingPayment}
        onClose={() => setCancellingPayment(null)}
        payment={cancellingPayment}
        onSuccess={() => {
          refreshAfterPaymentChange(cancellingPayment?.rental_id || null);
          setCancellingPayment(null);
        }}
      />
    </div>
  );
}
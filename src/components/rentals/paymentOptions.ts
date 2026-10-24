import type { PaymentMethod, PaymentType } from '../../services/paymentService';

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

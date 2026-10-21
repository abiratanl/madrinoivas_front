import { api } from '@/lib/axios';

export type PaymentType = 'entry' | 'installment' | 'spontaneous' | 'pickup_balance';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer';
export type PaymentStatus = 'confirmed' | 'cancelled';

// Payload for POST /payments
export interface CreatePaymentDTO {
  rental_id: string;
  installment_id?: string | null;
  amount: number;
  type: PaymentType;
  payment_method: PaymentMethod;
  notes?: string;
}

// Payload for PATCH /payments/:id (all fields optional)
export interface UpdatePaymentDTO {
  amount?: number;
  payment_method?: PaymentMethod;
  type?: PaymentType;
  installment_id?: string | null;
  notes?: string;
}

// Payment record as returned by the API
export interface Payment {
  id: string;
  rental_id: string;
  installment_id?: string | null;
  user_id: string;
  user_name?: string;
  amount: string | number;
  type: PaymentType;
  payment_method: PaymentMethod;
  paid_at: string;
  notes?: string | null;
  status: PaymentStatus;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  cancelled_by_name?: string | null;
  cancellation_reason?: string | null;
}

// Open installment (pending/partially paid/overdue) shown in the payment modal
export interface RentalInstallment {
  id: string;
  rental_id: string;
  number: number;
  total_installments: number;
  value: string | number;
  due_date: string;
  amount_paid: string | number;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  type?: 'installment' | 'penalty';
}

export const paymentService = {
  // POST /payments - Register a new payment
  create: async (data: CreatePaymentDTO) => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  // GET /payments/rental/:rentalId - Payment history of a rental
  getByRental: async (rentalId: string): Promise<Payment[]> => {
    const response = await api.get(`/payments/rental/${rentalId}`);
    return response.data.data || response.data;
  },

  // PATCH /payments/:id - Update a confirmed payment (admin/owner only)
  update: async (id: string, data: UpdatePaymentDTO) => {
    const response = await api.patch(`/payments/${id}`, data);
    return response.data;
  },

  // POST /payments/:id/cancel - Soft-cancel a payment with a reason (admin/owner only)
  cancel: async (id: string, reason: string) => {
    const response = await api.post(`/payments/${id}/cancel`, { reason });
    return response.data;
  },
};

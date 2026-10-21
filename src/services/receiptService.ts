import { api } from '@/lib/axios';

export type WhatsAppDeliveryStatus = 'sent' | 'failed';

// Receipt record as returned by the API
export interface Receipt {
  id: string;
  payment_id: string;
  amount: string | number;
  payment_method: string;
  issued_at: string;
  whatsapp_delivery_status: WhatsAppDeliveryStatus;
}

export interface IssueReceiptResponse {
  receiptId: string;
  whatsappDeliveryStatus: WhatsAppDeliveryStatus;
}

// POST /payments/:id/receipt - Issue a payment receipt (PDF, signature, WhatsApp delivery)
export async function issueReceipt(paymentId: string): Promise<IssueReceiptResponse> {
  const response = await api.post(`/payments/${paymentId}/receipt`);
  return response.data?.data || response.data;
}

// GET /payments/:id/receipts - List receipts issued for a payment
export async function getReceipts(paymentId: string): Promise<Receipt[]> {
  const response = await api.get(`/payments/${paymentId}/receipts`);
  return response.data?.data || response.data;
}

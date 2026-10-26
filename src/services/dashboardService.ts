import { api } from '@/lib/axios';

export type DashboardRentalStatus =
  | 'budget'
  | 'reserved'
  | 'picked_up'
  | 'returned'
  | 'late'
  | 'cancelled';

export type DashboardPaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'bank_transfer';

export type DashboardPeriod =
  | 'all'
  | 'current_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'current_year';

export interface DashboardComparison {
  previous_revenue: number | null;
  growth_percentage: number | null;
}

export interface DashboardReceivablesForecast {
  month: string;
  total: number;
  count: number;
}

export interface DashboardCollection {
  id: string;
  name: string;
  store_name: string;
  rentals: number;
  revenue: number;
}

export interface DashboardTransferRoute {
  from_store_id: string;
  from_store_name: string;
  to_store_id: string;
  to_store_name: string;
  count: number;
}

export interface DashboardTransferSummary {
  total: number;
  in_transit: number;
  completed: number;
  cancelled: number;
  routes: DashboardTransferRoute[];
}

export interface DashboardInventoryProduct {
  id: string;
  code: string;
  name: string;
  store_name: string;
  status: string;
  purchase_price: number;
  lifetime_revenue: number;
  roi_percentage: number | null;
  last_rental_at: string | null;
  days_without_rental: number;
  is_paid_off: boolean;
  is_stale: boolean;
}

export interface DashboardInventoryInsights {
  paid_off_count: number;
  paid_off_value: number;
  stale_count: number;
  stale_value: number;
  paid_off_products: DashboardInventoryProduct[];
  stale_products: DashboardInventoryProduct[];
}

export interface DashboardRentalStatusCount {
  status: DashboardRentalStatus;
  count: number;
}

export interface DashboardRevenueByMonth {
  month: string;
  revenue: number;
}

export interface DashboardPaymentMethodTotal {
  payment_method: DashboardPaymentMethod;
  count: number;
  total: number;
}

export interface DashboardTopProduct {
  id: string;
  code: string;
  name: string;
  store_name: string;
  rentals: number;
  revenue: number;
}

export interface DashboardRecentRental {
  id: string;
  status: DashboardRentalStatus;
  total_amount: number;
  start_date: string;
  end_date_scheduled: string;
  created_at: string;
  customer_name: string;
  store_name: string;
}

export interface DashboardUpcomingRental {
  id: string;
  status: Extract<DashboardRentalStatus, 'reserved' | 'picked_up' | 'late'>;
  total_amount: number;
  customer_name: string;
  event_type: 'pickup' | 'return';
  event_date: string;
}

export interface DashboardStorePerformance {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  is_active: boolean;
  total_rentals: number;
  active_rentals: number;
  revenue: number;
  contracted_value: number;
  average_ticket: number;
  total_products: number;
  active_products: number;
  occupied_products: number;
  occupancy_rate: number;
  items_rented: number;
  turnover_rate: number;
  total_customers: number;
}

export interface GeneralDashboardSummary {
  total_revenue: number;
  revenue_current_month: number;
  total_rentals: number;
  active_rentals: number;
  contracted_revenue: number;
  average_ticket: number;
  pending_receivables: number;
  overdue_receivables: number;
  overdue_installments: number;
  delinquency_rate: number;
  total_customers: number;
  total_products: number;
  total_stores: number;
  active_stores: number;
}

export interface GeneralDashboard {
  generated_at: string;
  period: DashboardPeriod;
  comparison: DashboardComparison;
  summary: GeneralDashboardSummary;
  rentals_by_status: DashboardRentalStatusCount[];
  revenue_by_month: DashboardRevenueByMonth[];
  payments_by_method: DashboardPaymentMethodTotal[];
  receivables_forecast: DashboardReceivablesForecast[];
  stores: DashboardStorePerformance[];
  top_products: DashboardTopProduct[];
  top_collections: DashboardCollection[];
  recent_rentals: DashboardRecentRental[];
  transfers: DashboardTransferSummary;
  inventory: DashboardInventoryInsights;
}

export interface LocalDashboardOperation {
  id: string;
  status: Extract<DashboardRentalStatus, 'reserved' | 'picked_up' | 'late' | 'returned'>;
  total_amount: number;
  customer_name: string;
  event_type: 'pickup' | 'return' | 'fitting';
  event_date: string;
}

export interface LocalDashboardAvailability {
  total: number;
  available: number;
  reserved: number;
  rented: number;
  laundry: number;
  maintenance: number;
  transferring: number;
  discarded: number;
  active: number;
  occupancy_rate: number;
}

export interface LocalDashboardReceivableItem {
  id: string;
  rental_id: string;
  number: number;
  total_installments: number;
  value: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  status: string;
  is_overdue: boolean;
  customer_id: string;
  customer_name: string;
  rental_status: DashboardRentalStatus;
  start_date: string;
  end_date_scheduled: string;
}

export interface LocalDashboardReceivables {
  overdue_total: number;
  overdue_count: number;
  pending_total: number;
  pending_count: number;
  items: LocalDashboardReceivableItem[];
}

export interface LocalDashboardTransfer {
  id: string;
  product_id: string;
  status: string;
  requested_at: string;
  from_store_id: string;
  to_store_id: string;
  product_name: string;
  product_code: string;
  from_store_name: string;
  to_store_name: string;
  requested_by_name: string | null;
  direction: 'incoming' | 'outgoing';
}

export interface LocalDashboardTransfers {
  in_transit_incoming: number;
  in_transit_outgoing: number;
  completed_in_period: number;
  incoming: LocalDashboardTransfer[];
  outgoing: LocalDashboardTransfer[];
}

export interface LocalDashboardMaintenanceItem {
  id: string;
  code: string;
  name: string;
  status: Extract<DashboardRentalStatus | 'laundry' | 'maintenance', 'laundry' | 'maintenance'>;
  updated_at: string;
}

export interface LocalDashboardMaintenance {
  total: number;
  laundry: number;
  maintenance: number;
  items: LocalDashboardMaintenanceItem[];
}

export interface LocalDashboardReceipts {
  total: number;
  count: number;
  by_method: DashboardPaymentMethodTotal[];
}

export interface LocalDashboardStore {
  id: string;
  name: string;
  cnpj: string | null;
  is_active: boolean;
  created_at: string;
  city: string | null;
  state: string | null;
}

export interface LocalDashboardSummary {
  total_revenue: number;
  revenue_current_month: number;
  total_rentals: number;
  active_rentals: number;
  contracted_revenue: number;
  average_ticket: number;
  late_rentals: number;
  pending_receivables: number;
  overdue_receivables: number;
  overdue_installments: number;
  delinquency_rate: number;
  total_customers: number;
  total_products: number;
  available_products: number;
  reserved_products: number;
  rented_products: number;
  laundry_products: number;
  maintenance_products: number;
  transferring_products: number;
  discarded_products: number;
  active_products: number;
  occupancy_rate: number;
}

export interface LocalDashboard {
  generated_at: string;
  period: DashboardPeriod;
  comparison: DashboardComparison;
  store: LocalDashboardStore;
  summary: LocalDashboardSummary;
  rentals_by_status: DashboardRentalStatusCount[];
  revenue_by_month: DashboardRevenueByMonth[];
  payments_by_method: DashboardPaymentMethodTotal[];
  top_products: DashboardTopProduct[];
  recent_rentals: DashboardRecentRental[];
  upcoming_rentals: DashboardUpcomingRental[];
  today_operations: LocalDashboardOperation[];
  week_operations: LocalDashboardOperation[];
  today_receipts: LocalDashboardReceipts;
  availability: LocalDashboardAvailability;
  receivables: LocalDashboardReceivables;
  transfers: LocalDashboardTransfers;
  maintenance: LocalDashboardMaintenance;
  monthly_goal?: number;
}

export const dashboardService = {
  getGeneralDashboard: async (period: DashboardPeriod = 'all'): Promise<GeneralDashboard> => {
    const response = await api.get('/dashboard/general', { params: { period } });
    return response.data?.data ?? response.data;
  },

  getLocalDashboard: async (
    storeId: string,
    period: DashboardPeriod = 'all',
  ): Promise<LocalDashboard> => {
    const response = await api.get(`/dashboard/local/${encodeURIComponent(storeId)}`, {
      params: { period },
    });
    return response.data?.data ?? response.data;
  },
};

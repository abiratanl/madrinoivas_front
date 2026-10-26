import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { dashboardService, type GeneralDashboard as GeneralDashboardData } from '@/services/dashboardService';
import GeneralDashboard from './GeneralDashboard';

vi.mock('@/services/dashboardService', () => ({
  dashboardService: {
    getGeneralDashboard: vi.fn(),
  },
}));

const dashboardData: GeneralDashboardData = {
  generated_at: '2026-10-26T12:00:00.000Z',
  period: 'all',
  comparison: {
    previous_revenue: 20000,
    growth_percentage: 25,
  },
  summary: {
    total_revenue: 25000,
    revenue_current_month: 5000,
    total_rentals: 10,
    active_rentals: 4,
    pending_receivables: 8000,
    overdue_receivables: 1200,
    overdue_installments: 2,
    delinquency_rate: 4.8,
    total_customers: 20,
    total_products: 40,
    total_stores: 2,
    active_stores: 2,
  },
  rentals_by_status: [],
  revenue_by_month: [],
  payments_by_method: [],
  stores: [
    {
      id: 'store-1',
      name: 'Loja Centro',
      city: 'Taubaté',
      state: 'SP',
      is_active: true,
      total_rentals: 6,
      active_rentals: 2,
      revenue: 16000,
      average_ticket: 2666.67,
      total_products: 25,
      active_products: 20,
      occupied_products: 8,
      occupancy_rate: 40,
      items_rented: 12,
      turnover_rate: 0.6,
      total_customers: 12,
    },
  ],
  top_products: [
    {
      id: 'product-1',
      code: 'VEST-001',
      name: 'Vestido Noiva Clássico',
      store_name: 'Loja Centro',
      rentals: 3,
      revenue: 9000,
    },
  ],
  top_collections: [
    {
      id: 'collection-1',
      name: 'Noivas Clássicas',
      store_name: 'Loja Centro',
      rentals: 4,
      revenue: 12000,
    },
  ],
  receivables_forecast: [
    { month: '2026-11', total: 3200, count: 4 },
    { month: '2026-12', total: 1800, count: 2 },
  ],
  transfers: {
    total: 3,
    in_transit: 1,
    completed: 2,
    cancelled: 0,
    routes: [
      {
        from_store_id: 'store-2',
        from_store_name: 'Loja Sul',
        to_store_id: 'store-1',
        to_store_name: 'Loja Centro',
        count: 1,
      },
    ],
  },
  inventory: {
    paid_off_count: 2,
    paid_off_value: 3000,
    stale_count: 1,
    stale_value: 800,
    paid_off_products: [
      {
        id: 'product-1',
        code: 'VEST-001',
        name: 'Vestido Noiva Clássico',
        store_name: 'Loja Centro',
        status: 'available',
        purchase_price: 1000,
        lifetime_revenue: 3500,
        roi_percentage: 350,
        last_rental_at: '2026-09-01T10:00:00.000Z',
        days_without_rental: 55,
        is_paid_off: true,
        is_stale: false,
      },
    ],
    stale_products: [
      {
        id: 'product-2',
        code: 'VEST-002',
        name: 'Vestido Festa Antigo',
        store_name: 'Loja Centro',
        status: 'available',
        purchase_price: 800,
        lifetime_revenue: 100,
        roi_percentage: 12.5,
        last_rental_at: null,
        days_without_rental: 180,
        is_paid_off: false,
        is_stale: true,
      },
    ],
  },
  recent_rentals: [],
};

const getGeneralDashboardMock = dashboardService.getGeneralDashboard as Mock;

describe('GeneralDashboard', () => {
  beforeEach(() => {
    getGeneralDashboardMock.mockResolvedValue(dashboardData);
  });

  it('renders the KPI cards and ranking tables', async () => {
    render(<GeneralDashboard />);

    expect(await screen.findByText('Dashboard Geral')).toBeInTheDocument();
    expect(await screen.findByText('Faturamento Total')).toBeInTheDocument();
    expect(screen.getByText('Ticket Médio')).toBeInTheDocument();
    expect(screen.getByText('Ranking de Faturamento')).toBeInTheDocument();
    expect(screen.getByText('Previsão de Recebíveis')).toBeInTheDocument();
    expect(screen.getByText('Top Coleções')).toBeInTheDocument();
    expect(screen.getByText('Transferências')).toBeInTheDocument();
    expect(screen.getByText('Saúde do Acervo')).toBeInTheDocument();
    expect(screen.getAllByText('Vestido Noiva Clássico').length).toBeGreaterThan(0);
    expect(screen.getByText('Noivas Clássicas')).toBeInTheDocument();
    expect(screen.getByText('Vestido Festa Antigo')).toBeInTheDocument();
  });

  it('refetches the dashboard when the period changes', async () => {
    render(<GeneralDashboard />);

    await waitFor(() => expect(getGeneralDashboardMock).toHaveBeenCalledWith('all'));

    fireEvent.click(screen.getByRole('button', { name: 'Este mês' }));

    await waitFor(() => expect(getGeneralDashboardMock).toHaveBeenCalledWith('current_month'));
  });
});

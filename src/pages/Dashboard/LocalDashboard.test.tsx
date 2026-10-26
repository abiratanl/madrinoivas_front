import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { dashboardService, type LocalDashboard as LocalDashboardData } from '@/services/dashboardService';
import LocalDashboard from './LocalDashboard';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Gerente',
      email: 'gerente@madri.com',
      role: 'local_manager',
      store_id: 'store-1',
    },
    selectedStore: {
      id: 'store-1',
      name: 'Loja Centro',
      address: null,
      address_id: null,
      city: 'Taubaté',
      state: 'SP',
      cnpj: null,
      is_active: true,
      created_at: '',
      updated_at: '',
      contacts: [],
    },
  }),
}));

vi.mock('@/services/dashboardService', () => ({
  dashboardService: {
    getLocalDashboard: vi.fn(),
  },
}));

const dashboardData: LocalDashboardData = {
  generated_at: '2026-10-26T12:00:00.000Z',
  period: 'all',
  comparison: {
    previous_revenue: 35000,
    growth_percentage: 20,
  },
  store: {
    id: 'store-1',
    name: 'Loja Centro',
    cnpj: '12.345.678/0001-90',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    city: 'Taubaté',
    state: 'SP',
  },
  summary: {
    total_revenue: 42000,
    revenue_current_month: 18500,
    total_rentals: 24,
    active_rentals: 6,
    contracted_revenue: 48000,
    average_ticket: 2000,
    late_rentals: 1,
    pending_receivables: 5600,
    overdue_receivables: 900,
    overdue_installments: 1,
    delinquency_rate: 16.07,
    total_customers: 18,
    total_products: 30,
    available_products: 20,
    reserved_products: 2,
    rented_products: 7,
    laundry_products: 1,
    maintenance_products: 0,
    transferring_products: 0,
    discarded_products: 0,
    active_products: 30,
    occupancy_rate: 30,
  },
  rentals_by_status: [
    { status: 'reserved', count: 5 },
    { status: 'picked_up', count: 7 },
    { status: 'returned', count: 10 },
    { status: 'late', count: 1 },
    { status: 'cancelled', count: 1 },
  ],
  revenue_by_month: [
    { month: '2026-08', revenue: 12000 },
    { month: '2026-09', revenue: 15000 },
    { month: '2026-10', revenue: 15000 },
  ],
  payments_by_method: [
    { payment_method: 'pix', count: 8, total: 24000 },
    { payment_method: 'credit_card', count: 5, total: 15000 },
    { payment_method: 'cash', count: 2, total: 3000 },
  ],
  top_products: [],
  recent_rentals: [],
  upcoming_rentals: [],
  today_receipts: {
    total: 500,
    count: 4,
    by_method: [
      { payment_method: 'pix', count: 1, total: 200 },
      { payment_method: 'credit_card', count: 1, total: 150 },
      { payment_method: 'cash', count: 1, total: 100 },
      { payment_method: 'debit_card', count: 1, total: 50 },
    ],
  },
  today_operations: [
    {
      id: 'rental-1',
      status: 'reserved',
      total_amount: 1500,
      customer_name: 'Maria Silva',
      event_type: 'pickup',
      event_date: '2026-10-26T10:00:00.000Z',
    },
    {
      id: 'rental-2',
      status: 'late',
      total_amount: 900,
      customer_name: 'Ana Souza',
      event_type: 'return',
      event_date: '2026-10-26T17:00:00.000Z',
    },
  ],
  week_operations: [
    {
      id: 'rental-3',
      status: 'reserved',
      total_amount: 2200,
      customer_name: 'Julia Lima',
      event_type: 'fitting',
      event_date: '2026-10-27T14:00:00.000Z',
    },
    {
      id: 'rental-4',
      status: 'reserved',
      total_amount: 1800,
      customer_name: 'Carla Dias',
      event_type: 'pickup',
      event_date: '2026-10-28T10:00:00.000Z',
    },
  ],
  availability: {
    total: 30,
    available: 20,
    reserved: 2,
    rented: 7,
    laundry: 1,
    maintenance: 0,
    transferring: 0,
    discarded: 0,
    active: 30,
    occupancy_rate: 30,
  },
  receivables: {
    overdue_total: 900,
    overdue_count: 1,
    pending_total: 4700,
    pending_count: 3,
    items: [
      {
        id: 'installment-1',
        rental_id: 'rental-2',
        number: 1,
        total_installments: 2,
        value: 900,
        amount_paid: 0,
        balance: 900,
        due_date: '2026-10-20',
        status: 'pending',
        is_overdue: true,
        customer_id: 'customer-1',
        customer_name: 'Ana Souza',
        rental_status: 'late',
        start_date: '2026-10-15T10:00:00.000Z',
        end_date_scheduled: '2026-10-25T10:00:00.000Z',
      },
    ],
  },
  transfers: {
    in_transit_incoming: 1,
    in_transit_outgoing: 0,
    completed_in_period: 2,
    incoming: [
      {
        id: 'transfer-1',
        product_id: 'product-1',
        status: 'active',
        requested_at: '2026-10-25T10:00:00.000Z',
        from_store_id: 'store-2',
        to_store_id: 'store-1',
        product_name: 'Vestido Noiva Clássico',
        product_code: 'VEST-001',
        from_store_name: 'Loja Sul',
        to_store_name: 'Loja Centro',
        requested_by_name: 'Gerente Sul',
        direction: 'incoming',
      },
    ],
    outgoing: [],
  },
  maintenance: {
    total: 1,
    laundry: 1,
    maintenance: 0,
    items: [
      {
        id: 'product-3',
        code: 'VEST-003',
        name: 'Vestido Festa Rosa',
        status: 'laundry',
        updated_at: '2026-10-24T10:00:00.000Z',
      },
    ],
  },
};

const getLocalDashboardMock = dashboardService.getLocalDashboard as Mock;

describe('LocalDashboard', () => {
  beforeEach(() => {
    getLocalDashboardMock.mockResolvedValue(dashboardData);
  });

  it('renders the store revenue, receipts and today operations', async () => {
    render(<LocalDashboard />);

    expect(await screen.findByText('Dashboard da Loja')).toBeInTheDocument();
    expect(screen.getByText('Faturamento da loja')).toBeInTheDocument();
    expect(screen.getByText('Recebimentos de hoje')).toBeInTheDocument();
    expect(screen.getAllByText('Pix').length).toBeGreaterThan(0);
    expect(screen.getByText('Cartão')).toBeInTheDocument();
    expect(screen.getAllByText('Dinheiro').length).toBeGreaterThan(0);
    expect(screen.getByText('Evolução da Loja')).toBeInTheDocument();
    expect(screen.getByText('Formas de Pagamento')).toBeInTheDocument();
    expect(screen.getByText('Status dos Aluguéis')).toBeInTheDocument();
    expect(screen.getByText('Operações de hoje')).toBeInTheDocument();
    expect(screen.getByText('Retiradas')).toBeInTheDocument();
    expect(screen.getByText('Devoluções')).toBeInTheDocument();
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getAllByText('Ana Souza').length).toBeGreaterThan(0);
    expect(screen.getByText('Aguardando')).toBeInTheDocument();
    expect(screen.getByText('Atrasado')).toBeInTheDocument();
    expect(screen.getByText('Próximos 7 dias')).toBeInTheDocument();
    expect(screen.getByText('Julia Lima')).toBeInTheDocument();
    expect(screen.getByText('Disponibilidade do Acervo')).toBeInTheDocument();
    expect(screen.getByText('Cobranças')).toBeInTheDocument();
    expect(screen.getByText('Transferências')).toBeInTheDocument();
    expect(screen.getByText('Lavanderia e Manutenção')).toBeInTheDocument();
    expect(screen.getByText('Vestido Festa Rosa')).toBeInTheDocument();
    expect(getLocalDashboardMock).toHaveBeenCalledWith('store-1', 'all');
  });

  it('refetches the local dashboard when the period changes', async () => {
    render(<LocalDashboard />);

    await waitFor(() => expect(getLocalDashboardMock).toHaveBeenCalledWith('store-1', 'all'));

    fireEvent.click(screen.getByRole('button', { name: 'Este mês' }));

    await waitFor(() =>
      expect(getLocalDashboardMock).toHaveBeenCalledWith('store-1', 'current_month'),
    );
  });
});

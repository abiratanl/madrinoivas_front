import { describe, expect, it } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import type { DashboardComparison, GeneralDashboardSummary } from '@/services/dashboardService';
import { KpiCards } from './KpiCards';

const summary: GeneralDashboardSummary = {
  total_revenue: 25000.5,
  revenue_current_month: 5000,
  total_rentals: 10,
  active_rentals: 4,
  contracted_revenue: 30000,
  average_ticket: 2500,
  pending_receivables: 8000,
  overdue_receivables: 1200,
  overdue_installments: 2,
  delinquency_rate: 15.5,
  total_customers: 20,
  total_products: 40,
  total_stores: 3,
  active_stores: 2,
};

const renderCards = (comparison: DashboardComparison) =>
  render(<KpiCards summary={summary} comparison={comparison} />);

describe('KpiCards', () => {
  it('renders the formatted values and growth hint', () => {
    renderCards({ previous_revenue: 20000, growth_percentage: 25.5 });

    expect(screen.getByText('R$ 25.000,50')).toBeInTheDocument();
    expect(screen.getByText('R$ 2.500,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 8.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.200,00')).toBeInTheDocument();
    expect(
      screen.getByText('10 aluguéis criados • +25.5% vs período anterior'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('15.5% da carteira em aberto • 2 parcela(s) vencida(s)'),
    ).toBeInTheDocument();
  });

  it('explains when there is no comparison base', () => {
    renderCards({ previous_revenue: null, growth_percentage: null });

    expect(
      screen.getByText('10 aluguéis criados • Sem base de comparação no período anterior'),
    ).toBeInTheDocument();
  });

  it('renders negative growth without a duplicated sign', () => {
    renderCards({ previous_revenue: 20000, growth_percentage: -10 });

    expect(
      screen.getByText('10 aluguéis criados • -10.0% vs período anterior'),
    ).toBeInTheDocument();
  });
});

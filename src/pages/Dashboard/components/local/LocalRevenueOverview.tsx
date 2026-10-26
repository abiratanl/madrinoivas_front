import { ArrowDownRight, ArrowUpRight, Target, Wallet } from 'lucide-react';
import type { DashboardComparison, LocalDashboardSummary } from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import { formatCurrency, formatNumber, formatPercent } from '../../dashboardUtils';

interface LocalRevenueOverviewProps {
  summary: LocalDashboardSummary;
  comparison: DashboardComparison;
  monthlyGoal: number;
}

export function LocalRevenueOverview({
  summary,
  comparison,
  monthlyGoal,
}: LocalRevenueOverviewProps) {
  const monthRevenue = summary.revenue_current_month;
  const progress = monthlyGoal > 0 ? (monthRevenue / monthlyGoal) * 100 : 0;
  const remaining = Math.max(monthlyGoal - monthRevenue, 0);
  const goalReached = monthlyGoal > 0 && monthRevenue >= monthlyGoal;
  const growth = comparison.growth_percentage;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-50/80" />

      <div className="relative">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Faturamento da loja</h2>
              <p className="text-xs text-gray-500">Receita confirmada no mês atual</p>
            </div>
          </div>

          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide',
              goalReached
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
            )}
          >
            <Target className="h-3 w-3" />
            {goalReached ? 'Meta atingida' : 'Em andamento'}
          </span>
        </header>

        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Faturamento do mês
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            {formatCurrency(monthRevenue)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Meta mensal de {formatCurrency(monthlyGoal)}</span>
            {goalReached && (
              <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                meta alcançada
              </span>
            )}
            {growth !== null && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  growth >= 0 ? 'text-emerald-600' : 'text-red-600',
                )}
              >
                {growth >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {growth >= 0 ? '+' : ''}
                {formatPercent(growth)} vs período anterior
              </span>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700">{progress.toFixed(1)}% da meta</span>
            <span className="text-gray-500">
              {goalReached ? 'Objetivo concluído' : `Faltam ${formatCurrency(remaining)}`}
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                goalReached
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500',
              )}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              No período
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {formatCurrency(summary.total_revenue)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Aluguéis ativos
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {formatNumber(summary.active_rentals)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Recebíveis
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {formatCurrency(summary.pending_receivables)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Inadimplência
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {formatPercent(summary.delinquency_rate)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

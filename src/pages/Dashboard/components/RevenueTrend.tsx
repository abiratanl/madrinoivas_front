import { TrendingUp } from 'lucide-react';
import type { DashboardRevenueByMonth } from '@/services/dashboardService';
import { formatCurrency, formatMonthShort, formatNumber } from '../dashboardUtils';

interface RevenueTrendProps {
  data: DashboardRevenueByMonth[];
  title?: string;
  description?: string;
}

export function RevenueTrend({
  data,
  title = 'Evolução do Faturamento',
  description = 'Receita confirmada mês a mês',
}: RevenueTrendProps) {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 0);
  const average = data.length > 0 ? total / data.length : 0;
  const bestMonth = data.reduce<DashboardRevenueByMonth | null>(
    (best, item) => (!best || item.revenue > best.revenue ? item : best),
    null,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            Média {formatCurrency(average)}
          </span>
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700">
            {formatCurrency(total)} no total
          </span>
        </div>
      </header>

      {data.length === 0 || total === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-gray-500">
          Nenhuma receita confirmada no período selecionado.
        </div>
      ) : (
        <div className="px-5 pb-5 pt-6">
          <div className="flex h-48 items-end gap-1.5 sm:gap-2">
            {data.map((item) => {
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

              return (
                <div
                  key={item.month}
                  className="group flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
                >
                  <div className="flex flex-1 items-end justify-center">
                    <div
                      className="relative w-full max-w-12 rounded-t-lg bg-gradient-to-t from-rose-600 to-pink-400 transition-all duration-300 group-hover:from-rose-700 group-hover:to-pink-500"
                      style={{ height: item.revenue > 0 ? `${Math.max(height, 2)}%` : '0%' }}
                      title={`${formatMonthShort(item.month)}: ${formatCurrency(item.revenue)}`}
                    >
                      <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                  <span className="truncate text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]">
                    {formatMonthShort(item.month)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-[11px]">
            <span className="text-gray-500">
              Melhor mês:{' '}
              <strong className="font-bold text-gray-900">
                {bestMonth ? formatMonthShort(bestMonth.month) : '-'}
              </strong>
              {bestMonth && ` • ${formatCurrency(bestMonth.revenue)}`}
            </span>
            <span className="text-gray-400">
              {formatNumber(data.length)} meses analisados
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

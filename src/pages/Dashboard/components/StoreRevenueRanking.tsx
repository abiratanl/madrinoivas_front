import { Building2, MapPin } from 'lucide-react';
import type { DashboardStorePerformance } from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import { formatCurrency, formatNumber, formatPercent } from '../dashboardUtils';

const RANK_STYLES = [
  'bg-amber-100 text-amber-700 ring-amber-200',
  'bg-slate-100 text-slate-600 ring-slate-200',
  'bg-orange-100 text-orange-700 ring-orange-200',
];

interface StoreRevenueRankingProps {
  stores: DashboardStorePerformance[];
}

export function StoreRevenueRanking({ stores }: StoreRevenueRankingProps) {
  const sortedStores = stores
    .filter((store) => store.is_active)
    .sort(
    (a, b) =>
      b.revenue - a.revenue ||
      b.total_rentals - a.total_rentals ||
      a.name.localeCompare(b.name),
  );
  const maxRevenue = sortedStores[0]?.revenue || 0;
  const totalRevenue = sortedStores.reduce((sum, store) => sum + store.revenue, 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Ranking de Faturamento</h2>
            <p className="text-xs text-gray-500">Receita confirmada por loja ativa</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {formatNumber(sortedStores.length)} lojas
        </span>
      </header>

      {sortedStores.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500">
          Nenhuma loja ativa encontrada para o período selecionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-gray-500">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">#</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Loja</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                  Aluguéis
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                  Ocupação
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                  Faturamento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedStores.map((store, index) => {
                const share = maxRevenue > 0 ? (store.revenue / maxRevenue) * 100 : 0;

                return (
                  <tr key={store.id} className="transition-colors hover:bg-rose-50/30">
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1',
                          RANK_STYLES[index] || 'bg-gray-50 text-gray-500 ring-gray-100',
                        )}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{store.name}</p>
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            store.is_active ? 'bg-emerald-500' : 'bg-gray-300',
                          )}
                          title={store.is_active ? 'Loja ativa' : 'Loja inativa'}
                        />
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {[store.city, store.state].filter(Boolean).join(' - ') || 'Local não informado'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-gray-600">
                      {formatNumber(store.total_rentals)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-gray-600">
                      {formatCurrency(store.average_ticket)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatPercent(store.occupancy_rate)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        giro {store.turnover_rate.toFixed(1)}x
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(store.revenue)}</p>
                      <div className="ml-auto mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-rose-500"
                          style={{ width: `${Math.min(share, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <footer className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-5 py-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Total no período
        </span>
        <span className="text-sm font-bold text-gray-900">{formatCurrency(totalRevenue)}</span>
      </footer>
    </section>
  );
}

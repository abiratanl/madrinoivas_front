import { Layers3 } from 'lucide-react';
import type { DashboardCollection } from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import { formatCurrency, formatNumber } from '../dashboardUtils';

const RANK_STYLES = [
  'bg-amber-100 text-amber-700 ring-amber-200',
  'bg-slate-100 text-slate-600 ring-slate-200',
  'bg-orange-100 text-orange-700 ring-orange-200',
];

interface TopCollectionsProps {
  collections: DashboardCollection[];
}

export function TopCollections({ collections }: TopCollectionsProps) {
  const sortedCollections = [...collections].sort(
    (a, b) => b.rentals - a.rentals || b.revenue - a.revenue || a.name.localeCompare(b.name),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Top Coleções</h2>
            <p className="text-xs text-gray-500">Coleções com maior saída no período</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          Top 5
        </span>
      </header>

      {sortedCollections.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500">
          Nenhuma coleção alugada no período selecionado.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {sortedCollections.map((collection, index) => (
            <div
              key={`${collection.id}-${collection.store_name}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-indigo-50/20"
            >
              <span
                className={cn(
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
                  RANK_STYLES[index] || 'bg-gray-50 text-gray-500 ring-gray-100',
                )}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{collection.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">{collection.store_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(collection.revenue)}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {formatNumber(collection.rentals)} peça(s)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

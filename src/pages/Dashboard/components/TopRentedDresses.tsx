import { Shirt, Trophy } from 'lucide-react';
import type { DashboardTopProduct } from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import { formatCurrency, formatNumber } from '../dashboardUtils';

const RANK_STYLES = [
  'bg-amber-100 text-amber-700 ring-amber-200',
  'bg-slate-100 text-slate-600 ring-slate-200',
  'bg-orange-100 text-orange-700 ring-orange-200',
];

interface TopRentedDressesProps {
  products: DashboardTopProduct[];
}

export function TopRentedDresses({ products }: TopRentedDressesProps) {
  const sortedProducts = [...products].sort(
    (a, b) => b.rentals - a.rentals || b.revenue - a.revenue || a.name.localeCompare(b.name),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Top Vestidos</h2>
            <p className="text-xs text-gray-500">Mais alugados no período</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          Top 5
        </span>
      </header>

      {sortedProducts.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500">
          Nenhum vestido alugado no período selecionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-gray-500">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">#</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Vestido</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Loja</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                  Aluguéis
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                  Faturamento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedProducts.map((product, index) => (
                <tr key={product.id} className="transition-colors hover:bg-rose-50/30">
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
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                        <Shirt className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          {product.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{product.store_name}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex min-w-8 justify-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                      {formatNumber(product.rentals)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-bold text-gray-900">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

import { BadgeDollarSign, PackageX, Shirt } from 'lucide-react';
import type { DashboardInventoryInsights } from '@/services/dashboardService';
import { formatCurrency, formatNumber, formatPercent } from '../dashboardUtils';

interface InventoryInsightsProps {
  inventory: DashboardInventoryInsights;
}

export function InventoryInsights({ inventory }: InventoryInsightsProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <BadgeDollarSign className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Saúde do Acervo</h2>
          <p className="text-xs text-gray-500">Retorno do investimento e peças paradas</p>
        </div>
      </header>

      <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Peças pagas
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {formatNumber(inventory.paid_off_count)}
            </span>
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {formatCurrency(inventory.paid_off_value)}
          </p>
          <p className="text-[11px] text-gray-500">Investimento já recuperado em aluguéis</p>

          <div className="mt-4 space-y-2.5">
            {inventory.paid_off_products.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma peça totalmente paga.</p>
            ) : (
              inventory.paid_off_products.map((product) => (
                <div key={product.id} className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Shirt className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">{product.name}</p>
                    <p className="truncate text-[10px] text-gray-400">{product.store_name}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-emerald-600">
                    {product.roi_percentage === null
                      ? '—'
                      : formatPercent(product.roi_percentage)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Peças encalhadas
            </p>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              {formatNumber(inventory.stale_count)}
            </span>
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {formatCurrency(inventory.stale_value)}
          </p>
          <p className="text-[11px] text-gray-500">Disponíveis sem aluguel há mais de 90 dias</p>

          <div className="mt-4 space-y-2.5">
            {inventory.stale_products.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma peça encalhada.</p>
            ) : (
              inventory.stale_products.map((product) => (
                <div key={product.id} className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <PackageX className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">{product.name}</p>
                    <p className="truncate text-[10px] text-gray-400">{product.store_name}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-amber-600">
                    {formatNumber(product.days_without_rental)}d
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

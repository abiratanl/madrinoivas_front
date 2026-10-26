import { ArrowLeftRight, CheckCircle2, Truck, XCircle } from 'lucide-react';
import type { DashboardTransferSummary } from '@/services/dashboardService';
import { formatNumber } from '../dashboardUtils';

interface TransfersOverviewProps {
  transfers: DashboardTransferSummary;
}

export function TransfersOverview({ transfers }: TransfersOverviewProps) {
  const stats = [
    {
      label: 'Em trânsito',
      value: transfers.in_transit,
      icon: Truck,
      className: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Concluídas',
      value: transfers.completed,
      icon: CheckCircle2,
      className: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Canceladas',
      value: transfers.cancelled,
      icon: XCircle,
      className: 'bg-gray-100 text-gray-500',
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Transferências</h2>
            <p className="text-xs text-gray-500">Movimentação de peças entre lojas</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {formatNumber(transfers.total)} no período
        </span>
      </header>

      <div className="grid grid-cols-3 gap-3 px-5 py-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.className}`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-xl font-bold text-gray-900">{formatNumber(stat.value)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Rotas mais movimentadas
        </p>
        {transfers.routes.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Nenhuma rota registrada no período.</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {transfers.routes.map((route) => (
              <div
                key={`${route.from_store_id}-${route.to_store_id}`}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <p className="min-w-0 truncate text-gray-600">
                  {route.from_store_name}
                  <span className="mx-1.5 text-gray-300">→</span>
                  <span className="font-semibold text-gray-900">{route.to_store_name}</span>
                </p>
                <span className="shrink-0 rounded-full bg-gray-50 px-2 py-0.5 font-bold text-gray-500">
                  {formatNumber(route.count)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

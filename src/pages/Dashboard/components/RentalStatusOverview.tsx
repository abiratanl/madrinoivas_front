import { PieChart } from 'lucide-react';
import type {
  DashboardRentalStatus,
  DashboardRentalStatusCount,
} from '@/services/dashboardService';
import { formatNumber, formatPercent } from '../dashboardUtils';

const STATUS_META: Record<
  DashboardRentalStatus,
  { label: string; barClassName: string; dotClassName: string; textClassName: string }
> = {
  budget: {
    label: 'Orçamentos',
    barClassName: 'bg-slate-300',
    dotClassName: 'bg-slate-300',
    textClassName: 'text-slate-600',
  },
  reserved: {
    label: 'Reservados',
    barClassName: 'bg-amber-400',
    dotClassName: 'bg-amber-400',
    textClassName: 'text-amber-700',
  },
  picked_up: {
    label: 'Retirados',
    barClassName: 'bg-rose-500',
    dotClassName: 'bg-rose-500',
    textClassName: 'text-rose-700',
  },
  returned: {
    label: 'Devolvidos',
    barClassName: 'bg-emerald-500',
    dotClassName: 'bg-emerald-500',
    textClassName: 'text-emerald-700',
  },
  late: {
    label: 'Atrasados',
    barClassName: 'bg-red-600',
    dotClassName: 'bg-red-600',
    textClassName: 'text-red-700',
  },
  cancelled: {
    label: 'Cancelados',
    barClassName: 'bg-gray-300',
    dotClassName: 'bg-gray-300',
    textClassName: 'text-gray-500',
  },
};

interface RentalStatusOverviewProps {
  statuses: DashboardRentalStatusCount[];
  title?: string;
  description?: string;
}

export function RentalStatusOverview({
  statuses,
  title = 'Status dos Aluguéis',
  description = 'Distribuição operacional no período',
}: RentalStatusOverviewProps) {
  const total = statuses.reduce((sum, status) => sum + status.count, 0);
  const items = statuses
    .filter((status) => status.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {formatNumber(total)} aluguéis
        </span>
      </header>

      {total === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-gray-500">
          Nenhum aluguel encontrado no período selecionado.
        </div>
      ) : (
        <div className="p-5">
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
            {items.map((status) => (
              <div
                key={status.status}
                className={STATUS_META[status.status].barClassName}
                style={{ width: `${(status.count / total) * 100}%` }}
                title={`${STATUS_META[status.status].label}: ${formatNumber(status.count)}`}
              />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {statuses.map((status) => {
              const meta = STATUS_META[status.status];
              const share = total > 0 ? (status.count / total) * 100 : 0;

              return (
                <div
                  key={status.status}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dotClassName}`} />
                    <span className="truncate text-xs font-semibold text-gray-600">
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {formatNumber(status.count)}
                    </span>
                    <span className={`text-[10px] font-bold ${meta.textClassName}`}>
                      {formatPercent(share, 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

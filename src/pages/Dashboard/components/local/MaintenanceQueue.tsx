import { WashingMachine, Wrench } from 'lucide-react';
import type { LocalDashboardMaintenance } from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import { formatDate, formatNumber } from '../../dashboardUtils';

interface MaintenanceQueueProps {
  maintenance: LocalDashboardMaintenance;
}

export function MaintenanceQueue({ maintenance }: MaintenanceQueueProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Lavanderia e Manutenção</h2>
            <p className="text-xs text-gray-500">Peças fora do acervo disponível</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {formatNumber(maintenance.total)} peça(s)
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-sky-50/60 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm">
            <WashingMachine className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{formatNumber(maintenance.laundry)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Lavanderia</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-orange-50/60 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-orange-600 shadow-sm">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formatNumber(maintenance.maintenance)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-orange-700">
              Manutenção
            </p>
          </div>
        </div>
      </div>

      {maintenance.items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500">
          Nenhuma peça em lavanderia ou manutenção.
        </div>
      ) : (
        <div className="max-h-72 divide-y divide-gray-100 overflow-y-auto">
          {maintenance.items.map((item) => {
            const isLaundry = item.status === 'laundry';

            return (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    isLaundry ? 'bg-sky-50 text-sky-600' : 'bg-orange-50 text-orange-600',
                  )}
                >
                  {isLaundry ? (
                    <WashingMachine className="h-4 w-4" />
                  ) : (
                    <Wrench className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">
                    {item.code} • desde {formatDate(item.updated_at)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                    isLaundry
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-orange-50 text-orange-700',
                  )}
                >
                  {isLaundry ? 'Lavanderia' : 'Manutenção'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

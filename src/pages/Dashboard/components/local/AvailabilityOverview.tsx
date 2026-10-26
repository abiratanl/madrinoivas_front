import { PackageCheck, Shirt } from 'lucide-react';
import type { LocalDashboardAvailability } from '@/services/dashboardService';
import { formatNumber, formatPercent } from '../../dashboardUtils';

interface AvailabilityOverviewProps {
  availability: LocalDashboardAvailability;
}

const STATUS_ITEMS: Array<{
  key: keyof Pick<
    LocalDashboardAvailability,
    'available' | 'reserved' | 'rented' | 'laundry' | 'maintenance' | 'transferring'
  >;
  label: string;
  className: string;
}> = [
  { key: 'available', label: 'Disponíveis', className: 'bg-emerald-50 text-emerald-700' },
  { key: 'reserved', label: 'Reservados', className: 'bg-amber-50 text-amber-700' },
  { key: 'rented', label: 'Alugados', className: 'bg-rose-50 text-rose-700' },
  { key: 'laundry', label: 'Lavanderia', className: 'bg-sky-50 text-sky-700' },
  { key: 'maintenance', label: 'Manutenção', className: 'bg-orange-50 text-orange-700' },
  { key: 'transferring', label: 'Transferindo', className: 'bg-violet-50 text-violet-700' },
];

export function AvailabilityOverview({ availability }: AvailabilityOverviewProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Disponibilidade do Acervo</h2>
            <p className="text-xs text-gray-500">Situação atual das peças da loja</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {formatNumber(availability.active)} ativas
        </span>
      </header>

      <div className="p-5">
        <div className="flex items-center gap-4 rounded-xl bg-gray-50/60 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
            <Shirt className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-gray-700">Taxa de ocupação</p>
              <p className="text-sm font-bold text-gray-900">
                {formatPercent(availability.occupancy_rate)}
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                style={{ width: `${Math.min(Math.max(availability.occupancy_rate, 0), 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-gray-500">
              {formatNumber(availability.reserved + availability.rented)} peças reservadas ou alugadas
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {STATUS_ITEMS.map((status) => (
            <div key={status.key} className="rounded-xl border border-gray-100 p-3">
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(availability[status.key])}
              </p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { LocalDashboardOperation } from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import {
  formatCurrency,
  formatNumber,
  formatShortDate,
  formatTime,
  formatWeekday,
} from '../../dashboardUtils';

const EVENT_META: Record<
  LocalDashboardOperation['event_type'],
  { label: string; icon: LucideIcon; iconClassName: string; badgeClassName: string }
> = {
  pickup: {
    label: 'Retirada',
    icon: ArrowUpFromLine,
    iconClassName: 'bg-rose-50 text-rose-600',
    badgeClassName: 'bg-rose-50 text-rose-700 ring-rose-100',
  },
  return: {
    label: 'Devolução',
    icon: ArrowDownToLine,
    iconClassName: 'bg-sky-50 text-sky-600',
    badgeClassName: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
  fitting: {
    label: 'Prova',
    icon: Sparkles,
    iconClassName: 'bg-violet-50 text-violet-600',
    badgeClassName: 'bg-violet-50 text-violet-700 ring-violet-100',
  },
};

const getDateKey = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
};

interface WeeklyAgendaProps {
  operations: LocalDashboardOperation[];
}

export function WeeklyAgenda({ operations }: WeeklyAgendaProps) {
  const sortedOperations = [...operations].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
  );

  const days = sortedOperations.reduce<
    Array<{ key: string; date: string; operations: LocalDashboardOperation[] }>
  >((groups, operation) => {
    const key = getDateKey(operation.event_date);
    const current = groups[groups.length - 1];

    if (current?.key === key) {
      current.operations.push(operation);
      return groups;
    }

    groups.push({ key, date: operation.event_date, operations: [operation] });
    return groups;
  }, []);

  const totals = {
    pickup: operations.filter((operation) => operation.event_type === 'pickup').length,
    return: operations.filter((operation) => operation.event_type === 'return').length,
    fitting: operations.filter((operation) => operation.event_type === 'fitting').length,
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Próximos 7 dias</h2>
            <p className="text-xs text-gray-500">Retiradas, devoluções e provas agendadas</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wide">
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
            {formatNumber(totals.pickup)} retiradas
          </span>
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
            {formatNumber(totals.return)} devoluções
          </span>
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-700">
            {formatNumber(totals.fitting)} provas
          </span>
        </div>
      </header>

      {days.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50/40 px-4 py-10 text-center text-sm text-gray-500">
          Nenhuma operação agendada para os próximos 7 dias.
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {days.map((day) => (
            <div key={day.key} className="grid grid-cols-[68px_1fr] gap-4">
              <div className="pt-1 text-center">
                <p className="text-lg font-bold text-gray-900">{formatShortDate(day.date)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  {formatWeekday(day.date)}
                </p>
              </div>
              <div className="space-y-2 border-l border-gray-100 pl-4">
                {day.operations.map((operation) => {
                  const meta = EVENT_META[operation.event_type];
                  const Icon = meta.icon;

                  return (
                    <article
                      key={`${operation.event_type}-${operation.id}-${operation.event_date}`}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/30 px-3 py-2.5"
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          meta.iconClassName,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {operation.customer_name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {formatTime(operation.event_date)} •{' '}
                          {formatCurrency(operation.total_amount)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1',
                          meta.badgeClassName,
                        )}
                      >
                        {meta.label}
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

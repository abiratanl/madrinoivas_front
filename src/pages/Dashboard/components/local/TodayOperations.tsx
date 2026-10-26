import { ArrowDownToLine, ArrowUpFromLine, CalendarCheck2 } from 'lucide-react';
import type { LocalDashboardOperation } from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import { formatCurrency, formatNumber, formatTime, formatToday } from '../../dashboardUtils';

interface StatusMeta {
  label: string;
  className: string;
  dotClassName: string;
}

const getStatusMeta = (operation: LocalDashboardOperation): StatusMeta => {
  if (operation.event_type === 'pickup') {
    if (operation.status === 'picked_up') {
      return {
        label: 'Retirado',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        dotClassName: 'bg-emerald-500',
      };
    }

    if (operation.status === 'late') {
      return {
        label: 'Atrasado',
        className: 'bg-red-50 text-red-700 ring-red-100',
        dotClassName: 'bg-red-500',
      };
    }

    if (operation.status === 'returned') {
      return {
        label: 'Concluído',
        className: 'bg-gray-100 text-gray-600 ring-gray-200',
        dotClassName: 'bg-gray-400',
      };
    }

    return {
      label: 'Aguardando',
      className: 'bg-amber-50 text-amber-700 ring-amber-100',
      dotClassName: 'bg-amber-500',
    };
  }

  if (operation.status === 'returned') {
    return {
      label: 'Devolvido',
      className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      dotClassName: 'bg-emerald-500',
    };
  }

  if (operation.status === 'late') {
    return {
      label: 'Atrasado',
      className: 'bg-red-50 text-red-700 ring-red-100',
      dotClassName: 'bg-red-500',
    };
  }

  return {
    label: 'Pendente',
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
    dotClassName: 'bg-amber-500',
  };
};

interface OperationCardProps {
  operation: LocalDashboardOperation;
}

function OperationCard({ operation }: OperationCardProps) {
  const status = getStatusMeta(operation);

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{operation.customer_name}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {formatTime(operation.event_date)} • {formatCurrency(operation.total_amount)}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1',
            status.className,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', status.dotClassName)} />
          {status.label}
        </span>
      </div>
    </article>
  );
}

interface OperationColumnProps {
  title: string;
  description: string;
  operations: LocalDashboardOperation[];
  icon: typeof ArrowUpFromLine;
  emptyMessage: string;
  tone: string;
}

function OperationColumn({
  title,
  description,
  operations,
  icon: Icon,
  emptyMessage,
  tone,
}: OperationColumnProps) {
  return (
    <section className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', tone)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-[11px] text-gray-500">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-gray-600 ring-1 ring-gray-100">
          {formatNumber(operations.length)}
        </span>
      </header>

      <div className="mt-4 space-y-3">
        {operations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-xs text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          operations.map((operation) => (
            <OperationCard
              key={`${operation.event_type}-${operation.id}`}
              operation={operation}
            />
          ))
        )}
      </div>
    </section>
  );
}

interface TodayOperationsProps {
  operations: LocalDashboardOperation[];
}

export function TodayOperations({ operations }: TodayOperationsProps) {
  const pickups = operations.filter((operation) => operation.event_type === 'pickup');
  const returns = operations.filter((operation) => operation.event_type === 'return');

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <CalendarCheck2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Operações de hoje</h2>
            <p className="text-xs capitalize text-gray-500">{formatToday()}</p>
          </div>
        </div>
        <span className="w-fit rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {formatNumber(operations.length)} operações
        </span>
      </header>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OperationColumn
          title="Retiradas"
          description="Vestidos que saem da loja hoje"
          operations={pickups}
          icon={ArrowUpFromLine}
          emptyMessage="Nenhuma retirada prevista para hoje."
          tone="bg-rose-50 text-rose-600"
        />
        <OperationColumn
          title="Devoluções"
          description="Vestidos com retorno previsto hoje"
          operations={returns}
          icon={ArrowDownToLine}
          emptyMessage="Nenhuma devolução prevista para hoje."
          tone="bg-sky-50 text-sky-600"
        />
      </div>
    </section>
  );
}

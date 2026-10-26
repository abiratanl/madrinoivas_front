import { AlertTriangle, ReceiptText } from 'lucide-react';
import type { LocalDashboardReceivables } from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import { formatCurrency, formatDate, formatNumber } from '../../dashboardUtils';

interface LocalReceivablesProps {
  receivables: LocalDashboardReceivables;
}

export function LocalReceivables({ receivables }: LocalReceivablesProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Cobranças</h2>
            <p className="text-xs text-gray-500">Parcelas em aberto da loja</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {formatNumber(receivables.overdue_count + receivables.pending_count)} parcelas
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 border-b border-gray-100 px-5 py-4">
        <div className="rounded-xl bg-red-50/60 p-3">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
            <AlertTriangle className="h-3 w-3" />
            Vencidas
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatCurrency(receivables.overdue_total)}
          </p>
          <p className="text-[10px] text-gray-500">
            {formatNumber(receivables.overdue_count)} parcela(s)
          </p>
        </div>
        <div className="rounded-xl bg-amber-50/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">A vencer</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatCurrency(receivables.pending_total)}
          </p>
          <p className="text-[10px] text-gray-500">
            {formatNumber(receivables.pending_count)} parcela(s)
          </p>
        </div>
      </div>

      {receivables.items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500">
          Nenhuma parcela em aberto para esta loja.
        </div>
      ) : (
        <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
          {receivables.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  item.is_overdue
                    ? 'bg-red-50 text-red-600'
                    : 'bg-amber-50 text-amber-600',
                )}
              >
                <ReceiptText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {item.customer_name}
                </p>
                <p className="text-[11px] text-gray-500">
                  Parcela {item.number}/{item.total_installments} • vence {formatDate(item.due_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(item.balance)}</p>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wide',
                    item.is_overdue ? 'text-red-600' : 'text-amber-600',
                  )}
                >
                  {item.is_overdue ? 'Vencida' : 'Em aberto'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

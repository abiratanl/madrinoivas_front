import { ArrowLeftRight, ArrowRightLeft } from 'lucide-react';
import type {
  LocalDashboardTransfer,
  LocalDashboardTransfers,
} from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import { formatNumber } from '../../dashboardUtils';

interface TransferListProps {
  title: string;
  items: LocalDashboardTransfer[];
  direction: 'incoming' | 'outgoing';
}

function TransferList({ title, items, direction }: TransferListProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{title}</p>
        <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500">
          {formatNumber(items.length)}
        </span>
      </div>
      <div className="mt-3 space-y-2.5">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400">
            Nenhuma peça em trânsito.
          </p>
        ) : (
          items.map((transfer) => (
            <div
              key={transfer.id}
              className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/30 p-3"
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  direction === 'incoming'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-sky-50 text-sky-600',
                )}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900">
                  {transfer.product_name}
                </p>
                <p className="truncate text-[10px] text-gray-500">
                  {direction === 'incoming'
                    ? `de ${transfer.from_store_name}`
                    : `para ${transfer.to_store_name}`}
                </p>
              </div>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {transfer.product_code}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface LocalTransfersProps {
  transfers: LocalDashboardTransfers;
}

export function LocalTransfers({ transfers }: LocalTransfersProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Transferências</h2>
            <p className="text-xs text-gray-500">Peças saindo e chegando à loja</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          {formatNumber(transfers.completed_in_period)} concluídas
        </span>
      </header>

      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
        <TransferList title="Entradas em trânsito" items={transfers.incoming} direction="incoming" />
        <TransferList title="Saídas em trânsito" items={transfers.outgoing} direction="outgoing" />
      </div>
    </section>
  );
}

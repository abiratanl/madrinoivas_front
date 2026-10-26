import { CreditCard, WalletCards } from 'lucide-react';
import type {
  DashboardPaymentMethod,
  DashboardPaymentMethodTotal,
} from '@/services/dashboardService';
import { formatCurrency, formatNumber, formatPercent } from '../dashboardUtils';

const METHOD_META: Record<
  DashboardPaymentMethod,
  { label: string; color: string; dotClassName: string }
> = {
  pix: { label: 'Pix', color: '#0d9488', dotClassName: 'bg-teal-600' },
  credit_card: { label: 'Cartão de crédito', color: '#2563eb', dotClassName: 'bg-blue-600' },
  debit_card: { label: 'Cartão de débito', color: '#6366f1', dotClassName: 'bg-indigo-500' },
  cash: { label: 'Dinheiro', color: '#059669', dotClassName: 'bg-emerald-600' },
  bank_transfer: { label: 'Transferência', color: '#d97706', dotClassName: 'bg-amber-600' },
};

interface PaymentMethodMixProps {
  methods: DashboardPaymentMethodTotal[];
  title?: string;
  description?: string;
}

export function PaymentMethodMix({
  methods,
  title = 'Formas de Pagamento',
  description = 'Distribuição da receita confirmada',
}: PaymentMethodMixProps) {
  const total = methods.reduce((sum, method) => sum + method.total, 0);
  const items = methods
    .filter((method) => method.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((method) => ({
      ...method,
      ...METHOD_META[method.payment_method],
      share: total > 0 ? (method.total / total) * 100 : 0,
    }));

  const segments = items.reduce<{ cursor: number; parts: string[] }>(
    (accumulator, item) => {
      const start = accumulator.cursor;
      const end = start + item.share;

      return {
        cursor: end,
        parts: [...accumulator.parts, `${item.color} ${start}% ${end}%`],
      };
    },
    { cursor: 0, parts: [] },
  ).parts;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {formatNumber(methods.reduce((sum, method) => sum + method.count, 0))} pagamentos
        </span>
      </header>

      {total === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-gray-500">
          Nenhum pagamento confirmado no período selecionado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[160px_1fr] sm:items-center">
          <div className="relative mx-auto h-40 w-40">
            <div
              className="h-full w-full rounded-full"
              style={{ background: `conic-gradient(${segments.join(', ')})` }}
              role="img"
              aria-label={`Distribuição de ${formatCurrency(total)} em pagamentos`}
            />
            <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <CreditCard className="h-4 w-4 text-gray-300" />
              <p className="mt-1 max-w-24 truncate text-center text-xs font-bold text-gray-900">
                {formatCurrency(total)}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">total</p>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.payment_method} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dotClassName}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-xs font-semibold text-gray-700">{item.label}</p>
                    <p className="shrink-0 text-xs font-bold text-gray-900">
                      {formatPercent(item.share)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-gray-400">
                    <span>
                      {formatNumber(item.count)} pagamento(s)
                    </span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

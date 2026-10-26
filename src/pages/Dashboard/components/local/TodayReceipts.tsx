import { Banknote, CreditCard, QrCode, ReceiptText, type LucideIcon } from 'lucide-react';
import type {
  DashboardPaymentMethodTotal,
  LocalDashboardReceipts,
} from '@/services/dashboardService';
import { formatCurrency, formatNumber } from '../../dashboardUtils';

interface ReceiptMethodCardProps {
  label: string;
  total: number;
  count: number;
  icon: LucideIcon;
  tone: string;
}

function ReceiptMethodCard({ label, total, count, icon: Icon, tone }: ReceiptMethodCardProps) {
  return (
    <article className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {formatNumber(count)} receb.
        </span>
      </div>
      <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
    </article>
  );
}

const sumMethods = (methods: DashboardPaymentMethodTotal[], keys: string[]) =>
  methods
    .filter((method) => keys.includes(method.payment_method))
    .reduce(
      (total, method) => ({
        total: total.total + method.total,
        count: total.count + method.count,
      }),
      { total: 0, count: 0 },
    );

interface TodayReceiptsProps {
  receipts: LocalDashboardReceipts;
}

export function TodayReceipts({ receipts }: TodayReceiptsProps) {
  const pix = sumMethods(receipts.by_method, ['pix']);
  const card = sumMethods(receipts.by_method, ['credit_card', 'debit_card']);
  const cash = sumMethods(receipts.by_method, ['cash']);
  const other = {
    total: Math.max(receipts.total - pix.total - card.total - cash.total, 0),
    count: Math.max(receipts.count - pix.count - card.count - cash.count, 0),
  };

  const methods: ReceiptMethodCardProps[] = [
    {
      label: 'Pix',
      total: pix.total,
      count: pix.count,
      icon: QrCode,
      tone: 'bg-teal-50 text-teal-600',
    },
    {
      label: 'Cartão',
      total: card.total,
      count: card.count,
      icon: CreditCard,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Dinheiro',
      total: cash.total,
      count: cash.count,
      icon: Banknote,
      tone: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Recebimentos de hoje</h2>
            <p className="text-xs text-gray-500">Pagamentos confirmados por forma de pagamento</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {formatNumber(receipts.count)} pagamentos
        </span>
      </header>

      <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
          Total recebido hoje
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(receipts.total)}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {methods.map((method) => (
          <ReceiptMethodCard key={method.label} {...method} />
        ))}
      </div>

      {other.total > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          Outros meios: {formatCurrency(other.total)} em {formatNumber(other.count)} recebimento(s).
        </p>
      )}
    </section>
  );
}

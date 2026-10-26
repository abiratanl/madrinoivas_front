import {
  AlertTriangle,
  ReceiptText,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type {
  DashboardComparison,
  GeneralDashboardSummary,
} from '@/services/dashboardService';
import { cn } from '@/utils/cn';
import { formatCurrency, formatNumber, formatPercent } from '../dashboardUtils';

type Tone = 'rose' | 'blue' | 'amber' | 'red';

const TONES: Record<Tone, { icon: string; glow: string }> = {
  rose: { icon: 'bg-rose-50 text-rose-600', glow: 'bg-rose-50/70' },
  blue: { icon: 'bg-blue-50 text-blue-600', glow: 'bg-blue-50/70' },
  amber: { icon: 'bg-amber-50 text-amber-600', glow: 'bg-amber-50/70' },
  red: { icon: 'bg-red-50 text-red-600', glow: 'bg-red-50/70' },
};

interface KpiCardProps {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: Tone;
}

function KpiCard({ title, value, hint, icon: Icon, tone }: KpiCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full',
          TONES[tone].glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-gray-900">{value}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{hint}</p>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            TONES[tone].icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

interface KpiCardsProps {
  summary: GeneralDashboardSummary;
  comparison: DashboardComparison;
}

export function KpiCards({ summary, comparison }: KpiCardsProps) {
  const growth = comparison.growth_percentage;
  const growthHint =
    growth === null
      ? 'Sem base de comparação no período anterior'
      : `${growth >= 0 ? '+' : ''}${formatPercent(growth)} vs período anterior`;

  const cards: KpiCardProps[] = [
    {
      title: 'Faturamento Recebido',
      value: formatCurrency(summary.total_revenue),
      hint: `${formatNumber(summary.total_rentals)} aluguéis criados • ${growthHint}`,
      icon: Wallet,
      tone: 'rose',
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(summary.average_ticket),
      hint: 'Valor médio contratado por aluguel',
      icon: TrendingUp,
      tone: 'blue',
    },
    {
      title: 'Recebíveis',
      value: formatCurrency(summary.pending_receivables),
      hint: 'Saldo em aberto dos aluguéis do período',
      icon: ReceiptText,
      tone: 'amber',
    },
    {
      title: 'Inadimplência',
      value: formatCurrency(summary.overdue_receivables),
      hint: `${formatPercent(summary.delinquency_rate)} da carteira em aberto • ${formatNumber(summary.overdue_installments)} parcela(s) vencida(s)`,
      icon: AlertTriangle,
      tone: 'red',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  );
}

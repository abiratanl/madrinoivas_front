import { CalendarDays } from 'lucide-react';
import type { DashboardPeriod } from '@/services/dashboardService';
import { cn } from '@/utils/cn';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'all', label: 'Todo período' },
  { value: 'current_month', label: 'Este mês' },
  { value: 'last_3_months', label: '3 meses' },
  { value: 'last_6_months', label: '6 meses' },
  { value: 'current_year', label: 'Este ano' },
];

interface PeriodSelectorProps {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
  disabled?: boolean;
}

export function PeriodSelector({ value, onChange, disabled = false }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:flex">
        <CalendarDays className="h-4 w-4" />
        Período
      </span>

      <div
        role="group"
        aria-label="Selecionar período do dashboard"
        className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
      >
        {PERIOD_OPTIONS.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              aria-pressed={isActive}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

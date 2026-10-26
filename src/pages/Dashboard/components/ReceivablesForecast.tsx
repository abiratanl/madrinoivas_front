import { CalendarClock } from 'lucide-react';
import type { DashboardReceivablesForecast } from '@/services/dashboardService';
import { formatCurrency, formatMonthKey, formatNumber } from '../dashboardUtils';

interface ReceivablesForecastProps {
  forecast: DashboardReceivablesForecast[];
}

export function ReceivablesForecast({ forecast }: ReceivablesForecastProps) {
  const maxTotal = Math.max(...forecast.map((month) => month.total), 0);
  const total = forecast.reduce((sum, month) => sum + month.total, 0);
  const installments = forecast.reduce((sum, month) => sum + month.count, 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Previsão de Recebíveis</h2>
            <p className="text-xs text-gray-500">Saldo em aberto por vencimento</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          Próximos 6 meses
        </span>
      </header>

      {forecast.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500">
          Nenhuma parcela em aberto para os próximos meses.
        </div>
      ) : (
        <div className="space-y-4 px-5 py-5">
          {forecast.map((month) => {
            const share = maxTotal > 0 ? (month.total / maxTotal) * 100 : 0;

            return (
              <div key={month.month}>
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold capitalize text-gray-700">
                      {formatMonthKey(month.month)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {formatNumber(month.count)} parcela(s)
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(month.total)}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
                    style={{ width: `${Math.min(share, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <footer className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-5 py-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {formatNumber(installments)} parcelas previstas
        </span>
        <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
      </footer>
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { CircleAlert, RefreshCw } from 'lucide-react';
import {
  dashboardService,
  type DashboardPeriod,
  type GeneralDashboard as GeneralDashboardData,
} from '@/services/dashboardService';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { InventoryInsights } from './components/InventoryInsights';
import { KpiCards } from './components/KpiCards';
import { PaymentMethodMix } from './components/PaymentMethodMix';
import { PeriodSelector } from './components/PeriodSelector';
import { ReceivablesForecast } from './components/ReceivablesForecast';
import { RentalStatusOverview } from './components/RentalStatusOverview';
import { RevenueTrend } from './components/RevenueTrend';
import { StoreRevenueRanking } from './components/StoreRevenueRanking';
import { TopCollections } from './components/TopCollections';
import { TopRentedDresses } from './components/TopRentedDresses';
import { TransfersOverview } from './components/TransfersOverview';
import { formatDateTime, formatNumber } from './dashboardUtils';

const getErrorMessage = (error: unknown) => {
  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    'Não foi possível carregar o dashboard geral.'
  );
};

function GeneralDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>('all');
  const [data, setData] = useState<GeneralDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dashboard = await dashboardService.getGeneralDashboard(period);
      setData(dashboard);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500">
            Visão geral da rede
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">Dashboard Geral</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe o desempenho financeiro e operacional de todas as lojas.
          </p>
          {data && (
            <p className="mt-2 text-xs text-gray-400">
              Atualizado em {formatDateTime(data.generated_at)} •{' '}
              {formatNumber(data.summary.active_stores)} de{' '}
              {formatNumber(data.summary.total_stores)} lojas ativas
            </p>
          )}
        </div>

        <PeriodSelector value={period} onChange={setPeriod} disabled={loading} />
      </header>

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-100 bg-red-50/40 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <CircleAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Erro ao carregar o dashboard</h2>
            <p className="mt-1 max-w-md text-sm text-gray-600">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose-700 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <KpiCards summary={data.summary} comparison={data.comparison} />

          <RevenueTrend data={data.revenue_by_month} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <StoreRevenueRanking stores={data.stores} />
            <ReceivablesForecast forecast={data.receivables_forecast} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PaymentMethodMix methods={data.payments_by_method} />
            <RentalStatusOverview statuses={data.rentals_by_status} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TopRentedDresses products={data.top_products} />
            <TopCollections collections={data.top_collections} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TransfersOverview transfers={data.transfers} />
            <InventoryInsights inventory={data.inventory} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GeneralDashboard;

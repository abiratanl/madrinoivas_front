import { useCallback, useEffect, useState } from 'react';
import { CircleAlert, MapPin, RefreshCw, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  dashboardService,
  type DashboardPeriod,
  type LocalDashboard as LocalDashboardData,
} from '@/services/dashboardService';
import { PeriodSelector } from './components/PeriodSelector';
import { AvailabilityOverview } from './components/local/AvailabilityOverview';
import { LocalDashboardSkeleton } from './components/local/LocalDashboardSkeleton';
import { LocalReceivables } from './components/local/LocalReceivables';
import { LocalRevenueOverview } from './components/local/LocalRevenueOverview';
import { LocalTransfers } from './components/local/LocalTransfers';
import { MaintenanceQueue } from './components/local/MaintenanceQueue';
import { TodayOperations } from './components/local/TodayOperations';
import { TodayReceipts } from './components/local/TodayReceipts';
import { WeeklyAgenda } from './components/local/WeeklyAgenda';
import { formatDateTime } from './dashboardUtils';

const configuredMonthlyGoal = Number(import.meta.env.VITE_LOCAL_MONTHLY_GOAL);
const DEFAULT_MONTHLY_GOAL =
  Number.isFinite(configuredMonthlyGoal) && configuredMonthlyGoal > 0
    ? configuredMonthlyGoal
    : 50000;

const getErrorMessage = (error: unknown) => {
  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    'Não foi possível carregar o dashboard da loja.'
  );
};

function LocalDashboard() {
  const { user, selectedStore } = useAuth();
  const storeId = selectedStore?.id || user?.store_id || null;

  const [period, setPeriod] = useState<DashboardPeriod>('all');
  const [data, setData] = useState<LocalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!storeId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dashboard = await dashboardService.getLocalDashboard(storeId, period);
      setData(dashboard);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [period, storeId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const location = [data?.store.city, data?.store.state].filter(Boolean).join(' - ');
  const monthlyGoal = data?.monthly_goal ?? DEFAULT_MONTHLY_GOAL;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-500">
            <Store className="h-3.5 w-3.5" />
            Operação da unidade
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">Dashboard da Loja</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data?.store.name
              ? `Acompanhe o dia a dia e o faturamento da ${data.store.name}.`
              : 'Acompanhe as operações e o faturamento da sua loja.'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
            {data && <span>Atualizado em {formatDateTime(data.generated_at)}</span>}
          </div>
        </div>

        <PeriodSelector value={period} onChange={setPeriod} disabled={loading || !storeId} />
      </header>

      {!storeId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Loja não selecionada</h2>
            <p className="mt-1 text-sm text-gray-500">
              Selecione uma loja para visualizar o dashboard operacional.
            </p>
          </div>
        </div>
      ) : loading ? (
        <LocalDashboardSkeleton />
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
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <LocalRevenueOverview
              summary={data.summary}
              comparison={data.comparison}
              monthlyGoal={monthlyGoal}
            />
            <TodayReceipts receipts={data.today_receipts} />
          </div>

          <TodayOperations operations={data.today_operations} />

          <WeeklyAgenda operations={data.week_operations} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AvailabilityOverview availability={data.availability} />
            <LocalReceivables receivables={data.receivables} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <LocalTransfers transfers={data.transfers} />
            <MaintenanceQueue maintenance={data.maintenance} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default LocalDashboard;

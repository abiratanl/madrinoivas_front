import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number.isFinite(value) ? value : 0,
  );

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('pt-BR').format(Number.isFinite(value) ? value : 0);

export const formatPercent = (value: number, digits = 1) =>
  `${(Number.isFinite(value) ? value : 0).toFixed(digits)}%`;

export const formatMonthKey = (value: string) => {
  if (!/^\d{4}-\d{2}$/.test(value)) return value;

  const [year, month] = value.split('-').map(Number);
  const date = new Date(year, month - 1, 1);

  return format(date, "MMM 'de' yyyy", { locale: ptBR });
};

const parseDate = (value?: string | null) => {
  if (!value) return null;

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = dateOnly
    ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value?: string | null) => {
  const date = parseDate(value);
  if (!date) return '-';

  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatMonthShort = (value: string) => {
  if (!/^\d{4}-\d{2}$/.test(value)) return value;

  const [year, month] = value.split('-').map(Number);
  const date = new Date(year, month - 1, 1);

  return format(date, 'MMM/yy', { locale: ptBR }).replace('.', '');
};

export const formatShortDate = (value?: string | null) => {
  const date = parseDate(value);
  if (!date) return '-';

  return format(date, 'dd/MM', { locale: ptBR });
};

export const formatWeekday = (value?: string | null) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return format(date, 'EEEE', { locale: ptBR });
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export const formatTime = (value?: string | null) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return format(date, 'HH:mm', { locale: ptBR });
};

export const formatToday = () => format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

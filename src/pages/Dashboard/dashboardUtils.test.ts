import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMonthKey,
  formatMonthShort,
  formatNumber,
  formatPercent,
  formatShortDate,
  formatTime,
  formatToday,
  formatWeekday,
} from './dashboardUtils';

describe('dashboardUtils', () => {
  it('formats currency and falls back to zero for invalid values', () => {
    expect(formatCurrency(1234.5)).toBe('R$\u00A01.234,50');
    expect(formatCurrency(Number.NaN)).toBe('R$\u00A00,00');
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe('R$\u00A00,00');
  });

  it('formats numbers and percentages', () => {
    expect(formatNumber(1234.5)).toBe('1.234,5');
    expect(formatNumber(Number.NaN)).toBe('0');
    expect(formatPercent(12.345)).toBe('12.3%');
    expect(formatPercent(12.345, 2)).toBe('12.35%');
    expect(formatPercent(Number.NaN)).toBe('0.0%');
    expect(formatPercent(-10)).toBe('-10.0%');
  });

  it('formats month keys and short month labels', () => {
    expect(formatMonthKey('2026-10')).toBe('out de 2026');
    expect(formatMonthKey('invalid')).toBe('invalid');
    expect(formatMonthShort('2026-10')).toBe('out/26');
    expect(formatMonthShort('invalid')).toBe('invalid');
  });

  it('formats date-only values without timezone shifts', () => {
    expect(formatDate('2026-10-26')).toBe('26/10/2026');
    expect(formatShortDate('2026-10-26')).toBe('26/10');
    expect(formatWeekday('2026-10-26T12:00:00')).toBe('segunda-feira');
  });

  it('formats date and time values and handles invalid input', () => {
    expect(formatDateTime('2026-10-26T12:34:00')).toBe('26/10/2026 às 12:34');
    expect(formatTime('2026-10-26T12:34:00')).toBe('12:34');
    expect(formatDate(null)).toBe('-');
    expect(formatDate('not-a-date')).toBe('-');
    expect(formatShortDate(undefined)).toBe('-');
    expect(formatWeekday('not-a-date')).toBe('-');
    expect(formatDateTime('not-a-date')).toBe('-');
    expect(formatTime('not-a-date')).toBe('-');
  });

  it('formats the current day', () => {
    expect(formatToday()).toMatch(/, \d{2} de /);
  });
});

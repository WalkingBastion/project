import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate } from '@/utils/format';

describe('formatCurrency', () => {
  it('formats a numeric string as USD currency', () => {
    expect(formatCurrency('150.00')).toBe('$150.00');
  });

  it('formats a plain number', () => {
    expect(formatCurrency(99.5)).toBe('$99.50');
  });

  it('falls back to the raw value for non-numeric input', () => {
    expect(formatCurrency('not-a-number')).toBe('not-a-number');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string as a readable date', () => {
    expect(formatDate('2026-12-25')).toMatch(/Dec 25, 2026/);
  });

  it('falls back to the raw value for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

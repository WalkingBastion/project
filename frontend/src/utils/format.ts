/**
 * Presentation-only formatting helpers, kept out of components so they
 * are trivially unit-testable and reusable.
 */
export function formatCurrency(value: string | number): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  // Booking dates are calendar dates with no time component. The Date
  // constructor parses a bare "YYYY-MM-DD" string as UTC midnight, so
  // formatting must also read it back in UTC - otherwise a negative
  // UTC-offset timezone (e.g. US timezones) would display the day
  // before, both in the running app and non-deterministically in tests.
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

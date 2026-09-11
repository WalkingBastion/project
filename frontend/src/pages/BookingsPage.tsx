import { useMemo, useState } from 'react';
import { useBookingsQuery } from '@/hooks/useBookings';
import { useDebounce } from '@/hooks/useDebounce';
import { BookingList } from '@/components/BookingList';
import { BookingFilterBar } from '@/components/BookingFilterBar';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { extractErrorMessage } from '@/api/errors';
import type { BookingFilters } from '@/types';

export function BookingsPage() {
  const [filters, setFilters] = useState<BookingFilters>({});
  const [page, setPage] = useState(1);

  // Debounce filter changes so rapid edits (e.g. typing a location)
  // don't fire a network request per keystroke.
  const debouncedFilters = useDebounce(filters, 300);

  const queryFilters = useMemo(
    () => ({ ...debouncedFilters, page, page_size: 9 }),
    [debouncedFilters, page],
  );

  const { data, isLoading, isError, error, isFetching } = useBookingsQuery(queryFilters);

  const handleApplyFilters = (nextFilters: BookingFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  return (
    <section className="bookings-page">
      <h1>Search bookings</h1>
      <BookingFilterBar initialFilters={filters} onApply={handleApplyFilters} />

      {isLoading && <LoadingSpinner label="Loading bookings…" />}
      {isError && <ErrorMessage message={extractErrorMessage(error, 'Could not load bookings.')} />}

      {data && (
        <>
          <p className="bookings-page__count" aria-live="polite">
            {data.total} booking{data.total === 1 ? '' : 's'} found
            {isFetching && ' (updating…)'}
          </p>
          <BookingList bookings={data.items} />
          <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}

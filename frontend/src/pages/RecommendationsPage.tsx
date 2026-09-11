import { useRecommendationsQuery } from '@/hooks/useRecommendations';
import { BookingList } from '@/components/BookingList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { extractErrorMessage } from '@/api/errors';

export function RecommendationsPage() {
  const { data, isLoading, isError, error } = useRecommendationsQuery(6);

  return (
    <section className="recommendations-page">
      <h1>Recommended for you</h1>
      <p>Based on the bookings you've recently viewed and reserved.</p>

      {isLoading && <LoadingSpinner label="Finding recommendations…" />}
      {isError && (
        <ErrorMessage message={extractErrorMessage(error, 'Could not load recommendations.')} />
      )}
      {data && (
        <BookingList
          bookings={data}
          emptyMessage="Browse a few bookings and we'll start suggesting alternatives here."
        />
      )}
    </section>
  );
}

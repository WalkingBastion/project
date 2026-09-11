import { useState } from 'react';
import {
  useCancelReservationMutation,
  useConfirmReservationMutation,
  useMyReservationsQuery,
} from '@/hooks/useReservations';
import { ReservationCard } from '@/components/ReservationCard';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { extractErrorMessage } from '@/api/errors';

export function MyReservationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useMyReservationsQuery(page);
  const confirmMutation = useConfirmReservationMutation();
  const cancelMutation = useCancelReservationMutation();

  if (isLoading) return <LoadingSpinner label="Loading your reservations…" />;
  if (isError) {
    return <ErrorMessage message={extractErrorMessage(error, 'Could not load reservations.')} />;
  }

  const isUpdating = confirmMutation.isPending || cancelMutation.isPending;

  return (
    <section className="reservations-page">
      <h1>My reservations</h1>

      {data && data.items.length === 0 && (
        <p className="empty-state">You have no reservations yet.</p>
      )}

      <div className="reservation-list">
        {data?.items.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            isUpdating={isUpdating}
            onConfirm={(id) => confirmMutation.mutate(id)}
            onCancel={(id) => cancelMutation.mutate(id)}
          />
        ))}
      </div>

      {data && <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />}

      {confirmMutation.isError && (
        <ErrorMessage message={extractErrorMessage(confirmMutation.error, 'Could not confirm.')} />
      )}
      {cancelMutation.isError && (
        <ErrorMessage message={extractErrorMessage(cancelMutation.error, 'Could not cancel.')} />
      )}
    </section>
  );
}

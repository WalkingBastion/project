import { useState } from 'react';
import { useAllReservationsQuery, useManagerStatsQuery, useUpdateReservationStatusMutation } from '@/hooks/useManager';
import { ReservationCard } from '@/components/ReservationCard';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ManagerBookingForm } from '@/components/ManagerBookingForm';
import { extractErrorMessage } from '@/api/errors';

export function ManagerDashboardPage() {
  const [page, setPage] = useState(1);
  const { data: stats } = useManagerStatsQuery();
  const { data, isLoading, isError, error } = useAllReservationsQuery(page);
  const updateStatus = useUpdateReservationStatusMutation();

  return (
    <section className="manager-page">
      <h1>Manager dashboard</h1>

      {stats && (
        <div className="manager-stats">
          <div className="manager-stats__item">
            <span className="manager-stats__value">{stats.total_bookings}</span>
            <span className="manager-stats__label">Listings</span>
          </div>
          <div className="manager-stats__item">
            <span className="manager-stats__value">{stats.total_reservations}</span>
            <span className="manager-stats__label">Reservations</span>
          </div>
          <div className="manager-stats__item">
            <span className="manager-stats__value">{stats.confirmed_reservations}</span>
            <span className="manager-stats__label">Confirmed</span>
          </div>
        </div>
      )}

      <ManagerBookingForm />

      <h2>All reservations</h2>
      {isLoading && <LoadingSpinner label="Loading reservations…" />}
      {isError && <ErrorMessage message={extractErrorMessage(error, 'Could not load reservations.')} />}

      <div className="reservation-list">
        {data?.items.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            isUpdating={updateStatus.isPending}
            onConfirm={(id) => updateStatus.mutate({ id, status: 'confirmed' })}
            onCancel={(id) => updateStatus.mutate({ id, status: 'cancelled' })}
          />
        ))}
      </div>

      {data && <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />}
    </section>
  );
}

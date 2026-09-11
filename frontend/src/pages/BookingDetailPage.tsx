import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBookingQuery } from '@/hooks/useBookings';
import { useCreateReservationMutation } from '@/hooks/useReservations';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { StatusBadge } from '@/components/StatusBadge';
import { extractErrorMessage } from '@/api/errors';
import { formatCurrency, formatDate } from '@/utils/format';

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { status: authStatus } = useAuth();

  const { data: booking, isLoading, isError, error } = useBookingQuery(id);
  const createReservation = useCreateReservationMutation();

  const [guests, setGuests] = useState(1);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner label="Loading booking…" />;
  if (isError || !booking) {
    return <ErrorMessage message={extractErrorMessage(error, 'Booking not found.')} />;
  }

  const handleBook = async () => {
    setConfirmationMessage(null);
    if (authStatus !== 'authenticated') {
      navigate('/login', { state: { from: { pathname: `/bookings/${id}` } } });
      return;
    }
    try {
      await createReservation.mutateAsync({ bookingId: booking.id, guests });
      setConfirmationMessage('Reservation created! Find it under "My reservations".');
    } catch {
      // error surfaced via createReservation.isError below
    }
  };

  const isBookable = booking.confirmation_status === 'confirmed';

  return (
    <section className="booking-detail">
      <div className="booking-detail__header">
        <h1>{booking.name}</h1>
        <StatusBadge status={booking.confirmation_status} />
      </div>
      <p className="booking-detail__meta">
        {booking.location} · {formatDate(booking.date)}
      </p>
      <p className="booking-detail__price">{formatCurrency(booking.price)} / night</p>
      {booking.description && <p className="booking-detail__description">{booking.description}</p>}

      <div className="booking-detail__book">
        <label htmlFor="guests">Guests</label>
        <input
          id="guests"
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        />
        <button
          type="button"
          className="button"
          onClick={handleBook}
          disabled={!isBookable || createReservation.isPending}
        >
          {createReservation.isPending ? 'Booking…' : 'Book now'}
        </button>
      </div>

      {!isBookable && <ErrorMessage message="This booking is not currently available." />}
      {createReservation.isError && (
        <ErrorMessage
          message={extractErrorMessage(createReservation.error, 'Could not create reservation.')}
        />
      )}
      {confirmationMessage && <p className="success-message">{confirmationMessage}</p>}
    </section>
  );
}

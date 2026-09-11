import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Booking } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';

interface BookingCardProps {
  booking: Booking;
}

/**
 * Memoized so re-rendering the results list (e.g. after a pagination
 * change) doesn't re-render every card whose underlying data hasn't
 * actually changed - React.memo does a shallow prop comparison and
 * bails out early for unaffected cards.
 */
function BookingCardImpl({ booking }: BookingCardProps) {
  return (
    <article className="booking-card">
      <div className="booking-card__header">
        <h3>{booking.name}</h3>
        <StatusBadge status={booking.confirmation_status} />
      </div>
      <p className="booking-card__meta">
        {booking.location} · {formatDate(booking.date)}
      </p>
      <p className="booking-card__price">{formatCurrency(booking.price)} / night</p>
      {booking.description && <p className="booking-card__description">{booking.description}</p>}
      <Link className="button button--secondary" to={`/bookings/${booking.id}`}>
        View details
      </Link>
    </article>
  );
}

export const BookingCard = memo(BookingCardImpl);

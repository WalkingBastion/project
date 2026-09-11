import { memo } from 'react';
import type { Reservation } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';

interface ReservationCardProps {
  reservation: Reservation;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  isUpdating?: boolean;
}

function ReservationCardImpl({
  reservation,
  onConfirm,
  onCancel,
  isUpdating,
}: ReservationCardProps) {
  return (
    <article className="reservation-card">
      <div className="reservation-card__header">
        <h3>{reservation.booking.name}</h3>
        <StatusBadge status={reservation.status} />
      </div>
      <p className="reservation-card__meta">
        {reservation.booking.location} · {formatDate(reservation.booking.date)} ·{' '}
        {reservation.guests} guest{reservation.guests > 1 ? 's' : ''}
      </p>
      <p className="reservation-card__price">Total: {formatCurrency(reservation.total_price)}</p>
      <div className="reservation-card__actions">
        {reservation.status === 'pending' && onConfirm && (
          <button
            type="button"
            className="button"
            disabled={isUpdating}
            onClick={() => onConfirm(reservation.id)}
          >
            Confirm
          </button>
        )}
        {reservation.status !== 'cancelled' && onCancel && (
          <button
            type="button"
            className="button button--danger"
            disabled={isUpdating}
            onClick={() => onCancel(reservation.id)}
          >
            Cancel
          </button>
        )}
      </div>
    </article>
  );
}

export const ReservationCard = memo(ReservationCardImpl);

import { memo } from 'react';
import type { Booking } from '@/types';
import { BookingCard } from '@/components/BookingCard';

interface BookingListProps {
  bookings: Booking[];
  emptyMessage?: string;
}

function BookingListImpl({ bookings, emptyMessage = 'No bookings found.' }: BookingListProps) {
  if (bookings.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="booking-grid">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}

export const BookingList = memo(BookingListImpl);

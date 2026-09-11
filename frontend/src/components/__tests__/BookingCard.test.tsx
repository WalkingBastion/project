import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BookingCard } from '@/components/BookingCard';
import type { Booking } from '@/types';

const booking: Booking = {
  id: 'b1',
  name: 'Seaside Deluxe Room',
  date: '2026-12-25',
  location: 'Lisbon',
  price: '150.00',
  description: 'Ocean view room',
  confirmation_status: 'confirmed',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('BookingCard', () => {
  it('renders booking details and a link to the detail page', () => {
    render(
      <MemoryRouter>
        <BookingCard booking={booking} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Seaside Deluxe Room')).toBeInTheDocument();
    expect(screen.getByText(/Lisbon/)).toBeInTheDocument();
    expect(screen.getByText('$150.00 / night')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute(
      'href',
      '/bookings/b1',
    );
  });
});

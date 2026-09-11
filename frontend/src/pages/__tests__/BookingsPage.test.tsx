import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingsPage } from '@/pages/BookingsPage';
import { renderWithProviders, mockAxiosError } from '@/test/testUtils';
import * as bookingsApi from '@/api/bookings';
import type { Page, Booking } from '@/types';

vi.mock('@/api/bookings');

const lisbon: Booking = {
  id: 'b1',
  name: 'Seaside Deluxe Room',
  date: '2026-12-25',
  location: 'Lisbon',
  price: '150.00',
  description: '',
  confirmation_status: 'confirmed',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const berlin: Booking = {
  ...lisbon,
  id: 'b2',
  name: 'Berlin Studio',
  location: 'Berlin',
};

function pageOf(items: Booking[]): Page<Booking> {
  return { items, total: items.length, page: 1, page_size: 9, pages: 1 };
}

describe('BookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state, then renders results', async () => {
    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue(pageOf([lisbon, berlin]));

    renderWithProviders(<BookingsPage />, { route: '/bookings' });

    expect(screen.getByText(/loading bookings/i)).toBeInTheDocument();

    expect(await screen.findByText('Seaside Deluxe Room')).toBeInTheDocument();
    expect(screen.getByText('Berlin Studio')).toBeInTheDocument();
    expect(screen.getByText('2 bookings found')).toBeInTheDocument();
  });

  it('shows an empty state when no bookings match', async () => {
    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue(pageOf([]));

    renderWithProviders(<BookingsPage />, { route: '/bookings' });

    expect(await screen.findByText(/no bookings found/i)).toBeInTheDocument();
  });

  it('re-queries with the location filter once the user applies it', async () => {
    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue(pageOf([lisbon, berlin]));
    const user = userEvent.setup();

    renderWithProviders(<BookingsPage />, { route: '/bookings' });
    await screen.findByText('Seaside Deluxe Room');

    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue(pageOf([lisbon]));
    await user.type(screen.getByLabelText(/location/i), 'Lisbon');
    await user.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() =>
      expect(bookingsApi.fetchBookings).toHaveBeenLastCalledWith(
        expect.objectContaining({ location: 'Lisbon', page: 1 }),
      ),
    );
  });

  it('surfaces an error message when the request fails', async () => {
    vi.mocked(bookingsApi.fetchBookings).mockRejectedValue(
      mockAxiosError({ detail: 'Server error' }, 500),
    );

    renderWithProviders(<BookingsPage />, { route: '/bookings' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error');
  });
});

/**
 * Booking-listing API calls (search/detail/manager CRUD).
 */
import { api } from '@/api/client';
import type {
  Booking,
  BookingCreatePayload,
  BookingFilters,
  BookingUpdatePayload,
  Page,
} from '@/types';

export async function fetchBookings(filters: BookingFilters): Promise<Page<Booking>> {
  const { data } = await api.get<Page<Booking>>('/bookings', { params: filters });
  return data;
}

export async function fetchBookingById(id: string): Promise<Booking> {
  const { data } = await api.get<Booking>(`/bookings/${id}`);
  return data;
}

export async function createBooking(payload: BookingCreatePayload): Promise<Booking> {
  const { data } = await api.post<Booking>('/bookings', payload);
  return data;
}

export async function updateBooking(id: string, payload: BookingUpdatePayload): Promise<Booking> {
  const { data } = await api.put<Booking>(`/bookings/${id}`, payload);
  return data;
}

export async function deleteBooking(id: string): Promise<void> {
  await api.delete(`/bookings/${id}`);
}

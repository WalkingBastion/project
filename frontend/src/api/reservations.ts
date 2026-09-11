/**
 * Guest-facing reservation API calls.
 */
import { api } from '@/api/client';
import type { Page, Reservation } from '@/types';

export async function createReservation(bookingId: string, guests: number): Promise<Reservation> {
  const { data } = await api.post<Reservation>('/reservations', { booking_id: bookingId, guests });
  return data;
}

export async function fetchMyReservations(page: number, pageSize = 10): Promise<Page<Reservation>> {
  const { data } = await api.get<Page<Reservation>>('/reservations', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function confirmReservation(id: string): Promise<Reservation> {
  const { data } = await api.post<Reservation>(`/reservations/${id}/confirm`);
  return data;
}

export async function cancelReservation(id: string): Promise<void> {
  await api.delete(`/reservations/${id}`);
}

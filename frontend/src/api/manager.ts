/**
 * Manager-only API calls.
 */
import { api } from '@/api/client';
import type { Page, Reservation, ReservationStatus } from '@/types';

export interface ManagerStats {
  total_bookings: number;
  total_reservations: number;
  confirmed_reservations: number;
}

export async function fetchAllReservations(
  page: number,
  pageSize = 10,
): Promise<Page<Reservation>> {
  const { data } = await api.get<Page<Reservation>>('/manager/reservations', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<Reservation> {
  const { data } = await api.patch<Reservation>(`/manager/reservations/${id}/status`, { status });
  return data;
}

export async function fetchManagerStats(): Promise<ManagerStats> {
  const { data } = await api.get<ManagerStats>('/manager/stats');
  return data;
}

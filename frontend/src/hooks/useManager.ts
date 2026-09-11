/**
 * Server-state hooks for the manager back-office.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllReservations, fetchManagerStats, updateReservationStatus } from '@/api/manager';
import { reservationKeys } from '@/hooks/useReservations';
import type { ReservationStatus } from '@/types';

export function useAllReservationsQuery(page: number) {
  return useQuery({
    queryKey: ['manager', 'reservations', page],
    queryFn: () => fetchAllReservations(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useManagerStatsQuery() {
  return useQuery({
    queryKey: ['manager', 'stats'],
    queryFn: fetchManagerStats,
  });
}

export function useUpdateReservationStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager'] });
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

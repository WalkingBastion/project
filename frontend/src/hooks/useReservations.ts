/**
 * Server-state hooks for the current user's reservations.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelReservation,
  confirmReservation,
  createReservation,
  fetchMyReservations,
} from '@/api/reservations';

export const reservationKeys = {
  all: ['reservations'] as const,
  mine: (page: number) => [...reservationKeys.all, 'mine', page] as const,
};

export function useMyReservationsQuery(page: number) {
  return useQuery({
    queryKey: reservationKeys.mine(page),
    queryFn: () => fetchMyReservations(page),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateReservationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, guests }: { bookingId: string; guests: number }) =>
      createReservation(bookingId, guests),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

export function useConfirmReservationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

export function useCancelReservationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

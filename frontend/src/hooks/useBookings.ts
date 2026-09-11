/**
 * Server-state hooks for booking listings, built on React Query.
 * React Query gives us caching, deduping of identical in-flight
 * requests, and background refetching for free - the "efficient
 * interface rendering model" the brief asks for, rather than hand
 * rolled useEffect + useState data fetching in every page.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBooking,
  deleteBooking,
  fetchBookingById,
  fetchBookings,
  updateBooking,
} from '@/api/bookings';
import type { BookingCreatePayload, BookingFilters, BookingUpdatePayload } from '@/types';

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (filters: BookingFilters) => [...bookingKeys.all, 'list', filters] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
};

export function useBookingsQuery(filters: BookingFilters) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => fetchBookings(filters),
    placeholderData: (previousData) => previousData, // avoids a loading flash while paginating
  });
}

export function useBookingQuery(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => fetchBookingById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookingCreatePayload) => createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useUpdateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BookingUpdatePayload }) =>
      updateBooking(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
    },
  });
}

export function useDeleteBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

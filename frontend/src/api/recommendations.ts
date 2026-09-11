/**
 * AI recommendation API call.
 */
import { api } from '@/api/client';
import type { Booking } from '@/types';

export async function fetchRecommendations(limit = 5): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>('/recommendations', { params: { limit } });
  return data;
}

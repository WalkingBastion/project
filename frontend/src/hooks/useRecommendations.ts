/**
 * Server-state hook for the AI recommendation panel.
 */
import { useQuery } from '@tanstack/react-query';
import { fetchRecommendations } from '@/api/recommendations';

export function useRecommendationsQuery(limit = 5) {
  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => fetchRecommendations(limit),
    staleTime: 60_000,
  });
}

import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api';
import { Review, PageResponse } from '@/types';

export function useReviews(page: number, size: number = 12) {
    return useQuery<PageResponse<Review>>({
        queryKey: ['reviews', page, size],
        queryFn: () => reviewApi.getAll(page, size),
        placeholderData: (previousData) => previousData, // Keep previous data for smooth transitions
    });
}

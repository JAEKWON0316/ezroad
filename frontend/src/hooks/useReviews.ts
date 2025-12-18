import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api';
import { Review, PageResponse } from '@/types';

export function useReviews(page: number, size: number = 12, photoOnly: boolean = false) {
    return useQuery<PageResponse<Review>>({
        queryKey: ['reviews', page, size, photoOnly],
        queryFn: () => reviewApi.getAll(page, size, photoOnly),
        placeholderData: (previousData) => previousData,
    });
}

export function useReviewCounts() {
    return useQuery<{ total: number; photo: number }>({
        queryKey: ['reviewCounts'],
        queryFn: () => reviewApi.getCounts(),
        staleTime: 30000, // 30초 캐시
    });
}

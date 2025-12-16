import { useQuery } from '@tanstack/react-query';
import { restaurantApi } from '@/lib/api';
import { Restaurant, PageResponse } from '@/types';

interface UseRestaurantsParams {
    keyword?: string;
    category?: string;
    sort?: 'avgRating' | 'reviewCount' | 'createdAt';
    page?: number;
    size?: number;
}

export function useRestaurants(params: UseRestaurantsParams) {
    return useQuery<PageResponse<Restaurant>>({
        queryKey: ['restaurants', params],
        queryFn: () => restaurantApi.getList(params),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new data (great UX)
    });
}

import { useQuery } from '@tanstack/react-query';
import { restaurantApi, menuApi, reviewApi, followApi } from '@/lib/api';
import { Restaurant, Menu, Review, PageResponse } from '@/types';

export function useRestaurantDetail(id: number, isAuthenticated: boolean) {
    // 1. Restaurant Info
    const restaurantQuery = useQuery({
        queryKey: ['restaurant', id],
        queryFn: () => restaurantApi.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // 2. Menus
    const menusQuery = useQuery({
        queryKey: ['restaurant', id, 'menus'],
        queryFn: () => menuApi.getByRestaurant(id),
        enabled: !!id,
    });

    // 3. Reviews (Initial fetch)
    const reviewsQuery = useQuery({
        queryKey: ['restaurant', id, 'reviews', 0], // Page 0
        queryFn: () => reviewApi.getByRestaurant(id, 0, 5),
        enabled: !!id,
    });

    // 4. Follow Status
    const followQuery = useQuery({
        queryKey: ['restaurant', id, 'follow'],
        queryFn: () => followApi.checkFollow(id),
        enabled: !!id && isAuthenticated,
        retry: false,
    });

    return {
        restaurant: restaurantQuery.data,
        menus: menusQuery.data || [],
        initialReviews: reviewsQuery.data,
        isFollowed: followQuery.data || false,
        isLoading: restaurantQuery.isLoading || menusQuery.isLoading, // Critical data loading
        isError: restaurantQuery.isError,
        refetchFollow: followQuery.refetch,
        // Expose queries if granular control needed
        restaurantQuery,
    };
}

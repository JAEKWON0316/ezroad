import { useQuery } from '@tanstack/react-query';
import { themeApi } from '@/lib/api';
import { ThemeDetail } from '@/types';

export function useThemeDetail(id: number) {
    const themeQuery = useQuery({
        queryKey: ['theme', id],
        queryFn: () => themeApi.getDetail(id),
        enabled: !!id,
        retry: 1,
    });

    const likeStatusQuery = useQuery({
        queryKey: ['theme', id, 'like'],
        queryFn: () => themeApi.checkLike(id),
        enabled: !!id && !!themeQuery.data,
    });

    return {
        theme: themeQuery.data,
        isLoading: themeQuery.isLoading,
        isError: themeQuery.isError,
        error: themeQuery.error,
        likeStatus: likeStatusQuery.data,
        refetchLike: likeStatusQuery.refetch,
    };
}

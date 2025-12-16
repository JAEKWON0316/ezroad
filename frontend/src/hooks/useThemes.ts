import { useQuery } from '@tanstack/react-query';
import { themeApi } from '@/lib/api';
import { Theme, PageResponse } from '@/types';

interface UseThemesParams {
    keyword?: string;
    sort?: string;
    page?: number;
    size?: number;
}

export function useThemes({ keyword, sort = 'createdAt', page = 0, size = 12 }: UseThemesParams) {
    return useQuery<PageResponse<Theme>>({
        queryKey: ['themes', { keyword, sort, page, size }],
        queryFn: () => themeApi.getPublic(keyword, sort, page, size),
        placeholderData: (previousData) => previousData,
    });
}

import api, { uploadApi } from './axios';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Restaurant,
  RestaurantCreateRequest,
  Menu,
  MenuCreateRequest,
  Review,
  ReviewCreateRequest,
  Reservation,
  ReservationCreateRequest,
  Waiting,
  Follow,
  PageResponse,
  MemberStats,
  RestaurantFilter,
  Mapping,
  Theme,
  ThemeDetail,
  ThemeCreateRequest,
  ThemeUpdateRequest,
  ThemeAddRestaurantRequest,
  ThemeReorderRequest,
} from '@/types';

// ==================== Auth API ====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // OAuth2 소셜 로그인 URL
  getKakaoLoginUrl: (): string => `${API_BASE_URL}/auth/oauth2/kakao`,
  getNaverLoginUrl: (): string => `${API_BASE_URL}/auth/oauth2/naver`,
  getGoogleLoginUrl: (): string => `${API_BASE_URL}/auth/oauth2/google`,
};

// ==================== Member API ====================
export const memberApi = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/members/me');
    return response.data;
  },

  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/members/me', data);
    return response.data;
  },

  deleteMe: async (): Promise<void> => {
    await api.delete('/members/me');
  },

  getMyStats: async (): Promise<MemberStats> => {
    const response = await api.get<MemberStats>('/members/me/stats');
    return response.data;
  },
};

// ==================== Restaurant API ====================
export const restaurantApi = {
  getList: async (filter?: RestaurantFilter): Promise<PageResponse<Restaurant>> => {
    const response = await api.get<PageResponse<Restaurant>>('/restaurants', { params: filter });
    return response.data;
  },

  getById: async (id: number): Promise<Restaurant> => {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },

  create: async (data: RestaurantCreateRequest): Promise<Restaurant> => {
    const response = await api.post<Restaurant>('/restaurants', data);
    return response.data;
  },

  update: async (id: number, data: Partial<RestaurantCreateRequest>): Promise<Restaurant> => {
    const response = await api.put<Restaurant>(`/restaurants/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },

  updateNotice: async (id: number, notice: string): Promise<Restaurant> => {
    const response = await api.put<Restaurant>(`/restaurants/${id}/notice`, { notice });
    return response.data;
  },

  getMyRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants/my');
    return response.data;
  },
};

// ==================== Menu API ====================
export const menuApi = {
  getByRestaurant: async (restaurantId: number): Promise<Menu[]> => {
    const response = await api.get<Menu[]>(`/menus/restaurant/${restaurantId}`);
    return response.data;
  },

  create: async (data: MenuCreateRequest): Promise<Menu> => {
    const response = await api.post<Menu>('/menus', data);
    return response.data;
  },

  update: async (id: number, data: Partial<MenuCreateRequest>): Promise<Menu> => {
    const response = await api.put<Menu>(`/menus/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/menus/${id}`);
  },

  toggleVisibility: async (id: number): Promise<Menu> => {
    const response = await api.patch<Menu>(`/menus/${id}/visibility`);
    return response.data;
  },
};

// ==================== Review API ====================
export const reviewApi = {
  getAll: async (page = 0, size = 10, photoOnly = false): Promise<PageResponse<Review>> => {
    const response = await api.get<PageResponse<Review>>('/reviews', { 
      params: { page, size, photoOnly } 
    });
    return response.data;
  },
  
  getCounts: async (): Promise<{ total: number; photo: number }> => {
    const response = await api.get<{ total: number; photo: number }>('/reviews/counts');
    return response.data;
  },

  getByRestaurant: async (
    restaurantId: number,
    page = 0,
    size = 10,
    photoOnly = false
  ): Promise<PageResponse<Review>> => {
    const response = await api.get<PageResponse<Review>>(`/reviews/restaurant/${restaurantId}`, {
      params: { page, size, photoOnly },
    });
    return response.data;
  },

  getMyReviews: async (page = 0, size = 10): Promise<PageResponse<Review>> => {
    const response = await api.get<PageResponse<Review>>('/reviews/my', { params: { page, size } });
    return response.data;
  },

  getById: async (id: number): Promise<Review> => {
    const response = await api.get<Review>(`/reviews/${id}`);
    return response.data;
  },

  create: async (data: ReviewCreateRequest): Promise<Review> => {
    const response = await api.post<Review>('/reviews', data);
    return response.data;
  },

  update: async (id: number, data: Partial<ReviewCreateRequest>): Promise<Review> => {
    const response = await api.put<Review>(`/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
  
  // 예약에 대한 리뷰 작성 가능 여부 확인
  canWriteReview: async (reservationId: number): Promise<{ canWrite: boolean }> => {
    const response = await api.get<{ canWrite: boolean }>(`/reviews/can-write/${reservationId}`);
    return response.data;
  },
};

// ==================== Reservation API ====================
export const reservationApi = {
  getMyReservations: async (page = 0, size = 10): Promise<PageResponse<Reservation>> => {
    const response = await api.get<PageResponse<Reservation>>('/reservations/my', {
      params: { page, size },
    });
    return response.data;
  },

  getByRestaurant: async (
    restaurantId: number,
    page = 0,
    size = 10
  ): Promise<PageResponse<Reservation>> => {
    const response = await api.get<PageResponse<Reservation>>(
      `/reservations/restaurant/${restaurantId}`,
      { params: { page, size } }
    );
    return response.data;
  },

  create: async (data: ReservationCreateRequest): Promise<Reservation> => {
    const response = await api.post<Reservation>('/reservations', data);
    return response.data;
  },

  confirm: async (id: number): Promise<Reservation> => {
    const response = await api.patch<Reservation>(`/reservations/${id}/confirm`);
    return response.data;
  },

  cancel: async (id: number): Promise<Reservation> => {
    const response = await api.patch<Reservation>(`/reservations/${id}/cancel`);
    return response.data;
  },

  complete: async (id: number): Promise<Reservation> => {
    const response = await api.patch<Reservation>(`/reservations/${id}/complete`);
    return response.data;
  },
};

// ==================== Waiting API ====================
export const waitingApi = {
  getMyWaitings: async (page = 0, size = 10): Promise<PageResponse<Waiting>> => {
    const response = await api.get<PageResponse<Waiting>>('/waitings/my', {
      params: { page, size },
    });
    return response.data;
  },

  getByRestaurant: async (
    restaurantId: number,
    page = 0,
    size = 10
  ): Promise<PageResponse<Waiting>> => {
    const response = await api.get<PageResponse<Waiting>>(
      `/waitings/restaurant/${restaurantId}`,
      { params: { page, size } }
    );
    return response.data;
  },

  create: async (data: { restaurantId: number; guestCount: number }): Promise<Waiting> => {
    const response = await api.post<Waiting>('/waitings', data);
    return response.data;
  },

  call: async (id: number): Promise<Waiting> => {
    const response = await api.patch<Waiting>(`/waitings/${id}/call`);
    return response.data;
  },

  seat: async (id: number): Promise<Waiting> => {
    const response = await api.patch<Waiting>(`/waitings/${id}/seat`);
    return response.data;
  },

  cancel: async (id: number): Promise<void> => {
    await api.delete(`/waitings/${id}`);
  },

  noShow: async (id: number): Promise<Waiting> => {
    const response = await api.patch<Waiting>(`/waitings/${id}/no-show`);
    return response.data;
  },

  // 내 대기 순번 조회 (Redis 기반 실시간)
  getMyPosition: async (): Promise<{
    waitingId: number;
    restaurantId: number;
    restaurantName: string;
    waitingNumber: number;
    positionInQueue: number;
    estimatedWaitTime: number;
    totalWaitingCount: number;
    status: string;
    timestamp: string;
  } | null> => {
    try {
      const response = await api.get('/waitings/my/position');
      return response.data;
    } catch {
      return null;
    }
  },

  // 식당 대기 인원 수 조회
  getWaitingCount: async (restaurantId: number): Promise<{ restaurantId: number; waitingCount: number }> => {
    const response = await api.get<{ restaurantId: number; waitingCount: number }>(
      `/waitings/restaurant/${restaurantId}/count`
    );
    return response.data;
  },
};

// ==================== Follow API ====================
export const followApi = {
  // Restaurant follows
  followRestaurant: async (restaurantId: number): Promise<Follow> => {
    const response = await api.post<Follow>(`/follows/restaurants/${restaurantId}`);
    return response.data;
  },

  unfollowRestaurant: async (restaurantId: number): Promise<void> => {
    await api.delete(`/follows/restaurants/${restaurantId}`);
  },

  getMyFollowedRestaurants: async (page = 0, size = 10): Promise<PageResponse<Restaurant>> => {
    const response = await api.get<PageResponse<Restaurant>>('/follows/my/restaurants', {
      params: { page, size },
    });
    return response.data;
  },

  getMyFollowedRestaurantIds: async (): Promise<number[]> => {
    const response = await api.get<number[]>('/follows/my/restaurant-ids');
    return response.data;
  },

  checkFollow: async (restaurantId: number): Promise<boolean> => {
    const response = await api.get<boolean>(`/follows/restaurants/${restaurantId}/check`);
    return response.data;
  },

  getFollowerCount: async (restaurantId: number): Promise<number> => {
    const response = await api.get<number>(`/follows/restaurants/${restaurantId}/count`);
    return response.data;
  },

  // Member follows
  followMember: async (memberId: number): Promise<Follow> => {
    const response = await api.post<Follow>(`/follows/members/${memberId}`);
    return response.data;
  },

  unfollowMember: async (memberId: number): Promise<void> => {
    await api.delete(`/follows/members/${memberId}`);
  },

  getFollowers: async (page = 0, size = 20): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>('/follows/my/followers', {
      params: { page, size },
    });
    return response.data;
  },

  getFollowing: async (page = 0, size = 20): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>('/follows/my/following', {
      params: { page, size },
    });
    return response.data;
  },

  removeFollower: async (memberId: number): Promise<void> => {
    await api.delete(`/follows/followers/${memberId}`);
  },
};

// ==================== Mapping API ====================
export const mappingApi = {
  create: async (data: {
    restaurantId?: number;
    title?: string;
    latitude: number;
    longitude: number;
  }): Promise<Mapping> => {
    const response = await api.post<Mapping>('/mappings', data);
    return response.data;
  },

  getMyMappings: async (): Promise<Mapping[]> => {
    const response = await api.get<Mapping[]>('/mappings/my');
    return response.data;
  },

  getNearby: async (lat: number, lng: number, radius: number): Promise<Mapping[]> => {
    const response = await api.get<Mapping[]>('/mappings/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/mappings/${id}`);
  },
};

// ==================== File Upload API ====================
export const fileApi = {
  upload: async (file: File, type: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await uploadApi.post<{ url: string }>('/files/upload', formData);
    return response.data;
  },

  delete: async (url: string): Promise<void> => {
    await api.delete('/files', { params: { url } });
  },
};

// ==================== Admin API ====================
export const adminApi = {
  // 대시보드 통계
  getStats: async (): Promise<{
    totalMembers: number;
    totalRestaurants: number;
    totalReviews: number;
    totalReservations: number;
    todayMembers: number;
    todayReservations: number;
  }> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // 회원 관리
  getMembers: async (page = 0, size = 20, keyword?: string): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>('/admin/members', {
      params: { page, size, keyword },
    });
    return response.data;
  },

  getMember: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/admin/members/${id}`);
    return response.data;
  },

  updateMemberRole: async (id: number, role: string): Promise<User> => {
    const response = await api.put<User>(`/admin/members/${id}/role`, { role });
    return response.data;
  },

  deleteMember: async (id: number): Promise<void> => {
    await api.delete(`/admin/members/${id}`);
  },

  // 식당 관리
  getRestaurants: async (page = 0, size = 20, keyword?: string): Promise<PageResponse<Restaurant>> => {
    const response = await api.get<PageResponse<Restaurant>>('/admin/restaurants', {
      params: { page, size, keyword },
    });
    return response.data;
  },

  updateRestaurantStatus: async (id: number, status: string): Promise<Restaurant> => {
    const response = await api.put<Restaurant>(`/admin/restaurants/${id}/status`, { status });
    return response.data;
  },

  deleteRestaurant: async (id: number): Promise<void> => {
    await api.delete(`/admin/restaurants/${id}`);
  },

  // 리뷰 관리
  getReviews: async (page = 0, size = 20): Promise<PageResponse<Review>> => {
    const response = await api.get<PageResponse<Review>>('/admin/reviews', {
      params: { page, size },
    });
    return response.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    await api.delete(`/admin/reviews/${id}`);
  },

  // 신고 목록
  getReports: async (params: { status?: ReportStatus; page?: number; size?: number }): Promise<PageResponse<Report>> => {
    const response = await api.get<PageResponse<Report>>('/admin/reports', { params });
    return response.data;
  },

  // 신고 상세
  getReport: async (id: number): Promise<Report> => {
    const response = await api.get<Report>(`/admin/reports/${id}`);
    return response.data;
  },

  // 신고 통계
  getReportStats: async (): Promise<Record<string, number>> => {
    const response = await api.get<Record<string, number>>('/admin/reports/stats');
    return response.data;
  },

  // 신고 처리
  resolveReport: async (id: number, adminNote?: string): Promise<Report> => {
    const response = await api.patch<Report>(`/admin/reports/${id}/resolve`, { adminNote });
    return response.data;
  },

  // 신고 기각
  dismissReport: async (id: number, adminNote?: string): Promise<Report> => {
    const response = await api.patch<Report>(`/admin/reports/${id}/dismiss`, { adminNote });
    return response.data;
  },

  // 키워드 목록
  getKeywords: async (): Promise<SearchKeyword[]> => {
    const response = await api.get<SearchKeyword[]>('/admin/keywords');
    return response.data;
  },

  // 키워드 삭제
  deleteKeyword: async (id: number): Promise<void> => {
    await api.delete(`/admin/keywords/${id}`);
  },
};

// ==================== 파트너(사업자) API ====================
export interface PartnerStats {
  totalRestaurants: number;
  totalReviews: number;
  totalReservations: number;
  totalFollowers: number;
  avgRating: number;
  todayReservations: number;
  todayReviews: number;
  weekReservations: number;
  weekReviews: number;
}

export interface RestaurantStats {
  restaurant: Restaurant;
  reviewCount: number;
  followerCount: number;
  avgRating: number;
  reservationCount: number;
}

export const partnerApi = {
  // 내 식당 목록
  getMyRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/partner/restaurants');
    return response.data;
  },

  // 대시보드 통계
  getStats: async (): Promise<PartnerStats> => {
    const response = await api.get<PartnerStats>('/partner/stats');
    return response.data;
  },

  // 특정 식당 상세 통계
  getRestaurantStats: async (restaurantId: number): Promise<RestaurantStats> => {
    const response = await api.get<RestaurantStats>(`/partner/restaurants/${restaurantId}/stats`);
    return response.data;
  },
};

// ==================== 테마/루트 API ====================
export const themeApi = {
  // 테마 생성
  create: async (data: ThemeCreateRequest): Promise<Theme> => {
    const response = await api.post<Theme>('/themes', data);
    return response.data;
  },

  // 공개 테마 목록 (정렬: createdAt, viewCount, likeCount)
  getPublic: async (keyword?: string, sort = 'createdAt', page = 0, size = 12): Promise<PageResponse<Theme>> => {
    const response = await api.get<PageResponse<Theme>>('/themes', {
      params: { keyword, sort, page, size },
    });
    return response.data;
  },

  // 내 테마 목록 (페이징)
  getMy: async (page = 0, size = 12): Promise<PageResponse<Theme>> => {
    const response = await api.get<PageResponse<Theme>>('/themes/my', {
      params: { page, size },
    });
    return response.data;
  },

  // 내 테마 목록 (전체)
  getMyAll: async (): Promise<Theme[]> => {
    const response = await api.get<Theme[]>('/themes/my/all');
    return response.data;
  },

  // 인기 테마 TOP 3
  getTop: async (): Promise<Theme[]> => {
    const response = await api.get<Theme[]>('/themes/top');
    return response.data;
  },

  // 테마 상세
  getDetail: async (id: number): Promise<ThemeDetail> => {
    const response = await api.get<ThemeDetail>(`/themes/${id}`);
    return response.data;
  },

  // 테마 수정
  update: async (id: number, data: ThemeUpdateRequest): Promise<Theme> => {
    const response = await api.put<Theme>(`/themes/${id}`, data);
    return response.data;
  },

  // 테마 삭제
  delete: async (id: number): Promise<void> => {
    await api.delete(`/themes/${id}`);
  },

  // 테마에 식당 추가
  addRestaurant: async (themeId: number, data: ThemeAddRestaurantRequest): Promise<ThemeDetail> => {
    const response = await api.post<ThemeDetail>(`/themes/${themeId}/restaurants`, data);
    return response.data;
  },

  // 테마에서 식당 제거
  removeRestaurant: async (themeId: number, restaurantId: number): Promise<ThemeDetail> => {
    const response = await api.delete<ThemeDetail>(`/themes/${themeId}/restaurants/${restaurantId}`);
    return response.data;
  },

  // 식당 순서 변경
  reorderRestaurants: async (themeId: number, data: ThemeReorderRequest): Promise<ThemeDetail> => {
    const response = await api.put<ThemeDetail>(`/themes/${themeId}/restaurants/order`, data);
    return response.data;
  },

  // ========== 좋아요 API ==========
  
  // 테마 좋아요
  like: async (themeId: number): Promise<{ message: string; likeCount: number; isLiked: boolean }> => {
    const response = await api.post<{ message: string; likeCount: number; isLiked: boolean }>(`/themes/${themeId}/like`);
    return response.data;
  },

  // 테마 좋아요 취소
  unlike: async (themeId: number): Promise<{ message: string; likeCount: number; isLiked: boolean }> => {
    const response = await api.delete<{ message: string; likeCount: number; isLiked: boolean }>(`/themes/${themeId}/like`);
    return response.data;
  },

  // 테마 좋아요 여부 확인
  checkLike: async (themeId: number): Promise<{ isLiked: boolean; likeCount: number }> => {
    const response = await api.get<{ isLiked: boolean; likeCount: number }>(`/themes/${themeId}/like`);
    return response.data;
  },

  // 내가 좋아요한 테마 ID 목록
  getMyLikedIds: async (): Promise<number[]> => {
    const response = await api.get<number[]>('/themes/my/liked');
    return response.data;
  },
};

// ========================================
// 검색 API
// ========================================
export interface SearchKeyword {
  id: number;
  keyword: string;
  searchCount: number;
  lastSearchedAt: string;
}

export const searchApi = {
  // 검색어 기록
  record: async (keyword: string): Promise<void> => {
    await api.post('/search/record', { keyword });
  },

  // 인기 검색어 TOP 10
  getPopular: async (): Promise<SearchKeyword[]> => {
    const response = await api.get<SearchKeyword[]>('/search/popular');
    return response.data;
  },

  // 최근 검색어 TOP 10
  getRecent: async (): Promise<SearchKeyword[]> => {
    const response = await api.get<SearchKeyword[]>('/search/recent');
    return response.data;
  },
};

// ========================================
// 신고 API
// ========================================
export type ReportTargetType = 'REVIEW' | 'RESTAURANT' | 'MEMBER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
  reporterId: number;
  reporterNickname: string;
  resolvedById?: number;
  resolvedByNickname?: string;
}

export interface ReportCreateRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  description?: string;
}

export const reportApi = {
  // 신고 생성
  create: async (data: ReportCreateRequest): Promise<Report> => {
    const response = await api.post<Report>('/reports', data);
    return response.data;
  },
};

// ========================================
// 공공데이터 식당 API (지도용)
// ========================================
export interface PublicRestaurantMap {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;
}

export interface PublicRestaurantDetail {
  id: number;
  externalId: string;
  name: string;
  branchName: string | null;
  category: string | null;
  subCategory: string | null;
  sido: string | null;
  sigungu: string | null;
  dong: string | null;
  address: string | null;
  zipcode: string | null;
  buildingName: string | null;
  longitude: number;
  latitude: number;
  detailInfo: string | null;
}

export interface BboxParams {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  centerLat?: number;  // ⭐ 중심점 (클러스터 쏠림 방지)
  centerLng?: number;  // ⭐ 중심점 (클러스터 쏠림 방지)
  category?: string;
  limit?: number;
}

export const publicRestaurantApi = {
  // bbox 영역 내 식당 조회 (지도용)
  getByBbox: async (params: BboxParams): Promise<PublicRestaurantMap[]> => {
    const response = await api.get<PublicRestaurantMap[]>('/public-restaurants/bbox', { params });
    return response.data;
  },

  // 상세 정보 조회
  getDetail: async (id: number): Promise<PublicRestaurantDetail> => {
    const response = await api.get<PublicRestaurantDetail>(`/public-restaurants/${id}`);
    return response.data;
  },

  // 카테고리 목록 조회
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/public-restaurants/categories');
    return response.data;
  },
};

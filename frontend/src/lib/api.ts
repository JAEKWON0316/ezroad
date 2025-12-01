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
} from '@/types';

// ==================== Auth API ====================
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
  getAll: async (page = 0, size = 10): Promise<PageResponse<Review>> => {
    const response = await api.get<PageResponse<Review>>('/reviews', { params: { page, size } });
    return response.data;
  },

  getByRestaurant: async (
    restaurantId: number,
    page = 0,
    size = 10
  ): Promise<PageResponse<Review>> => {
    const response = await api.get<PageResponse<Review>>(`/reviews/restaurant/${restaurantId}`, {
      params: { page, size },
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

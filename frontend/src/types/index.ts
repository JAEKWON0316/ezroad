// User & Auth Types
export interface User {
  id: number;
  email: string;
  name: string;
  nickname: string;
  phone?: string;
  zipcode?: string;
  address?: string;
  addressDetail?: string;
  birthDate?: string;
  profileImage?: string;
  role: 'USER' | 'BUSINESS' | 'ADMIN';
  businessNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone?: string;
  zipcode?: string;
  address?: string;
  addressDetail?: string;
  birthDate?: string;
  businessNumber?: string;
}

// Restaurant Types
export interface Restaurant {
  id: number;
  name: string;
  category: string;
  description?: string;
  phone?: string;
  zipcode?: string;
  address: string;
  addressDetail?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  businessHours?: string;
  notice?: string;
  thumbnail?: string;
  menuBoardImage?: string;
  avgRating: number;
  reviewCount: number;
  viewCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  owner?: User;
  menus?: Menu[];
  createdAt: string;
  updatedAt?: string;
}

export interface RestaurantCreateRequest {
  name: string;
  category: string;
  description?: string;
  phone?: string;
  zipcode?: string;
  address: string;
  addressDetail?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  businessHours?: string;
  thumbnail?: string;
  menuBoardImage?: string;
}

// Menu Types
export interface Menu {
  id: number;
  restaurantId: number;
  name: string;
  price: number;
  description?: string;
  thumbnail?: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MenuCreateRequest {
  restaurantId: number;
  name: string;
  price: number;
  description?: string;
}

// Review Types
export interface Review {
  id: number;
  restaurantId: number;
  memberId: number;
  restaurant?: Restaurant;
  member?: User;
  title?: string;
  content: string;
  rating: number;
  viewCount: number;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
}

// Member Type (alias for User in follow context)
export type Member = User;

export interface ReviewImage {
  id: number;
  reviewId: number;
  imageUrl: string;
  sortOrder: number;
}

export interface ReviewCreateRequest {
  restaurantId: number;
  title?: string;
  content: string;
  rating: number;
  images?: string[];
}

// Reservation Types
export interface Reservation {
  id: number;
  restaurantId: number;
  restaurant?: Restaurant;
  member?: User;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  request?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt?: string;
}

export interface ReservationCreateRequest {
  restaurantId: number;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  request?: string;
}

// Waiting Types
export interface Waiting {
  id: number;
  restaurantId: number;
  restaurant?: Restaurant;
  member?: User;
  partySize: number;
  waitingNumber: number;
  estimatedWaitTime?: number;
  status: 'WAITING' | 'CALLED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  updatedAt?: string;
}

// Follow Types
export interface Follow {
  id: number;
  followerId: number;
  followingId?: number;
  restaurantId?: number;
  restaurant?: Restaurant;
  following?: User;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Stats Types
export interface MemberStats {
  reviewCount: number;
  followerCount: number;
  followingCount: number;
}

// Search/Filter Types
export interface RestaurantFilter {
  keyword?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sort?: 'avgRating' | 'reviewCount' | 'createdAt' | 'distance';
  page?: number;
  size?: number;
}

// Mapping Types
export interface Mapping {
  id: number;
  memberId: number;
  restaurantId?: number;
  restaurant?: Restaurant;
  title?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

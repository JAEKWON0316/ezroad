// 챗봇 관련 타입 정의

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  // 추가 데이터 (추천 결과, 액션 버튼 등)
  data?: ChatMessageData;
}

export interface ChatMessageData {
  type: 'text' | 'course' | 'restaurants' | 'reservation' | 'waiting' | 'action';
  restaurants?: RestaurantRecommendation[];
  course?: CourseRecommendation;
  reservation?: ReservationInfo;
  waiting?: WaitingInfo;
  actions?: ActionButton[];
}

export interface RestaurantRecommendation {
  id: number;
  name: string;
  category: string;
  address: string;
  avgRating: number;
  reviewCount: number;
  thumbnail?: string;
  distance?: number; // km
  priceRange?: string;
  description?: string;
}

export interface CourseRecommendation {
  title: string;
  description: string;
  totalDistance: number; // km
  estimatedTime: number; // minutes
  spots: CourseSpot[];
}

export interface CourseSpot {
  order: number;
  type: 'lunch' | 'cafe' | 'dinner' | 'bar' | 'activity';
  restaurant: RestaurantRecommendation;
  suggestedTime: string; // "12:00"
  walkingTimeToNext?: number; // minutes
  distanceToNext?: number; // meters
}

export interface ReservationInfo {
  id: number;
  restaurantId: number;
  restaurantName: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  request?: string;
}

export interface WaitingInfo {
  id: number;
  restaurantId: number;
  restaurantName: string;
  waitingNumber: number;
  teamAhead: number;
  estimatedWaitTime: number; // minutes
  status: 'WAITING' | 'CALLED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW';
}

export interface ActionButton {
  type: 'link' | 'action';
  label: string;
  url?: string;
  action?: string;
  variant?: 'primary' | 'secondary' | 'link';
}

// 사용자 컨텍스트
export interface UserContext {
  isLoggedIn: boolean;
  userId?: number;
  userName?: string;
  
  // 예약 상태
  hasActiveReservation: boolean;
  reservations?: ReservationInfo[];
  
  // 대기 상태
  hasActiveWaiting: boolean;
  waitings?: WaitingInfo[];
  
  // 대화 컨텍스트
  lastRecommendedRestaurants?: RestaurantRecommendation[];
}

// Function Calling 파라미터
export interface RecommendCourseParams {
  location: string;
  situation?: 'date' | 'friends' | 'family' | 'solo' | 'business';
  meal_types?: ('lunch' | 'cafe' | 'dinner' | 'bar')[];
  preferences?: string;
}

export interface RecommendRestaurantParams {
  location: string;
  category?: string;
  mood?: string;
  price_range?: 'cheap' | 'moderate' | 'expensive';
}

export interface NavigateToReservationParams {
  restaurant_id?: number;
  restaurant_name?: string;
  action: 'create' | 'cancel' | 'modify';
}

// API 응답
export interface ChatApiResponse {
  message: string;
  data?: ChatMessageData;
}

// 지오코딩 결과
export interface GeocodingResult {
  lat: number;
  lng: number;
  address: string;
}

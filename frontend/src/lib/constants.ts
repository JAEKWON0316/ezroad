// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 카카오맵 API 키
export const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY || '';

// 카테고리 목록
export const CATEGORIES = [
  { value: '', label: '전체' },
  { value: '한식', label: '한식' },
  { value: '중식', label: '중식' },
  { value: '일식', label: '일식' },
  { value: '양식', label: '양식' },
  { value: '카페', label: '카페/디저트' },
  { value: '패스트푸드', label: '패스트푸드' },
  { value: '술집', label: '술집' },
  { value: '기타', label: '기타' },
] as const;

// 정렬 옵션
export const SORT_OPTIONS = [
  { value: 'createdAt', label: '최신순' },
  { value: 'rating', label: '평점순' },
  { value: 'reviewCount', label: '리뷰많은순' },
  { value: 'distance', label: '거리순' },
] as const;

// 예약 상태
export const RESERVATION_STATUS = {
  PENDING: { label: '대기중', color: 'yellow' },
  CONFIRMED: { label: '확정', color: 'green' },
  CANCELLED: { label: '취소됨', color: 'gray' },
  COMPLETED: { label: '완료', color: 'blue' },
} as const;

// 대기 상태
export const WAITING_STATUS = {
  WAITING: { label: '대기중', color: 'yellow' },
  CALLED: { label: '호출됨', color: 'orange' },
  SEATED: { label: '착석', color: 'green' },
  CANCELLED: { label: '취소됨', color: 'gray' },
  NO_SHOW: { label: '노쇼', color: 'red' },
} as const;

// 회원 역할
export const MEMBER_ROLES = {
  USER: '일반 회원',
  BUSINESS: '사업자',
  ADMIN: '관리자',
} as const;

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_PAGE = 0;

// 파일 업로드 제한
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_IMAGES_PER_REVIEW = 5;

// 시간 슬롯 (예약용)
export const TIME_SLOTS = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00',
] as const;

// 지도 기본 설정
export const DEFAULT_MAP_CENTER = {
  lat: 37.5665, // 서울 시청
  lng: 126.978,
};
export const DEFAULT_MAP_LEVEL = 5;
export const DEFAULT_SEARCH_RADIUS = 3000; // 3km

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  RECENT_SEARCHES: 'recentSearches',
  THEME: 'theme',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 정보를 찾을 수 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  VALIDATION_ERROR: '입력 정보를 확인해주세요.',
} as const;

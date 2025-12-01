import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS 클래스 병합 유틸리티
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 가격 포맷팅 (원화)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

// 날짜 포맷팅
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// 시간 포맷팅
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? '오후' : '오전';
  const displayHour = hour % 12 || 12;
  return `${ampm} ${displayHour}:${minutes}`;
}

// 날짜+시간 포맷팅
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// 상대적 시간 표시 (몇 분 전, 몇 시간 전 등)
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  } else {
    return formatDate(dateString);
  }
}

// 별점을 별 문자로 변환
export function formatRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}

// 전화번호 포맷팅
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// 텍스트 자르기
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// 이메일 유효성 검사
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 비밀번호 유효성 검사 (최소 8자, 영문+숫자)
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}

// 사업자등록번호 유효성 검사
export function isValidBusinessNumber(number: string): boolean {
  const cleaned = number.replace(/\D/g, '');
  return cleaned.length === 10;
}

// 쿼리스트링 생성
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// 로컬 스토리지 헬퍼
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// 디바운스 함수
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// 이미지 URL 처리 (CDN 또는 기본 이미지)
export function getImageUrl(url?: string, defaultImage = '/images/default-restaurant.jpg'): string {
  if (!url) return defaultImage;
  if (url.startsWith('http')) return url;
  return url;
}

// 카테고리 한글 변환
export const categoryLabels: Record<string, string> = {
  korean: '한식',
  japanese: '일식',
  chinese: '중식',
  western: '양식',
  cafe: '카페/디저트',
  fastfood: '패스트푸드',
  pub: '술집',
  etc: '기타',
};

export function getCategoryLabel(category: string): string {
  return categoryLabels[category.toLowerCase()] || category;
}

// 예약 상태 한글 변환
export const reservationStatusLabels: Record<string, string> = {
  PENDING: '대기중',
  CONFIRMED: '확정',
  CANCELLED: '취소됨',
  COMPLETED: '완료',
};

export function getReservationStatusLabel(status: string): string {
  return reservationStatusLabels[status] || status;
}

// 대기 상태 한글 변환
export const waitingStatusLabels: Record<string, string> = {
  WAITING: '대기중',
  CALLED: '호출됨',
  SEATED: '착석',
  CANCELLED: '취소됨',
  NO_SHOW: '노쇼',
};

export function getWaitingStatusLabel(status: string): string {
  return waitingStatusLabels[status] || status;
}

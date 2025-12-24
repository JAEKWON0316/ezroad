import { Notification } from '@/context/NotificationContext';

// 알림 타입별 아이콘 반환
export function getNotificationIcon(type: string): string {
    switch (type) {
        case 'RESERVATION_NEW': return '📅';
        case 'RESERVATION_CONFIRMED': return '✅';
        case 'RESERVATION_CANCELLED': return '❌';
        case 'RESERVATION_COMPLETED': return '🎉';
        case 'WAITING_NEW': return '⏳';
        case 'WAITING_CALLED': return '🔔';
        case 'WAITING_CANCELLED': return '🚫';
        case 'NEW_FOLLOWER': return '👋';
        case 'NEW_REVIEW': return '💬';
        default: return '📢';
    }
}

// 알림 클릭 시 이동할 URL 반환
export function getNotificationUrl(notification: Notification): string | null {
    // 1. 직접 링크가 있는 경우 (가장 우선)
    if (notification.linkUrl) {
        // 파트너 관련 URL 보정 (예: 특정 ID가 누락된 경우 대시보드로 이동)
        if (notification.linkUrl === '/partner/reservations' || notification.linkUrl === '/partner/waitings') {
            return '/partner'; // 파트너 메인/대시보드로 안내하여 적절한 탭을 찾도록 유도
        }
        return notification.linkUrl;
    }

    // 2. 참조 정보를 기반으로 생성
    if (!notification.referenceType || !notification.referenceId) {
        return null;
    }

    switch (notification.referenceType) {
        case 'RESERVATION':
            // 일반 회원은 마이페이지 예약 내역으로
            // 파트너(가게 주인)일 수 있으나, 현재 프론트엔드에서는 
            // 알림 객체만으로 사용자가 파트너인지 구분하기 어려울 수 있음.
            // 보통 알림을 보낼 때 linkUrl에 정확한 타겟을 넣어주는 것이 가장 좋음.
            // 백업 로직으로 기본 마이페이지로 이동.
            return '/mypage/reservations';

        case 'WAITING':
            return '/mypage/waitings';

        case 'REVIEW':
            return `/reviews/${notification.referenceId}`;

        case 'RESTAURANT':
            return `/restaurants/${notification.referenceId}`;

        case 'MEMBER':
            return `/mypage/followers`;

        case 'THEME':
            return `/themes/${notification.referenceId}`;

        default:
            return null;
    }
}

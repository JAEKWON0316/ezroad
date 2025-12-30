import { ReservationInfo, ActionButton } from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.106.186.205:8080/api';

interface ReservationHandlerResult {
  message: string;
  reservations: ReservationInfo[];
  actions: ActionButton[];
}

// 예약 상태 한글 변환
const STATUS_TEXT: Record<string, string> = {
  PENDING: '대기중',
  CONFIRMED: '확정됨',
  CANCELLED: '취소됨',
  COMPLETED: '완료됨',
};

const STATUS_EMOJI: Record<string, string> = {
  PENDING: '⏳',
  CONFIRMED: '✅',
  CANCELLED: '❌',
  COMPLETED: '✔️',
};

// 날짜 포맷팅
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}

export async function handleGetReservationStatus(
  token?: string,
  includePast: boolean = false
): Promise<ReservationHandlerResult> {
  // 1. 로그인 체크
  if (!token) {
    return {
      message: '예약 상태를 확인하려면 로그인이 필요해요! 🔐\n\n로그인 후 다시 물어봐주세요!',
      reservations: [],
      actions: [
        { type: 'link', label: '로그인하기', url: '/login', variant: 'primary' },
      ],
    };
  }

  try {
    // 2. 예약 목록 조회 API 호출
    const response = await fetch(`${API_URL}/reservations/my`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          message: '로그인이 만료되었어요 🔐\n다시 로그인해주세요!',
          reservations: [],
          actions: [
            { type: 'link', label: '로그인하기', url: '/login', variant: 'primary' },
          ],
        };
      }
      throw new Error('Failed to fetch reservations');
    }

    const data = await response.json();
    const allReservations = data.content || data || [];

    // 3. 활성 예약만 필터링 (옵션에 따라)
    const reservations: ReservationInfo[] = allReservations
      .filter((r: { status: string }) => {
        if (includePast) return true;
        return ['PENDING', 'CONFIRMED'].includes(r.status);
      })
      .map((r: { id: number; restaurant?: { id: number; name: string }; restaurantId?: number; restaurantName?: string; reservationDate: string; reservationTime: string; guestCount: number; status: string; request?: string }) => ({
        id: r.id,
        restaurantId: r.restaurant?.id || r.restaurantId,
        restaurantName: r.restaurant?.name || r.restaurantName || '식당',
        reservationDate: r.reservationDate,
        reservationTime: r.reservationTime,
        guestCount: r.guestCount,
        status: r.status,
        request: r.request,
      }));

    // 4. 예약 없음
    if (reservations.length === 0) {
      return {
        message: '현재 등록된 예약이 없어요 😊\n\n맛집 예약을 도와드릴까요?',
        reservations: [],
        actions: [
          { type: 'action', label: '맛집 추천받기', action: 'recommend', variant: 'primary' },
          { type: 'link', label: '맛집 둘러보기', url: '/restaurants', variant: 'secondary' },
        ],
      };
    }

    // 5. 모든 예약 보여주기
    let message = `현재 예약 상태 확인했어요! 📋\n\n`;
    message += `총 **${reservations.length}건**의 예약이 있어요!\n\n`;

    // 각 예약 정보 표시
    reservations.forEach((reservation, index) => {
      const emoji = STATUS_EMOJI[reservation.status] || '📌';
      message += `**${index + 1}. ${reservation.restaurantName}**\n`;
      message += `   📅 ${formatDate(reservation.reservationDate)} ${reservation.reservationTime}\n`;
      message += `   👥 ${reservation.guestCount}명 | ${emoji} ${STATUS_TEXT[reservation.status] || reservation.status}`;
      
      if (reservation.request) {
        message += `\n   📝 ${reservation.request}`;
      }
      
      if (index < reservations.length - 1) {
        message += '\n\n';
      }
    });

    message += '\n\n예약 변경이나 취소가 필요하시면 말씀해주세요!';

    return {
      message,
      reservations,
      actions: [
        { type: 'link', label: '예약 관리하기', url: '/mypage/reservations', variant: 'primary' },
      ],
    };
  } catch (error) {
    console.error('Reservation status error:', error);
    return {
      message: '예약 정보를 가져오는 중 오류가 발생했어요 😅\n잠시 후 다시 시도해주세요!',
      reservations: [],
      actions: [
        { type: 'link', label: '내 예약 페이지로', url: '/mypage/reservations', variant: 'secondary' },
      ],
    };
  }
}

export default handleGetReservationStatus;

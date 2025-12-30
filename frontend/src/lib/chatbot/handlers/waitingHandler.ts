import { WaitingInfo, ActionButton } from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.106.186.205:8080/api';

interface WaitingHandlerResult {
  message: string;
  waitings: WaitingInfo[];
  actions: ActionButton[];
}

// 대기 상태 한글 변환
const STATUS_TEXT: Record<string, string> = {
  WAITING: '대기중',
  CALLED: '호출됨',
  SEATED: '착석완료',
  CANCELLED: '취소됨',
  NO_SHOW: '노쇼',
};

const STATUS_EMOJI: Record<string, string> = {
  WAITING: '⏳',
  CALLED: '🔔',
  SEATED: '✅',
  CANCELLED: '❌',
  NO_SHOW: '😢',
};

export async function handleGetWaitingStatus(
  token?: string
): Promise<WaitingHandlerResult> {
  // 1. 로그인 체크
  if (!token) {
    return {
      message: '대기 상태를 확인하려면 로그인이 필요해요! 🔐\n\n로그인 후 다시 물어봐주세요!',
      waitings: [],
      actions: [
        { type: 'link', label: '로그인하기', url: '/login', variant: 'primary' },
      ],
    };
  }

  try {
    // 2. 대기 목록 조회 API 호출
    const response = await fetch(`${API_URL}/waitings/my`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          message: '로그인이 만료되었어요 🔐\n다시 로그인해주세요!',
          waitings: [],
          actions: [
            { type: 'link', label: '로그인하기', url: '/login', variant: 'primary' },
          ],
        };
      }
      throw new Error('Failed to fetch waitings');
    }

    const data = await response.json();
    const allWaitings = data.content || data || [];

    // 3. 활성 대기만 필터링
    const waitings: WaitingInfo[] = allWaitings
      .filter((w: { status: string }) => ['WAITING', 'CALLED'].includes(w.status))
      .map((w: { id: number; restaurant?: { id: number; name: string }; restaurantId?: number; restaurantName?: string; waitingNumber: number; teamAhead?: number; estimatedWaitTime?: number; status: string }) => ({
        id: w.id,
        restaurantId: w.restaurant?.id || w.restaurantId,
        restaurantName: w.restaurant?.name || w.restaurantName || '식당',
        waitingNumber: w.waitingNumber,
        teamAhead: w.teamAhead || 0,
        estimatedWaitTime: w.estimatedWaitTime || 0,
        status: w.status,
      }));

    // 4. 대기 없음
    if (waitings.length === 0) {
      return {
        message: '현재 대기중인 곳이 없어요 😊\n\n맛집 웨이팅을 등록하시겠어요?',
        waitings: [],
        actions: [
          { type: 'link', label: '맛집 둘러보기', url: '/restaurants', variant: 'primary' },
        ],
      };
    }

    // 5. 호출된 대기가 있는지 확인
    const calledWaitings = waitings.filter(w => w.status === 'CALLED');
    const pendingWaitings = waitings.filter(w => w.status === 'WAITING');

    let message = '';

    // 호출된 대기가 있으면 먼저 알림
    if (calledWaitings.length > 0) {
      message += `🔔 **호출되었어요!** 지금 바로 입장해주세요!\n\n`;
      calledWaitings.forEach((waiting, index) => {
        message += `**${index + 1}. ${waiting.restaurantName}**\n`;
        message += `   🎫 대기번호: #${waiting.waitingNumber}\n`;
        if (index < calledWaitings.length - 1) message += '\n';
      });
      
      if (pendingWaitings.length > 0) {
        message += '\n\n---\n\n';
      }
    }

    // 대기중인 목록 표시
    if (pendingWaitings.length > 0) {
      if (calledWaitings.length === 0) {
        message += `현재 대기 상태 확인했어요! ⏳\n\n`;
      }
      message += `총 **${pendingWaitings.length}곳**에서 대기중이에요!\n\n`;

      pendingWaitings.forEach((waiting, index) => {
        message += `**${index + 1}. ${waiting.restaurantName}**\n`;
        message += `   🎫 대기번호: #${waiting.waitingNumber}\n`;
        message += `   👥 내 앞 대기: ${waiting.teamAhead}팀`;
        
        if (waiting.estimatedWaitTime > 0) {
          message += ` | ⏱️ 약 ${waiting.estimatedWaitTime}분`;
        }
        
        if (index < pendingWaitings.length - 1) {
          message += '\n\n';
        }
      });

      message += '\n\n호출되면 바로 알려드릴게요! 😊';
    }

    return {
      message,
      waitings,
      actions: [
        { type: 'link', label: '대기 관리하기', url: '/mypage/waitings', variant: 'primary' },
      ],
    };
  } catch (error) {
    console.error('Waiting status error:', error);
    return {
      message: '대기 정보를 가져오는 중 오류가 발생했어요 😅\n잠시 후 다시 시도해주세요!',
      waitings: [],
      actions: [
        { type: 'link', label: '내 대기 페이지로', url: '/mypage/waitings', variant: 'secondary' },
      ],
    };
  }
}

export default handleGetWaitingStatus;

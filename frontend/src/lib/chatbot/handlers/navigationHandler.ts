import { NavigateToReservationParams, ActionButton, RestaurantRecommendation } from '@/types/chat';

interface NavigationHandlerResult {
  message: string;
  actions: ActionButton[];
}

export async function handleNavigateToReservation(
  params: NavigateToReservationParams,
  lastRecommendedRestaurants?: RestaurantRecommendation[]
): Promise<NavigationHandlerResult> {
  const { action, restaurant_id, restaurant_name } = params;

  // 새 예약 생성
  if (action === 'create') {
    // 특정 식당 ID가 있는 경우
    if (restaurant_id) {
      return {
        message: `${restaurant_name || '해당 식당'} 예약 페이지로 안내해드릴게요! 🍽️\n\n예약하시려면 아래 버튼을 클릭해주세요!`,
        actions: [
          { 
            type: 'link', 
            label: '예약하러 가기 →', 
            url: `/reservations/new?restaurantId=${restaurant_id}`,
            variant: 'primary'
          },
          {
            type: 'link',
            label: '가게 정보 보기',
            url: `/restaurants/${restaurant_id}`,
            variant: 'secondary'
          }
        ],
      };
    }

    // 최근 추천한 식당이 있는 경우
    if (lastRecommendedRestaurants && lastRecommendedRestaurants.length > 0) {
      const firstRestaurant = lastRecommendedRestaurants[0];
      return {
        message: `어떤 가게를 예약하시겠어요? 🤔\n\n방금 추천해드린 가게들이에요:`,
        actions: lastRecommendedRestaurants.slice(0, 3).map((r) => ({
          type: 'link' as const,
          label: `${r.name} 예약`,
          url: `/reservations/new?restaurantId=${r.id}`,
          variant: 'secondary' as const,
        })),
      };
    }

    // 아무 정보도 없는 경우
    return {
      message: `예약하고 싶은 맛집이 있으신가요? 🍽️\n\n먼저 맛집을 찾아볼까요?`,
      actions: [
        { type: 'link', label: '맛집 둘러보기', url: '/restaurants', variant: 'primary' },
        { type: 'action', label: '맛집 추천받기', action: 'recommend', variant: 'secondary' },
      ],
    };
  }

  // 예약 취소
  if (action === 'cancel') {
    return {
      message: `예약 취소를 원하시는군요 😢\n\n내 예약 페이지에서 취소하실 수 있어요.`,
      actions: [
        { type: 'link', label: '내 예약 보기', url: '/mypage/reservations', variant: 'primary' },
      ],
    };
  }

  // 예약 변경
  if (action === 'modify') {
    return {
      message: `예약 변경을 원하시는군요 📝\n\n내 예약 페이지에서 변경하실 수 있어요.\n\n⚠️ 일부 변경은 취소 후 재예약이 필요할 수 있어요.`,
      actions: [
        { type: 'link', label: '내 예약 보기', url: '/mypage/reservations', variant: 'primary' },
      ],
    };
  }

  // 기본 응답
  return {
    message: `예약과 관련해서 도움이 필요하시면 말씀해주세요! 😊`,
    actions: [
      { type: 'link', label: '맛집 둘러보기', url: '/restaurants', variant: 'secondary' },
    ],
  };
}

export default handleNavigateToReservation;

import { RestaurantRecommendation, RecommendRestaurantParams, ActionButton } from '@/types/chat';
import { geocodeLocation, calculateDistance } from '../geocode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.106.186.205:8080/api';

interface RestaurantHandlerResult {
  message: string;
  restaurants: RestaurantRecommendation[];
  actions: ActionButton[];
}

export async function handleRecommendRestaurant(
  params: RecommendRestaurantParams
): Promise<RestaurantHandlerResult> {
  try {
    // 1. 지역 좌표 변환
    const location = await geocodeLocation(params.location);
    
    if (!location) {
      return {
        message: `"${params.location}" 지역을 찾을 수 없어요 😅\n다른 지역명으로 다시 말씀해주세요!`,
        restaurants: [],
        actions: [],
      };
    }

    // 2. API에서 식당 목록 가져오기
    const queryParams = new URLSearchParams({
      page: '0',
      size: '10',
      sort: 'avgRating,desc',
    });

    if (params.category) {
      queryParams.append('category', params.category);
    }

    const response = await fetch(`${API_URL}/restaurants?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();
    const allRestaurants = data.content || data || [];

    // 3. 거리 계산 및 필터링 (반경 3km 이내)
    const restaurantsWithDistance = allRestaurants
      .filter((r: { latitude?: number; longitude?: number }) => r.latitude && r.longitude)
      .map((r: { id: number; name: string; category: string; address: string; avgRating?: number; reviewCount?: number; thumbnail?: string; description?: string; latitude: number; longitude: number }) => {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          r.latitude,
          r.longitude
        );
        return {
          id: r.id,
          name: r.name,
          category: r.category,
          address: r.address,
          avgRating: r.avgRating || 0,
          reviewCount: r.reviewCount || 0,
          thumbnail: r.thumbnail,
          description: r.description,
          distance,
        };
      })
      .filter((r: { distance: number }) => r.distance <= 3) // 3km 이내
      .sort((a: { avgRating: number }, b: { avgRating: number }) => b.avgRating - a.avgRating)
      .slice(0, 5); // 상위 5개

    if (restaurantsWithDistance.length === 0) {
      return {
        message: `${params.location} 근처에서 조건에 맞는 맛집을 찾지 못했어요 😢\n다른 지역이나 조건으로 다시 검색해볼까요?`,
        restaurants: [],
        actions: [
          { type: 'action', label: '전체 맛집 보기', url: '/restaurants', variant: 'secondary' },
        ],
      };
    }

    // 4. 응답 메시지 생성
    const categoryText = params.category ? ` ${params.category}` : '';
    const moodText = params.mood ? ` ${params.mood}` : '';
    
    const message = `${params.location} 근처${categoryText}${moodText} 맛집 찾아봤어요! 🍽️\n\n` +
      restaurantsWithDistance.map((r: RestaurantRecommendation, i: number) => 
        `${i + 1}️⃣ **${r.name}** ⭐${r.avgRating.toFixed(1)}\n` +
        `   📍 ${r.address} (${r.distance ? r.distance.toFixed(1) : '?'}km)\n` +
        `   💬 리뷰 ${r.reviewCount}개`
      ).join('\n\n') +
      '\n\n더 자세한 정보나 예약이 필요하시면 말씀해주세요! 😊';

    const actions: ActionButton[] = restaurantsWithDistance.slice(0, 3).map((r: RestaurantRecommendation) => ({
      type: 'link' as const,
      label: `${r.name} 보기`,
      url: `/restaurants/${r.id}`,
      variant: 'secondary' as const,
    }));

    return {
      message,
      restaurants: restaurantsWithDistance,
      actions,
    };
  } catch (error) {
    console.error('Restaurant recommendation error:', error);
    return {
      message: '맛집을 찾는 중 오류가 발생했어요 😅\n잠시 후 다시 시도해주세요!',
      restaurants: [],
      actions: [],
    };
  }
}

export default handleRecommendRestaurant;

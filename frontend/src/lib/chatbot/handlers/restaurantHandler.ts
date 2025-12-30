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
    // 1. API에서 식당 목록 가져오기
    const queryParams = new URLSearchParams({
      page: '0',
      size: '50',
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

    // 2. 지역 좌표 변환 시도
    const location = await geocodeLocation(params.location);
    
    let filteredRestaurants: RestaurantRecommendation[] = [];

    if (location) {
      // 좌표 기반 검색 (반경 5km)
      filteredRestaurants = allRestaurants
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
        .filter((r: { distance: number }) => r.distance <= 5)
        .sort((a: { avgRating: number }, b: { avgRating: number }) => b.avgRating - a.avgRating);
    }

    // 3. 좌표 검색 결과가 없으면 주소 키워드로 fallback
    if (filteredRestaurants.length === 0) {
      const searchKeyword = params.location.replace(/역|구|동|시/g, '').trim();
      
      filteredRestaurants = allRestaurants
        .filter((r: { address?: string }) => {
          if (!r.address) return false;
          return r.address.includes(params.location) || 
                 r.address.includes(searchKeyword) ||
                 r.address.toLowerCase().includes(searchKeyword.toLowerCase());
        })
        .map((r: { id: number; name: string; category: string; address: string; avgRating?: number; reviewCount?: number; thumbnail?: string; description?: string }) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          address: r.address,
          avgRating: r.avgRating || 0,
          reviewCount: r.reviewCount || 0,
          thumbnail: r.thumbnail,
          description: r.description,
          distance: 0,
        }))
        .sort((a: { avgRating: number }, b: { avgRating: number }) => b.avgRating - a.avgRating);
    }

    // 상위 5개만
    filteredRestaurants = filteredRestaurants.slice(0, 5);

    if (filteredRestaurants.length === 0) {
      return {
        message: `${params.location} 근처에서 조건에 맞는 맛집을 찾지 못했어요 😢\n다른 지역이나 조건으로 다시 검색해볼까요?`,
        restaurants: [],
        actions: [
          { type: 'link', label: '전체 맛집 보기', url: '/restaurants', variant: 'secondary' },
        ],
      };
    }

    // 4. 응답 메시지 생성 (가게명에 링크 포함 - 마크다운 형식)
    const categoryText = params.category ? ` ${params.category}` : '';
    const moodText = params.mood ? ` ${params.mood}` : '';
    
    const message = `${params.location} 근처${categoryText}${moodText} 맛집 찾아봤어요! 🍽️\n\n` +
      filteredRestaurants.map((r: RestaurantRecommendation, i: number) => {
        const distanceText = r.distance && r.distance > 0 ? ` (${r.distance.toFixed(1)}km)` : '';
        return `${i + 1}️⃣ **[${r.name}](/restaurants/${r.id})** ⭐${r.avgRating.toFixed(1)}\n` +
          `   📍 ${r.address}${distanceText}\n` +
          `   💬 리뷰 ${r.reviewCount}개`;
      }).join('\n\n') +
      '\n\n가게 이름을 클릭하면 상세 정보를 볼 수 있어요! 😊';

    // 액션 버튼 제거 (가게명 클릭으로 대체)
    return {
      message,
      restaurants: filteredRestaurants,
      actions: [],
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

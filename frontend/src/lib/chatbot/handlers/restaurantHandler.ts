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
    // 1. API에서 식당 목록 가져오기 (카테고리 필터 제거 - 직접 필터링)
    const queryParams = new URLSearchParams({
      page: '0',
      size: '100',
      sort: 'avgRating,desc',
    });

    const response = await fetch(`${API_URL}/restaurants?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();
    let allRestaurants = data.content || data || [];

    // 카테고리/음식 종류 필터링 (유연하게)
    if (params.category) {
      const categoryKeywords = getCategoryKeywords(params.category);
      allRestaurants = allRestaurants.filter((r: { category?: string; name?: string }) => {
        const cat = (r.category || '').toLowerCase();
        const name = (r.name || '').toLowerCase();
        return categoryKeywords.some(kw => cat.includes(kw) || name.includes(kw));
      });
    }

    // 2. 지역 좌표 변환 시도
    const location = await geocodeLocation(params.location);
    
    let filteredRestaurants: RestaurantRecommendation[] = [];

    if (location) {
      // 좌표 기반 검색 (반경 5km)
      filteredRestaurants = allRestaurants
        .filter((r: { latitude?: number | string; longitude?: number | string }) => r.latitude && r.longitude)
        .map((r: { id: number; name: string; category: string; address: string; avgRating?: number; reviewCount?: number; thumbnail?: string; description?: string; latitude: number | string; longitude: number | string }) => {
          const lat = typeof r.latitude === 'string' ? parseFloat(r.latitude) : r.latitude;
          const lng = typeof r.longitude === 'string' ? parseFloat(r.longitude) : r.longitude;
          const distance = calculateDistance(location.lat, location.lng, lat, lng);
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
      // 여러 키워드로 검색 (원본 + 정제된 버전)
      const searchKeywords = getLocationKeywords(params.location);
      
      filteredRestaurants = allRestaurants
        .filter((r: { address?: string }) => {
          if (!r.address) return false;
          const addr = r.address.toLowerCase();
          return searchKeywords.some(kw => addr.includes(kw.toLowerCase()));
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

    // 4. 응답 메시지 생성
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

// 카테고리 키워드 매핑 (버거 → 패스트푸드, 버거 등)
function getCategoryKeywords(category: string): string[] {
  const cat = category.toLowerCase();
  const mapping: Record<string, string[]> = {
    '버거': ['버거', '패스트푸드', 'burger', '햄버거'],
    '햄버거': ['버거', '패스트푸드', 'burger', '햄버거'],
    '피자': ['피자', '양식', 'pizza', '이탈리안'],
    '치킨': ['치킨', '패스트푸드', 'chicken'],
    '파스타': ['파스타', '양식', '이탈리안', 'pasta'],
    '스테이크': ['스테이크', '양식', 'steak'],
    '초밥': ['초밥', '일식', '스시', 'sushi'],
    '라멘': ['라멘', '일식', 'ramen'],
    '짜장면': ['짜장', '중식', '중화'],
    '짬뽕': ['짬뽕', '중식', '중화'],
    '쌀국수': ['쌀국수', '베트남', '아시안', '동남아'],
    '커피': ['카페', '커피', 'cafe', 'coffee'],
    '디저트': ['카페', '디저트', '베이커리', 'dessert'],
  };

  // 매핑에 있으면 해당 키워드들 반환
  for (const [key, keywords] of Object.entries(mapping)) {
    if (cat.includes(key)) {
      return keywords;
    }
  }

  // 없으면 원본 그대로
  return [cat];
}

// 지역 키워드 생성 (중구 → ['중구', '중'])
function getLocationKeywords(location: string): string[] {
  const keywords = [location];
  
  // "서울 중구" → ["서울 중구", "서울", "중구"]
  const parts = location.split(/\s+/);
  keywords.push(...parts);
  
  // "중구" → ["중구"] (구, 동, 역 제거하지 않음 - 원본 유지)
  // 추가로 "명동", "강남" 등 세부 지역명도 검색
  const subLocations: Record<string, string[]> = {
    '중구': ['중구', '명동', '을지로', '충무로'],
    '강남': ['강남', '역삼', '삼성', '테헤란'],
    '홍대': ['홍대', '상수', '합정', '연남'],
    '마포': ['마포', '홍대', '연남', '상수', '합정'],
    '이태원': ['이태원', '한남', '녹사평'],
    '신촌': ['신촌', '이대', '홍대'],
  };

  for (const [key, values] of Object.entries(subLocations)) {
    if (location.includes(key)) {
      keywords.push(...values);
    }
  }

  return [...new Set(keywords)]; // 중복 제거
}

export default handleRecommendRestaurant;

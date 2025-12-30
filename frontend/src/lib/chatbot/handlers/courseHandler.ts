import { 
  CourseRecommendation, 
  CourseSpot, 
  RecommendCourseParams, 
  ActionButton,
  RestaurantRecommendation 
} from '@/types/chat';
import { geocodeLocation, calculateDistance, estimateWalkingTime } from '../geocode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.106.186.205:8080/api';

interface CourseHandlerResult {
  message: string;
  course: CourseRecommendation | null;
  actions: ActionButton[];
}

// 카테고리별 시간대 매핑
const MEAL_TYPE_CONFIG: Record<string, { categories: string[]; time: string; emoji: string }> = {
  lunch: { categories: ['한식', '양식', '일식', '중식', '분식'], time: '12:00', emoji: '🍽️' },
  cafe: { categories: ['카페', '디저트'], time: '14:30', emoji: '☕' },
  dinner: { categories: ['한식', '양식', '일식', '중식', '고기'], time: '18:00', emoji: '🍴' },
  bar: { categories: ['술집', '바', '이자카야'], time: '20:30', emoji: '🍺' },
};

// 상황별 기본 코스 구성
const SITUATION_DEFAULTS: Record<string, string[]> = {
  date: ['lunch', 'cafe', 'dinner'],
  friends: ['lunch', 'cafe', 'bar'],
  family: ['lunch', 'cafe'],
  solo: ['lunch', 'cafe'],
  business: ['lunch'],
};

export async function handleRecommendCourse(
  params: RecommendCourseParams
): Promise<CourseHandlerResult> {
  try {
    // 1. 지역 좌표 변환
    const location = await geocodeLocation(params.location);
    
    if (!location) {
      return {
        message: `"${params.location}" 지역을 찾을 수 없어요 😅\n다른 지역명으로 다시 말씀해주세요!`,
        course: null,
        actions: [],
      };
    }

    // 2. 코스 구성 결정
    const mealTypes = params.meal_types?.length 
      ? params.meal_types 
      : SITUATION_DEFAULTS[params.situation || 'date'];

    // 3. API에서 식당 목록 가져오기
    const response = await fetch(`${API_URL}/restaurants?page=0&size=50&sort=avgRating,desc`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();
    const allRestaurants = data.content || data || [];

    // 4. 거리 계산 및 카테고리별 분류
    interface RestaurantWithDistance extends RestaurantRecommendation {
      latitude: number;
      longitude: number;
    }
    
    const restaurantsWithDistance: RestaurantWithDistance[] = allRestaurants
      .filter((r: { latitude?: number; longitude?: number }) => r.latitude && r.longitude)
      .map((r: { id: number; name: string; category: string; address: string; avgRating?: number; reviewCount?: number; thumbnail?: string; description?: string; latitude: number; longitude: number }) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        address: r.address,
        avgRating: r.avgRating || 0,
        reviewCount: r.reviewCount || 0,
        thumbnail: r.thumbnail,
        description: r.description,
        latitude: r.latitude,
        longitude: r.longitude,
        distance: calculateDistance(location.lat, location.lng, r.latitude, r.longitude),
      }))
      .filter((r: { distance: number }) => r.distance <= 3); // 3km 이내

    // 5. 코스 스팟 생성
    const spots: CourseSpot[] = [];
    const usedIds = new Set<number>();

    for (let i = 0; i < mealTypes.length; i++) {
      const mealType = mealTypes[i] as keyof typeof MEAL_TYPE_CONFIG;
      const config = MEAL_TYPE_CONFIG[mealType];
      
      if (!config) continue;

      // 해당 카테고리의 식당 찾기
      const candidates = restaurantsWithDistance
        .filter((r: RestaurantWithDistance) => !usedIds.has(r.id))
        .filter((r: RestaurantWithDistance) => {
          const cat = r.category?.toLowerCase() || '';
          return config.categories.some(c => cat.includes(c.toLowerCase()));
        })
        .sort((a: RestaurantWithDistance, b: RestaurantWithDistance) => b.avgRating - a.avgRating);

      // 없으면 가장 평점 높은 아무 식당
      const selected = candidates[0] || restaurantsWithDistance
        .filter((r: RestaurantWithDistance) => !usedIds.has(r.id))
        .sort((a: RestaurantWithDistance, b: RestaurantWithDistance) => b.avgRating - a.avgRating)[0];

      if (selected) {
        usedIds.add(selected.id);
        
        // 이전 스팟과의 거리/시간 계산
        let walkingTimeToNext = 0;
        let distanceToNext = 0;
        
        if (spots.length > 0) {
          const prevSpot = spots[spots.length - 1];
          const prevRest = prevSpot.restaurant as RestaurantWithDistance;
          if (prevRest.latitude && prevRest.longitude) {
            distanceToNext = calculateDistance(
              prevRest.latitude,
              prevRest.longitude,
              selected.latitude,
              selected.longitude
            ) * 1000; // meters
            walkingTimeToNext = estimateWalkingTime(distanceToNext / 1000);
            
            // 이전 스팟에 이동 정보 추가
            prevSpot.walkingTimeToNext = walkingTimeToNext;
            prevSpot.distanceToNext = Math.round(distanceToNext);
          }
        }

        spots.push({
          order: spots.length + 1,
          type: mealType as CourseSpot['type'],
          restaurant: {
            ...selected,
            distance: selected.distance,
          },
          suggestedTime: config.time,
        });
      }
    }

    if (spots.length === 0) {
      return {
        message: `${params.location} 근처에서 코스를 구성하기 어려워요 😢\n맛집이 충분하지 않네요. 다른 지역을 시도해보시겠어요?`,
        course: null,
        actions: [
          { type: 'link', label: '전체 맛집 보기', url: '/restaurants', variant: 'secondary' },
        ],
      };
    }

    // 6. 총 거리 계산
    let totalDistance = spots[0].restaurant.distance || 0; // 출발지에서 첫 번째
    for (const spot of spots) {
      if (spot.distanceToNext) {
        totalDistance += spot.distanceToNext / 1000;
      }
    }

    // 7. 코스 객체 생성
    const situationText: Record<string, string> = {
      date: '로맨틱 데이트',
      friends: '친구와 함께',
      family: '가족 나들이',
      solo: '혼자 즐기는',
      business: '비즈니스',
    };

    const course: CourseRecommendation = {
      title: `${params.location} ${situationText[params.situation || 'date']} 코스`,
      description: `${params.location} 근처 추천 맛집 코스입니다.`,
      totalDistance: Math.round(totalDistance * 10) / 10,
      estimatedTime: spots.length * 90, // 각 장소 평균 1.5시간
      spots,
    };

    // 8. 응답 메시지 생성
    const mealTypeEmojis: Record<string, string> = {
      lunch: '🍽️ 점심',
      cafe: '☕ 카페',
      dinner: '🍴 저녁',
      bar: '🍺 술집',
    };

    const message = `${params.location} ${situationText[params.situation || 'date']} 코스 추천해드릴게요! 💕\n\n` +
      `📍 **${course.title}** (총 ${course.totalDistance}km)\n\n` +
      spots.map((spot, i) => {
        const typeText = mealTypeEmojis[spot.type] || spot.type;
        let text = `${spot.order}️⃣ [${typeText} ${spot.suggestedTime}] **${spot.restaurant.name}**\n` +
          `   📍 ${spot.restaurant.address}\n` +
          `   ⭐ ${spot.restaurant.avgRating?.toFixed(1) || '?'} (리뷰 ${spot.restaurant.reviewCount || 0}개)`;
        
        if (spot.walkingTimeToNext) {
          text += `\n\n   ↓ 도보 ${spot.walkingTimeToNext}분 (${spot.distanceToNext}m)`;
        }
        
        return text;
      }).join('\n\n') +
      '\n\n이 코스 어때요? 😊 시간이나 장소 바꿔드릴까요?';

    const actions: ActionButton[] = [
      { type: 'link', label: '첫 번째 가게 보기', url: `/restaurants/${spots[0].restaurant.id}`, variant: 'primary' },
    ];

    return { message, course, actions };
  } catch (error) {
    console.error('Course recommendation error:', error);
    return {
      message: '코스를 만드는 중 오류가 발생했어요 😅\n잠시 후 다시 시도해주세요!',
      course: null,
      actions: [],
    };
  }
}

export default handleRecommendCourse;

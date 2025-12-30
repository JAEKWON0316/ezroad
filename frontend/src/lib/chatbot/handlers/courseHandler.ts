import { 
  CourseRecommendation, 
  CourseSpot, 
  RecommendCourseParams, 
  ActionButton,
} from '@/types/chat';
import { geocodeLocation, calculateDistance } from '../geocode';
import OpenAI from 'openai';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.106.186.205:8080/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CourseHandlerResult {
  message: string;
  course: CourseRecommendation | null;
  actions: ActionButton[];
}

interface RestaurantData {
  id: number;
  name: string;
  category: string;
  address: string;
  avgRating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  distance: number;
}

export async function handleRecommendCourse(
  params: RecommendCourseParams
): Promise<CourseHandlerResult> {
  try {
    // 1. API에서 식당 목록 가져오기
    const response = await fetch(`${API_URL}/restaurants?page=0&size=50&sort=avgRating,desc`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();
    const allRestaurants = data.content || data || [];

    // 2. 지역 좌표 변환 시도
    const location = await geocodeLocation(params.location);
    
    // 3. 식당 필터링 (좌표 기반 또는 주소 기반)
    let filteredRestaurants: RestaurantData[] = [];

    if (location) {
      filteredRestaurants = allRestaurants
        .filter((r: { latitude?: number; longitude?: number }) => r.latitude && r.longitude)
        .map((r: { id: number; name: string; category: string; address: string; avgRating?: number; reviewCount?: number; latitude: number; longitude: number }) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          address: r.address,
          avgRating: r.avgRating || 0,
          reviewCount: r.reviewCount || 0,
          latitude: r.latitude,
          longitude: r.longitude,
          distance: calculateDistance(location.lat, location.lng, r.latitude, r.longitude),
        }))
        .filter((r: RestaurantData) => r.distance <= 5);
    }

    // 좌표 검색 결과가 없으면 주소 키워드로 fallback
    if (filteredRestaurants.length === 0) {
      const searchKeyword = params.location.replace(/역|구|동|시/g, '').trim();
      
      filteredRestaurants = allRestaurants
        .filter((r: { address?: string; latitude?: number; longitude?: number }) => {
          if (!r.address) return false;
          return r.address.includes(params.location) || 
                 r.address.includes(searchKeyword);
        })
        .map((r: { id: number; name: string; category: string; address: string; avgRating?: number; reviewCount?: number; latitude?: number; longitude?: number }) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          address: r.address,
          avgRating: r.avgRating || 0,
          reviewCount: r.reviewCount || 0,
          latitude: r.latitude || 0,
          longitude: r.longitude || 0,
          distance: 0,
        }));
    }

    if (filteredRestaurants.length === 0) {
      return {
        message: `${params.location} 근처에서 맛집을 찾지 못했어요 😢\n다른 지역을 시도해보시겠어요?`,
        course: null,
        actions: [
          { type: 'link', label: '전체 맛집 보기', url: '/restaurants', variant: 'secondary' },
        ],
      };
    }

    // 4. GPT에게 최적 코스 요청
    const restaurantListText = filteredRestaurants.map((r, i) => 
      `${i + 1}. [ID:${r.id}] ${r.name} | 카테고리: ${r.category} | 평점: ${r.avgRating} | 리뷰: ${r.reviewCount}개 | 주소: ${r.address} | 좌표: (${r.latitude}, ${r.longitude}) | 거리: ${r.distance.toFixed(1)}km`
    ).join('\n');

    const situationText = params.situation === 'date' ? '데이트' :
                          params.situation === 'friends' ? '친구 모임' :
                          params.situation === 'family' ? '가족 식사' :
                          params.situation === 'business' ? '비즈니스' : '일반';

    const preferencesText = params.preferences?.length ? params.preferences.join(', ') : '없음';

    const gptPrompt = `당신은 맛집 코스 플래너입니다. 아래 식당 목록을 보고 최적의 코스를 짜주세요.

## 요청 정보
- 위치: ${params.location}
- 상황: ${situationText}
- 선호사항: ${preferencesText}

## 사용 가능한 식당 목록
${restaurantListText}

## 코스 구성 규칙
1. 점심(12:00) → 카페(14:30) → 저녁(18:00) 순서로 구성
2. 이동 거리가 최소화되도록 동선 최적화
3. 카테고리가 겹치지 않게 다양하게 선택
4. 평점이 높은 곳 우선
5. 상황(${situationText})에 맞는 분위기 고려

## 응답 형식 (JSON만 출력)
{
  "spots": [
    {"id": 식당ID, "type": "lunch|cafe|dinner", "time": "12:00", "reason": "선택 이유"},
    {"id": 식당ID, "type": "cafe", "time": "14:30", "reason": "선택 이유"},
    {"id": 식당ID, "type": "dinner", "time": "18:00", "reason": "선택 이유"}
  ],
  "totalCourseReason": "전체 코스 설명"
}`;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: gptPrompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const gptContent = gptResponse.choices[0]?.message?.content || '';
    
    // JSON 파싱
    let courseData;
    try {
      const jsonMatch = gptContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        courseData = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error('Failed to parse GPT response:', gptContent);
    }

    if (!courseData?.spots?.length) {
      // GPT 파싱 실패 시 기본 로직으로 fallback
      return fallbackCourseGeneration(params, filteredRestaurants);
    }

    // 5. 코스 스팟 생성
    const spots: CourseSpot[] = [];
    
    for (let i = 0; i < courseData.spots.length; i++) {
      const spotData = courseData.spots[i];
      const restaurant = filteredRestaurants.find(r => r.id === spotData.id);
      
      if (!restaurant) continue;

      // 이전 스팟과의 거리 계산
      if (spots.length > 0) {
        const prevRest = spots[spots.length - 1].restaurant as RestaurantData;
        if (prevRest.latitude && prevRest.longitude && restaurant.latitude && restaurant.longitude) {
          const dist = calculateDistance(
            prevRest.latitude, prevRest.longitude,
            restaurant.latitude, restaurant.longitude
          );
          spots[spots.length - 1].distanceToNext = Math.round(dist * 1000);
          spots[spots.length - 1].walkingTimeToNext = Math.round((dist / 4) * 60);
        }
      }

      spots.push({
        order: spots.length + 1,
        type: spotData.type as CourseSpot['type'],
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          category: restaurant.category,
          address: restaurant.address,
          avgRating: restaurant.avgRating,
          reviewCount: restaurant.reviewCount,
          distance: restaurant.distance,
        },
        suggestedTime: spotData.time,
      });
    }

    if (spots.length === 0) {
      return fallbackCourseGeneration(params, filteredRestaurants);
    }

    // 6. 총 거리 계산
    let totalDistance = 0;
    for (const spot of spots) {
      if (spot.distanceToNext) {
        totalDistance += spot.distanceToNext / 1000;
      }
    }

    const course: CourseRecommendation = {
      title: `${params.location} ${situationText} 코스`,
      description: courseData.totalCourseReason || `${params.location} 추천 맛집 코스`,
      totalDistance: Math.round(totalDistance * 10) / 10,
      estimatedTime: spots.length * 90,
      spots,
    };

    // 7. 응답 메시지 생성 (가게명에 링크 포함)
    const typeEmoji: Record<string, string> = {
      lunch: '🍽️ 점심',
      cafe: '☕ 카페', 
      dinner: '🍴 저녁',
      bar: '🍺 술집',
    };

    const message = `${params.location} ${situationText} 코스 추천해드릴게요! 💕\n\n` +
      `📍 **${course.title}** (총 ${course.totalDistance}km)\n\n` +
      spots.map((spot, idx) => {
        const emoji = typeEmoji[spot.type] || '🍽️';
        let text = `${spot.order}️⃣ [${emoji} ${spot.suggestedTime}] **[${spot.restaurant.name}](/restaurants/${spot.restaurant.id})**\n` +
          `   📍 ${spot.restaurant.address}\n` +
          `   ⭐ ${spot.restaurant.avgRating?.toFixed(1)} (리뷰 ${spot.restaurant.reviewCount}개)`;
        
        if (spot.walkingTimeToNext && idx < spots.length - 1) {
          text += `\n\n   ↓ 도보 ${spot.walkingTimeToNext}분 (${spot.distanceToNext}m)`;
        }
        return text;
      }).join('\n\n') +
      `\n\n💡 ${courseData.totalCourseReason || ''}` +
      '\n\n이 코스 어때요? 😊 수정이 필요하면 말씀해주세요!';

    return { message, course, actions: [] };

  } catch (error) {
    console.error('Course recommendation error:', error);
    return {
      message: '코스를 만드는 중 오류가 발생했어요 😅\n잠시 후 다시 시도해주세요!',
      course: null,
      actions: [],
    };
  }
}

// Fallback: GPT 실패 시 기본 로직
function fallbackCourseGeneration(
  params: RecommendCourseParams,
  restaurants: RestaurantData[]
): CourseHandlerResult {
  const sorted = [...restaurants].sort((a, b) => b.avgRating - a.avgRating);
  const spots: CourseSpot[] = [];
  const types: Array<{ type: CourseSpot['type']; time: string }> = [
    { type: 'lunch', time: '12:00' },
    { type: 'cafe', time: '14:30' },
    { type: 'dinner', time: '18:00' },
  ];

  for (let i = 0; i < Math.min(3, sorted.length); i++) {
    const r = sorted[i];
    spots.push({
      order: i + 1,
      type: types[i].type,
      restaurant: {
        id: r.id,
        name: r.name,
        category: r.category,
        address: r.address,
        avgRating: r.avgRating,
        reviewCount: r.reviewCount,
        distance: r.distance,
      },
      suggestedTime: types[i].time,
    });
  }

  const message = `${params.location} 코스 추천이에요! 🍽️\n\n` +
    spots.map((spot) => 
      `${spot.order}️⃣ [${spot.suggestedTime}] **[${spot.restaurant.name}](/restaurants/${spot.restaurant.id})**\n` +
      `   📍 ${spot.restaurant.address} | ⭐ ${spot.restaurant.avgRating?.toFixed(1)}`
    ).join('\n\n');

  return {
    message,
    course: {
      title: `${params.location} 추천 코스`,
      description: '',
      totalDistance: 0,
      estimatedTime: spots.length * 90,
      spots,
    },
    actions: [],
  };
}

export default handleRecommendCourse;

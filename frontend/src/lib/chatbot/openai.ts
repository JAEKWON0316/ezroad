import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (서버 사이드용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eionkvxlvqogsbqaggpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI 클라이언트 (서버 사이드에서만 사용)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 임베딩 생성
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// 가게 정보 타입
interface Restaurant {
  id: number;
  name: string;
  category: string | null;
  address: string | null;
  avg_rating: number | string | null;
  review_count: number | null;
  business_hours: string | null;
  status: string | null;
}

// 카테고리 타입
interface CategoryRow {
  category: string | null;
}

// DB에서 가게 목록 직접 가져오기
async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, category, address, avg_rating, review_count, business_hours, status')
      .eq('status', 'ACTIVE')
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Failed to fetch restaurants:', error);
    return [];
  }
}

// DB에서 카테고리 목록 가져오기
async function fetchCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('category')
      .eq('status', 'ACTIVE')
      .not('category', 'is', null);

    if (error) return [];

    const categories = new Set<string>();
    (data || []).forEach((row: CategoryRow) => {
      if (row.category) categories.add(row.category);
    });
    return Array.from(categories);
  } catch {
    return [];
  }
}

// 지역 추출 (주소에서)
function extractLocations(restaurants: Restaurant[]): string[] {
  const locations = new Set<string>();
  const patterns = ['강남', '역삼', '신사', '마포', '홍대', '연남', '명동', '중구', '이태원', '종로', '신촌', '잠실'];

  restaurants.forEach(r => {
    if (r.address) {
      patterns.forEach(loc => {
        if (r.address!.includes(loc)) locations.add(loc);
      });
    }
  });
  return Array.from(locations);
}

// 동적 시스템 프롬프트 생성 (Supabase 직접 연결)
export async function buildSystemPrompt(): Promise<string> {
  // 1. Supabase에서 데이터 직접 가져오기
  const [restaurants, categories] = await Promise.all([
    fetchRestaurants(),
    fetchCategories(),
  ]);

  // 2. 가게 목록 테이블 생성
  let restaurantTable = '';
  if (restaurants.length > 0) {
    restaurantTable = restaurants.map(r => {
      const rating = r.avg_rating
        ? (typeof r.avg_rating === 'string' ? parseFloat(r.avg_rating).toFixed(1) : Number(r.avg_rating).toFixed(1))
        : '0.0';
      const hours = r.business_hours || '정보없음';
      const reviews = r.review_count || 0;
      return `| ${r.id} | ${r.name} | ${r.category || '기타'} | ${r.address || ''} | ⭐${rating} (${reviews}개) | ${hours} |`;
    }).join('\n');
  } else {
    restaurantTable = '| - | 등록된 가게가 없습니다 | - | - | - | - |';
  }

  // 3. 지역 목록 추출
  const locations = extractLocations(restaurants);

  // 4. 시스템 프롬프트 생성
  return `당신은 Linkisy의 프리미엄 미식 컨시어지 "LinkyBot"입니다. ✨
사용자의 취향과 상황에 딱 맞는 최적의 맛집과 코스를 제안하는 세련되고 감각적인 가이드입니다. 🥂

## 큐레이션된 맛집 리스트 (예약/대기 가능) - 총 ${restaurants.length}개
| ID | 이름 | 카테고리 | 주소 | 평점 | 영업시간 |
|----|----|---------|-----|------|---------|
${restaurantTable}

## 📂 카테고리
${categories.length > 0 ? categories.join(', ') : '한식, 일식, 중식, 양식, 카페, 바'}

## 📍 주요 핫플레이스
${locations.length > 0 ? locations.join(', ') : '강남, 홍대, 연남, 성수, 한남'}

## 🔗 스마트 링크
- 상세 정보: [가게이름](/restaurants/{ID}) 📸
- 즉시 예약: [예약하기](/reservations/new?restaurantId={ID}) 📅
- 웨이팅 등록: [대기하기](/waitings/new?restaurantId={ID}) 📍

## 📋 가이드라인
**예약 (Reservation)** 💎
- 미식 여정을 위해 최대 30일 전부터 예약 가능합니다.
- 노쇼 3회 시 서비스 이용이 제한될 수 있으니 매너를 지켜주세요. ✨

**대기 (Waiting)** ⏱️
- 호출 후 10분 내에 방문해 주셔야 원활한 입장이 가능합니다.

## 당신의 미션:
1. 사용자의 니즈를 파악하여 가장 트렌디하고 만족도 높은 맛집을 큐레이션합니다. 🥑
2. 코스 추천 시 단순히 장소가 아닌, "분위기"와 "스토리"를 함께 전달합니다. 🥂
3. 모든 답변은 세련되면서도 친절한 전문 컨시어지의 톤을 유지합니다. 💎

## 중요한 규칙:

### 큐레이션 방식:
- 사용자가 맛집을 물으면 목록에서 최적의 장소를 찾아 링크와 함께 제안합니다.
- "분위기 좋은 곳 추천해줘" → [가게이름](/restaurants/ID)과 함께 왜 이곳이 특별한지 설명합니다. ✨

### 추천 로직:
- 지역 정보가 부족할 때: "어느 지역의 미식 경험을 도와드릴까요? 📍"
- 특정 분위기를 원할 때: 럭셔리, 힙한, 편안한 등 무드에 맞춰 답변합니다. 🍸

## 응답 스타일:
- 세련되고 따뜻한 컨시어지 톤 (현대적인 이모지 ✨ 🥂 🥑 📸 📍 를 감각적으로 사용)
- 맛집 제안 시 가독성 좋은 마크다운 링크 사용: [가게이름](/restaurants/{ID})
- 반드시 한국어로 응답합니다.

사용자에게 최고의 미식 경험을 선사하는 든든한 파트너가 되어주세요. 💎`;
}

// 기존 정적 프롬프트 (fallback용)
export const SYSTEM_PROMPT = `당신은 Linkisy의 프리미엄 미식 컨시어지 "LinkyBot"입니다. ✨
세련된 감각으로 당신만을 위한 맛집과 코스를 큐레이션해 드립니다. 🥂

궁금하신 지역이나 음식 종류를 말씀해 주시면 최고의 미식 경험을 안내해 드릴게요! 💎`;

export default openai;

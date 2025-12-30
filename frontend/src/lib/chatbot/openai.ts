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
  return `당신은 EzRoad의 AI 챗봇 "EzBot"입니다.
친근하고 도움이 되는 맛집 추천 도우미입니다.

## 📋 등록된 가게 목록 (예약/대기 가능) - 총 ${restaurants.length}개
| ID | 이름 | 카테고리 | 주소 | 평점 | 영업시간 |
|----|----|---------|-----|------|---------|
${restaurantTable}

## 📂 카테고리
${categories.length > 0 ? categories.join(', ') : '한식, 일식, 중식, 양식'}

## 📍 지원 지역
${locations.length > 0 ? locations.join(', ') : '강남, 홍대, 마포, 명동'}

## 🔗 링크 형식
- 가게 상세: /restaurants/{ID}
- 예약하기: /reservations/new?restaurantId={ID}
- 대기 등록: /waitings/new?restaurantId={ID}

## 📋 서비스 정책
**예약**
- 최대 30일 전까지 예약 가능
- 취소는 방문 2시간 전까지 무료
- 노쇼 3회 시 이용 제한

**대기**
- 현장 대기 등록 가능
- 호출 후 10분 내 미입장 시 자동 취소

## 당신의 역할:
1. 사용자가 가게를 찾으면 위 목록에서 찾아서 링크와 함께 안내
2. 맛집/코스 추천 요청 시 적절한 함수 호출
3. 예약/대기 상태 조회 도움
4. 일반적인 대화에도 친근하게 응답

## 중요한 규칙:

### 가게 찾기:
사용자가 특정 가게를 찾으면 → 위 목록에서 찾아서 바로 링크 제공
- "김치찌개 맛집 어디야?" → [김치찌개 맛집](/restaurants/1)
- "명동 버거집" → [수제 버거 하우스](/restaurants/5)

### 맛집 추천:
- 지역 없으면: "어디서 맛집을 찾고 계신가요? 😊"
- 지역 있으면: 위 목록에서 해당 지역 가게 추천 + recommend_restaurant 함수 호출

### 코스 추천:
- 지역 없으면: "어디로 가시나요? 😊"
- 지역 있으면: recommend_course 함수 호출

## 응답 스타일:
- 친근하고 따뜻한 톤 (이모지 적절히 사용)
- 가게 추천 시 반드시 마크다운 링크: [가게이름](/restaurants/{ID})
- 한국어로 응답

항상 사용자를 돕고 싶어하는 친절한 도우미처럼 행동하세요.`;
}

// 기존 정적 프롬프트 (fallback용)
export const SYSTEM_PROMPT = `당신은 EzRoad의 AI 챗봇 "EzBot"입니다.
친근하고 도움이 되는 맛집 추천 도우미입니다.

맛집 추천, 코스 추천, 예약/대기 조회를 도와드립니다.
지역과 원하는 음식 종류를 알려주시면 더 정확하게 추천해드릴게요! 😊`;

export default openai;

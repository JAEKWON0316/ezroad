import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI 클라이언트
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 식당 정보 타입
interface Restaurant {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  address: string | null;
  avg_rating: number | null;
  review_count: number | null;
  business_hours: string | null;
}

// 임베딩 생성
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// 식당 정보를 텍스트로 변환 (임베딩용)
function restaurantToText(restaurant: Restaurant): string {
  const parts = [
    `이름: ${restaurant.name}`,
    restaurant.category ? `카테고리: ${restaurant.category}` : '',
    restaurant.description ? `설명: ${restaurant.description}` : '',
    restaurant.address ? `주소: ${restaurant.address}` : '',
    restaurant.avg_rating ? `평점: ${restaurant.avg_rating}점` : '',
    restaurant.business_hours ? `영업시간: ${restaurant.business_hours}` : '',
  ];
  return parts.filter(Boolean).join('. ');
}

// 단일 식당 임베딩 저장
export async function saveRestaurantEmbedding(restaurant: Restaurant): Promise<boolean> {
  try {
    const content = restaurantToText(restaurant);
    const embedding = await generateEmbedding(content);

    const { error } = await supabase
      .from('restaurant_embeddings')
      .upsert({
        restaurant_id: restaurant.id,
        content: content,
        embedding: embedding,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'restaurant_id',
      });

    if (error) {
      console.error('Failed to save embedding:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in saveRestaurantEmbedding:', error);
    return false;
  }
}

// 모든 식당 임베딩 생성/갱신
export async function syncAllRestaurantEmbeddings(): Promise<{ success: number; failed: number }> {
  const result = { success: 0, failed: 0 };

  try {
    // 모든 ACTIVE 식당 조회
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, category, description, address, avg_rating, review_count, business_hours')
      .eq('status', 'ACTIVE');

    if (error || !restaurants) {
      console.error('Failed to fetch restaurants:', error);
      return result;
    }

    // 각 식당에 대해 임베딩 생성
    for (const restaurant of restaurants) {
      const success = await saveRestaurantEmbedding(restaurant);
      if (success) {
        result.success++;
      } else {
        result.failed++;
      }
    }

    console.log(`Embeddings synced: ${result.success} success, ${result.failed} failed`);
    return result;
  } catch (error) {
    console.error('Error in syncAllRestaurantEmbeddings:', error);
    return result;
  }
}

// Vector 유사도 검색
export async function searchRestaurantsByVector(
  query: string,
  threshold: number = 0.5,
  limit: number = 5
): Promise<Array<{
  restaurant_id: number;
  name: string;
  category: string;
  address: string;
  similarity: number;
}>> {
  try {
    // 쿼리 임베딩 생성
    const queryEmbedding = await generateEmbedding(query);

    // Supabase RPC로 유사도 검색
    const { data, error } = await supabase.rpc('match_restaurants', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.error('Vector search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchRestaurantsByVector:', error);
    return [];
  }
}

export default {
  generateEmbedding,
  saveRestaurantEmbedding,
  syncAllRestaurantEmbeddings,
  searchRestaurantsByVector,
};

import { NextRequest, NextResponse } from 'next/server';
import { syncAllRestaurantEmbeddings } from '@/lib/chatbot/vectordb';

// 식당 임베딩 동기화 API (관리자용)
export async function POST(request: NextRequest) {
  try {
    // 간단한 API 키 확인 (프로덕션에서는 더 강력한 인증 필요)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.SYNC_API_KEY || 'ezroad-sync-key';
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting embeddings sync...');
    const result = await syncAllRestaurantEmbeddings();

    return NextResponse.json({
      message: 'Embeddings sync completed',
      result,
    });
  } catch (error) {
    console.error('Embeddings sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

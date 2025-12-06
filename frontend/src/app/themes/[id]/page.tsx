'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { themeApi } from '@/lib/api';
import type { ThemeDetail, ThemeRestaurant } from '@/types';

export default function ThemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [theme, setTheme] = useState<ThemeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // 좋아요 상태
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const themeId = Number(params.id);
  const isOwner = user && theme && user.id === theme.member.id;

  useEffect(() => {
    fetchTheme();
  }, [themeId]);

  useEffect(() => {
    if (theme) {
      setLikeCount(theme.likeCount || 0);
      checkLikeStatus();
    }
  }, [theme, isAuthenticated]);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await themeApi.getDetail(themeId);
      setTheme(data);
    } catch (err: any) {
      console.error('테마 로딩 실패:', err);
      if (err.response?.status === 404) {
        setError('존재하지 않는 테마입니다');
      } else if (err.response?.status === 401) {
        setError('비공개 테마입니다');
      } else {
        setError('테마를 불러오는데 실패했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const data = await themeApi.checkLike(themeId);
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (err) {
      console.error('좋아요 상태 확인 실패:', err);
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    try {
      setLikeLoading(true);
      if (isLiked) {
        const result = await themeApi.unlike(themeId);
        setIsLiked(false);
        setLikeCount(result.likeCount);
      } else {
        const result = await themeApi.like(themeId);
        setIsLiked(true);
        setLikeCount(result.likeCount);
      }
    } catch (err: any) {
      console.error('좋아요 처리 실패:', err);
      alert(err.response?.data?.message || '좋아요 처리에 실패했습니다');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 테마를 삭제하시겠습니까?')) return;
    
    try {
      setDeleting(true);
      await themeApi.delete(themeId);
      alert('테마가 삭제되었습니다');
      router.push('/themes');
    } catch (err) {
      console.error('테마 삭제 실패:', err);
      alert('테마 삭제에 실패했습니다');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">{error || '테마를 찾을 수 없습니다'}</p>
        <Link href="/themes" className="text-orange-500 hover:underline">
          테마 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{theme.title}</h1>
            {theme.description && (
              <p className="text-gray-600 mb-4">{theme.description}</p>
            )}
            
            {/* 작성자 정보 */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                {theme.member.profileImage ? (
                  <Image
                    src={theme.member.profileImage}
                    alt={theme.member.nickname}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                )}
                <span className="font-medium">{theme.member.nickname}</span>
              </div>
              <span>·</span>
              <span>👁 {theme.viewCount}</span>
              <span>·</span>
              <span>🍽️ {theme.restaurantCount}개 식당</span>
              <span>·</span>
              <span>{theme.isPublic ? '🌐 공개' : '🔒 비공개'}</span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {/* 좋아요 버튼 */}
            <button
              onClick={handleLikeToggle}
              disabled={likeLoading}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isLiked
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {likeLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>{isLiked ? '❤️' : '🤍'}</span>
              )}
              <span>{likeCount}</span>
            </button>

            {/* 소유자 액션 버튼 */}
            {isOwner && (
              <>
                <Link
                  href={`/themes/${themeId}/edit`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 식당 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          코스 ({theme.restaurants.length}개)
        </h2>
        
        {theme.restaurants.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">아직 추가된 식당이 없습니다</p>
            {isOwner && (
              <Link
                href={`/themes/${themeId}/edit`}
                className="inline-block mt-4 text-orange-500 hover:underline"
              >
                식당 추가하기
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {theme.restaurants.map((restaurant, index) => (
              <RestaurantItem 
                key={restaurant.id} 
                restaurant={restaurant} 
                index={index + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="mt-8 pt-8 border-t flex justify-between">
        <Link
          href="/themes"
          className="text-gray-600 hover:text-gray-900 transition"
        >
          ← 테마 목록
        </Link>
        
        {/* 공유 버튼 */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 복사되었습니다!');
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          📤 공유하기
        </button>
      </div>
    </div>
  );
}

function RestaurantItem({ restaurant, index }: { restaurant: ThemeRestaurant; index: number }) {
  return (
    <Link href={`/restaurants/${restaurant.restaurantId}`}>
      <div className="flex gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition cursor-pointer">
        {/* 순서 번호 */}
        <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
          {index}
        </div>

        {/* 썸네일 */}
        <div className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100">
          {restaurant.thumbnail ? (
            <Image
              src={restaurant.thumbnail}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 mb-1">{restaurant.name}</h3>
          <p className="text-sm text-gray-500 mb-1">{restaurant.category}</p>
          <p className="text-sm text-gray-500 truncate mb-2">{restaurant.address}</p>
          
          <div className="flex items-center gap-3 text-sm">
            <span className="text-yellow-500">⭐ {restaurant.avgRating?.toFixed(1) || '0.0'}</span>
            <span className="text-gray-400">리뷰 {restaurant.reviewCount}</span>
          </div>

          {restaurant.memo && (
            <p className="mt-2 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
              💬 {restaurant.memo}
            </p>
          )}
        </div>

        {/* 화살표 */}
        <div className="flex-shrink-0 self-center text-gray-400">
          →
        </div>
      </div>
    </Link>
  );
}

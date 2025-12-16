'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { themeApi } from '@/lib/api';
import { useThemeDetail } from '@/hooks/useThemeDetail';
import ThemeDetailSkeleton from '@/components/theme/ThemeDetailSkeleton';
import { ChevronLeft, Map, Share2, Heart, Trash2, Edit, MoreVertical, Star, MapPin, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeRestaurant } from '@/types';

export default function ThemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const themeId = Number(params.id);

  const { theme, isLoading, isError, error, likeStatus, refetchLike } = useThemeDetail(themeId);
  const [deleting, setDeleting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const isOwner = user && theme && user.id === theme.member.id;
  const isLiked = likeStatus?.isLiked || false;
  const likeCount = likeStatus?.likeCount || theme?.likeCount || 0;

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      setLikeLoading(true);
      if (isLiked) {
        await themeApi.unlike(themeId);
        toast.success('좋아요를 취소했습니다');
      } else {
        await themeApi.like(themeId);
        toast.success('이 테마를 좋아합니다!');
      }
      refetchLike();
    } catch (err: any) {
      console.error('좋아요 처리 실패:', err);
      toast.error('처리에 실패했습니다');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 테마를 삭제하시겠습니까? 복구할 수 없습니다.')) return;

    try {
      setDeleting(true);
      await themeApi.delete(themeId);
      toast.success('테마가 삭제되었습니다');
      router.push('/themes');
    } catch (err) {
      console.error('테마 삭제 실패:', err);
      toast.error('테마 삭제에 실패했습니다');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('링크가 클립보드에 복사되었습니다');
  };

  if (isLoading) {
    return <ThemeDetailSkeleton />;
  }

  if (isError || !theme) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">테마를 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-6">삭제되었거나 비공개된 테마일 수 있습니다.</p>
        <Link href="/themes" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">
          테마 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section with Glassmorphism Header */}
      <div className="relative bg-white overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500" />

        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-10">
          {/* Navigation */}
          <div className="flex justify-between items-start mb-6">
            <Link href="/themes" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>

            <div className="flex gap-2">
              {isAuthenticated && (
                <button
                  onClick={handleLikeToggle}
                  disabled={likeLoading}
                  className={`p-2.5 rounded-full border transition-all ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              )}
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {isOwner && (
                <>
                  <Link href={`/themes/${themeId}/edit`} className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">
            {theme.isPublic ? '공개 테마' : '비공개 테마'}
          </span>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {theme.title}
          </h1>
          {theme.description && (
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
              {theme.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                {theme.member.profileImage ? (
                  <Image src={theme.member.profileImage} alt={theme.member.nickname} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-lg">👤</div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{theme.member.nickname}</p>
                <p className="text-xs text-gray-500">Curator</p>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-gray-200 hidden md:block" />

            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium uppercase">Places</span>
                <span className="font-bold text-gray-900">{theme.restaurantCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium uppercase">Likes</span>
                <span className="font-bold text-gray-900">{likeCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium uppercase">Views</span>
                <span className="font-bold text-gray-900">{theme.viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2 h-6 bg-orange-500 rounded-full block"></span>
            큐레이션 리스트
          </h2>
          {theme.restaurantCount > 0 && (
            <Link href={`/map?theme=${themeId}`} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200 flex items-center gap-2">
              <Map className="w-4 h-4" />
              지도에서 보기
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {theme.restaurants.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🍽️</div>
              <p className="text-gray-500 font-medium mb-4">아직 리스트가 비어있습니다.</p>
              {isOwner && (
                <Link href={`/themes/${themeId}/edit`} className="inline-block px-6 py-2 bg-orange-50 text-orange-600 rounded-lg font-bold hover:bg-orange-100 transition">
                  장소 추가하기
                </Link>
              )}
            </div>
          ) : (
            theme.restaurants.map((restaurant, index) => (
              <ModernRestaurantItem key={restaurant.id} restaurant={restaurant} index={index + 1} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ModernRestaurantItem({ restaurant, index }: { restaurant: ThemeRestaurant; index: number }) {
  return (
    <Link href={`/restaurants/${restaurant.restaurantId}`} className="block group">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-100 transition-all duration-300 flex gap-4 md:gap-6 relative overflow-hidden">
        {/* Index Badge */}
        <div className="absolute top-4 left-4 z-10 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border border-white/20">
          {index}
        </div>

        {/* Thumbnail */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative">
          {restaurant.thumbnail ? (
            <Image src={restaurant.thumbnail} alt={restaurant.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🥘</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 py-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
              {restaurant.category}
            </span>
            <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
              <Star className="w-3 h-3 fill-current" />
              {restaurant.avgRating?.toFixed(1) || '0.0'}
            </div>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-orange-600 transition-colors">
            {restaurant.name}
          </h3>

          <div className="flex items-center text-gray-500 text-sm mb-3 truncate">
            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            {restaurant.address}
          </div>

          {restaurant.memo && (
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg italic border-l-2 border-orange-300">
              "{restaurant.memo}"
            </div>
          )}
        </div>

        {/* Arrow (Desktop) */}
        <div className="hidden md:flex items-center justify-center px-2 text-gray-300 group-hover:text-orange-500 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </div>
      </div>
    </Link>
  );
}

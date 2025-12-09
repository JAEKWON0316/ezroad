'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  X,
  Utensils,
  ChevronDown,
  Heart,
} from 'lucide-react';
import { restaurantApi, followApi, searchApi } from '@/lib/api';
import { Restaurant, PageResponse } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import toast from 'react-hot-toast';

const categories = ['전체', '한식', '중식', '일식', '양식', '카페', '분식', '기타'];
const sortOptions = [
  { value: 'avgRating', label: '평점순' },
  { value: 'reviewCount', label: '리뷰순' },
  { value: 'createdAt', label: '최신순' },
];

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RestaurantsContent />
    </Suspense>
  );
}

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [followedIds, setFollowedIds] = useState<number[]>([]);

  // Filters
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '전체');
  const [sort, setSort] = useState(searchParams.get('sort') || 'avgRating');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      // 검색어가 있으면 기록 (비동기, 에러 무시)
      if (keyword && keyword.trim().length >= 2) {
        searchApi.record(keyword).catch(() => { });
      }

      const response: PageResponse<Restaurant> = await restaurantApi.getList({
        keyword: keyword || undefined,
        category: category === '전체' ? undefined : category,
        sort: sort as 'avgRating' | 'reviewCount' | 'createdAt',
        page,
        size: 12,
      });
      setRestaurants(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      toast.error('식당 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, category, sort, page]);

  const fetchFollowedIds = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const ids = await followApi.getMyFollowedRestaurantIds();
      setFollowedIds(ids);
    } catch (error) {
      console.error('Failed to fetch followed ids:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    fetchFollowedIds();
  }, [fetchFollowedIds]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchRestaurants();
  };

  const handleFollow = async (restaurantId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      if (followedIds.includes(restaurantId)) {
        await followApi.unfollowRestaurant(restaurantId);
        setFollowedIds(prev => prev.filter(id => id !== restaurantId));
        toast.success('찜 해제했습니다');
      } else {
        await followApi.followRestaurant(restaurantId);
        setFollowedIds(prev => [...prev, restaurantId]);
        toast.success('찜했습니다');
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Modern Sticky Header */}
      <div className="sticky top-16 z-40 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">

          {/* Top Row: Search & Filters Toggle */}
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="맛집 이름, 지역, 메뉴 검색..."
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
              />
            </form>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 md:hidden shadow-sm transition-all"
            >
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Bottom Row: Categories & Sort (Desktop) */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(0); }}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${category === cat
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-500/30 scale-105'
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <div className="relative group">
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(0); }}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 hover:border-orange-300 transition-all cursor-pointer shadow-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile Filters Expanded */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-2 pb-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="mb-8 flex items-baseline gap-2">
          <h1 className="text-2xl font-bold font-display text-gray-900">
            {category === '전체' ? '🍽️ 전체 맛집' : category === '한식' ? '🍚 한식' : category === '일식' ? '🍣 일식' : category === '중식' ? '🥟 중식' : category === '양식' ? '🍝 양식' : category === '카페' ? '☕ 카페' : `${category} 맛집`}
          </h1>
          <span className="text-orange-500 font-bold text-lg">
            {totalElements.toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm font-medium">곳을 발견했습니다</span>
        </div>

        {/* Active Filters Display */}
        {(keyword || category !== '전체') && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {keyword && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-sm font-medium shadow-sm animate-fade-in-up">
                검색어: &quot;{keyword}&quot;
                <button onClick={() => setKeyword('')} className="hover:bg-orange-200 rounded-full p-0.5 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">검색 결과가 없습니다</h3>
            <p className="text-gray-500 mt-1">다른 검색어너 카테고리로 다시 시도해보세요.</p>
          </div>
        ) : (
          <>
            {/* Restaurant Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map((restaurant, idx) => (
                <div key={restaurant.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  <RestaurantCard
                    restaurant={restaurant}
                    isFollowed={followedIds.includes(restaurant.id)}
                    onFollow={handleFollow}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Modernized Restaurant Card
function RestaurantCard({
  restaurant,
  isFollowed,
  onFollow
}: {
  restaurant: Restaurant;
  isFollowed: boolean;
  onFollow: (id: number, e: React.MouseEvent) => void;
}) {
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="group block h-full">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          {restaurant.thumbnail ? (
            <img
              src={restaurant.thumbnail}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Utensils className="h-12 w-12 text-gray-300" />
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-gray-800 shadow-sm border border-white/50">
              {restaurant.category}
            </span>
            {restaurant.reviewCount > 100 && (
              <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-sm shimmer">
                🔥 인기
              </span>
            )}
          </div>

          <button
            onClick={(e) => onFollow(restaurant.id, e)}
            className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 shadow-md hover:scale-110 ${isFollowed
                ? 'bg-red-500 text-white'
                : 'bg-white/90 backdrop-blur-md text-gray-400 hover:text-red-500'
              }`}
          >
            <Heart className={`h-4 w-4 ${isFollowed ? 'fill-current' : ''}`} />
          </button>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info Section */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {restaurant.name}
            </h3>
            <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100 flex-shrink-0 ml-2">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
              <span className="ml-1 text-sm font-bold text-gray-700">{restaurant.avgRating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-4 flex items-center line-clamp-1">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            {restaurant.address}
          </p>

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>리뷰 {restaurant.reviewCount}개</span>
            <span className="group-hover:translate-x-1 transition-transform text-orange-500 font-medium">자세히 보기 →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

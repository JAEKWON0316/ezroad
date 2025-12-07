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
        searchApi.record(keyword).catch(() => {});
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="식당명, 지역으로 검색"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <Button type="submit">검색</Button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 md:hidden"
            >
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            </button>
          </form>

          {/* Categories - Desktop */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(0); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">정렬:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(0); }}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden pt-4 border-t">
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      category === cat
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Filters */}
          {(keyword || category !== '전체') && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {keyword && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  &quot;{keyword}&quot;
                  <button onClick={() => setKeyword('')}>
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {category !== '전체' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {category}
                  <button onClick={() => setCategory('전체')}>
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {category === '전체' ? '모든 맛집' : `${category} 맛집`}
            <span className="text-gray-500 font-normal ml-2">
              {totalElements.toLocaleString()}개
            </span>
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <>
            {/* Restaurant Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isFollowed={followedIds.includes(restaurant.id)}
                  onFollow={handleFollow}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
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

// Restaurant Card Component
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
    <Link href={`/restaurants/${restaurant.id}`}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
        <div className="relative h-44">
          {restaurant.thumbnail ? (
            <img
              src={restaurant.thumbnail}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Utensils className="h-12 w-12 text-gray-300" />
            </div>
          )}
          <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {restaurant.category}
          </span>
          <button
            onClick={(e) => onFollow(restaurant.id, e)}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isFollowed 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFollowed ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="text-gray-500 text-sm mb-2 flex items-center line-clamp-1">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            {restaurant.address}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 font-medium">{restaurant.avgRating.toFixed(1)}</span>
              <span className="text-gray-400 ml-1">({restaurant.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

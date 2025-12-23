'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  MapPin,
  Star,
  ArrowRight,
  TrendingUp,
  Utensils,
  Coffee,
  Pizza,
  Soup,
  Fish,
  Beef,
  Flame,
  Compass,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { restaurantApi, themeApi, searchApi, SearchKeyword } from '@/lib/api';
import { Restaurant, Theme } from '@/types';
import SearchBar from '@/components/common/SearchBar';

// Dynamically load 3D Scene with no SSR
const Scene3D = dynamic(() => import('@/components/home/Scene3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-transparent" />
});

// Categories with Modern Gradients
const categories = [
  { name: '한식', icon: <Soup className="h-6 w-6" />, color: 'from-orange-50 to-orange-100 text-orange-600', border: 'border-orange-100' },
  { name: '중식', icon: <Utensils className="h-6 w-6" />, color: 'from-orange-50 to-orange-100 text-orange-600', border: 'border-orange-100' },
  { name: '일식', icon: <Fish className="h-6 w-6" />, color: 'from-orange-50 to-orange-100 text-orange-600', border: 'border-orange-100' },
  { name: '양식', icon: <Beef className="h-6 w-6" />, color: 'from-orange-50 to-orange-100 text-orange-600', border: 'border-orange-100' },
  { name: '카페', icon: <Coffee className="h-6 w-6" />, color: 'from-orange-50 to-orange-100 text-orange-600', border: 'border-orange-100' },
  { name: '분식', icon: <Pizza className="h-6 w-6" />, color: 'from-orange-50 to-orange-100 text-orange-600', border: 'border-orange-100' },
];

export default function HomePage() {
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([]);
  const [topThemes, setTopThemes] = useState<Theme[]>([]);
  const [popularKeywords, setPopularKeywords] = useState<SearchKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantsResult, themesResult, keywordsResult] = await Promise.allSettled([
          restaurantApi.getList({ sort: 'avgRating', size: 6, page: 0 }),
          themeApi.getTop(),
          searchApi.getPopular(),
        ]);

        if (restaurantsResult.status === 'fulfilled') setPopularRestaurants(restaurantsResult.value.content);
        if (themesResult.status === 'fulfilled') setTopThemes(themesResult.value);
        if (keywordsResult.status === 'fulfilled') setPopularKeywords(keywordsResult.value);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (query: string) => {
    if (query.trim()) searchApi.record(query).catch(() => { });
    window.location.href = `/restaurants?keyword=${encodeURIComponent(query)}`;
  };

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword);
    handleSearch(keyword);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* 3D Hero Section */}
      <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <Scene3D />

        {/* Gradient Overlay for better text readability - Reduced opacity to show 3D elements better */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-gray-50/60 pointer-events-none z-10" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl px-4 text-center space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 drop-shadow-sm">
              <span className="text-gradient">Delicious</span> Discovery
            </h1>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto backdrop-blur-sm bg-white/30 p-2 rounded-lg">
              Linkisy와 함께 당신의 취향을 저격할 숨은 맛집을 찾아보세요.
            </p>
          </div>

          {/* Glass Search Bar */}
          <div className="max-w-2xl mx-auto transform transition-transform hover:scale-[1.01]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="지역, 음식, 식당명으로 검색하세요..."
              variant="glass"
              inputClassName="h-14 text-lg shadow-2xl bg-white/30 backdrop-blur-xl border-white/40 text-gray-900 placeholder:text-gray-600 focus:bg-white/50"
            />
          </div>

          {/* Popular Keywords */}
          {popularKeywords.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <div className="flex items-center gap-2 mr-2 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold text-gray-700">인기</span>
              </div>
              {popularKeywords.slice(0, 5).map((kw) => (
                <button
                  key={kw.id}
                  onClick={() => handleKeywordClick(kw.keyword)}
                  className="px-4 py-1.5 bg-white/60 hover:bg-white backdrop-blur-md rounded-full text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:text-orange-600 transition-all"
                >
                  #{kw.keyword}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <Utensils className="h-6 w-6 text-orange-500" />
              카테고리별 맛집
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/restaurants?category=${encodeURIComponent(category.name)}`}
                  className={`group relative flex flex-col items-center justify-center p-6 bg-gradient-to-br ${category.color} rounded-2xl border ${category.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="mb-3 p-3 bg-white/60 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <span className="font-bold text-gray-800">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Restaurants - Modern Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Flame className="h-8 w-8 text-orange-500" />
                실시간 인기 맛집
              </h2>
              <p className="text-gray-500">지금 가장 핫한 플레이스를 만나보세요</p>
            </div>
            <Link
              href="/restaurants?sort=rating"
              className="group flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 px-4 py-2 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              모두 보기
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularRestaurants.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="group">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full border border-gray-100">
                    <div className="relative h-60 overflow-hidden">
                      {restaurant.thumbnail ? (
                        <Image
                          src={restaurant.thumbnail}
                          alt={restaurant.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Utensils className="h-12 w-12 text-gray-300" />
                        </div>
                      )}

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                          {restaurant.category}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                        <span className="text-sm font-bold text-gray-900">{restaurant.avgRating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            리뷰 {restaurant.reviewCount}
                          </span>
                        </div>
                        <button className="text-sm font-semibold text-orange-500 group-hover:underline">
                          예약하기
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Themes - Bento Style */}
      {topThemes.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center gap-2">
              <Compass className="h-8 w-8 text-orange-500" />
              큐레이션 테마
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
              {topThemes.map((theme, idx) => (
                <Link
                  key={theme.id}
                  href={`/themes/${theme.id}`}
                  className={`group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                >
                  {theme.thumbnail ? (
                    <Image src={theme.thumbnail} alt={theme.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full mb-2">
                        {theme.restaurantCount} places
                      </span>
                    </div>
                    <h3 className={`font-bold text-white mb-2 leading-tight ${idx === 0 ? 'text-3xl' : 'text-xl'}`}>
                      {theme.title}
                    </h3>
                    <div className="flex items-center justify-between text-white/80 text-sm">
                      <span>by {theme.member.nickname}</span>
                      <div className="flex items-center gap-3">
                        <span>❤️ {theme.likeCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 z-0" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80')] bg-cover bg-center bg-fixed" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            사장님이신가요?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Linkisy의 3D 기반 푸드 플랫폼과 함께 더 많은 고객을 만나보세요.<br />
            혁신적인 예약 관리와 홍보 효과를 경험할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=business">
              <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1">
                파트너로 시작하기
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur text-white border border-white/20 rounded-full font-bold text-lg transition-all">
                입점 문의하기
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

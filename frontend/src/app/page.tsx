'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  ArrowRight,
  Utensils,
  Coffee,
  Pizza,
  Soup,
  Fish,
  Beef,
} from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import { Restaurant } from '@/types';
import Button from '@/components/common/Button';
import SearchBar from '@/components/common/SearchBar';

// 카테고리 아이콘 매핑
const categoryIcons: Record<string, React.ReactNode> = {
  '한식': <Soup className="h-6 w-6" />,
  '중식': <Utensils className="h-6 w-6" />,
  '일식': <Fish className="h-6 w-6" />,
  '양식': <Beef className="h-6 w-6" />,
  '카페': <Coffee className="h-6 w-6" />,
  '분식': <Pizza className="h-6 w-6" />,
};

const categories = [
  { name: '한식', icon: <Soup className="h-8 w-8" />, color: 'bg-red-100 text-red-600' },
  { name: '중식', icon: <Utensils className="h-8 w-8" />, color: 'bg-yellow-100 text-yellow-600' },
  { name: '일식', icon: <Fish className="h-8 w-8" />, color: 'bg-blue-100 text-blue-600' },
  { name: '양식', icon: <Beef className="h-8 w-8" />, color: 'bg-green-100 text-green-600' },
  { name: '카페', icon: <Coffee className="h-8 w-8" />, color: 'bg-amber-100 text-amber-600' },
  { name: '분식', icon: <Pizza className="h-8 w-8" />, color: 'bg-orange-100 text-orange-600' },
];

export default function HomePage() {
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPopularRestaurants = async () => {
      try {
        const response = await restaurantApi.getList({ 
          sort: 'avgRating', 
          size: 6,
          page: 0 
        });
        setPopularRestaurants(response.content);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularRestaurants();
  }, []);

  const handleSearch = (query: string) => {
    window.location.href = `/restaurants?keyword=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              내 주변 맛집을 <br className="sm:hidden" />
              찾아보세요
            </h1>
            <p className="text-lg md:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              EzenRoad와 함께 숨겨진 맛집을 발견하고, <br className="hidden sm:block" />
              소중한 사람들과 특별한 식사를 즐겨보세요.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  placeholder="지역, 음식, 식당명으로 검색"
                  className="w-full"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link 
                href="/restaurants"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                주변 맛집
              </Link>
              <Link 
                href="/reviews"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
              >
                <Star className="h-4 w-4" />
                인기 리뷰
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            카테고리로 찾기
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/restaurants?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className={`p-4 rounded-full ${category.color} mb-3 group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              인기 맛집 🔥
            </h2>
            <Link
              href="/restaurants?sort=rating"
              className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
            >
              더보기
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            EzenRoad 서비스
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Search className="h-8 w-8 text-orange-500" />}
              title="맛집 검색"
              description="지역, 음식 종류, 키워드로 원하는 맛집을 쉽게 찾아보세요."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-orange-500" />}
              title="예약 & 대기"
              description="원하는 시간에 예약하거나, 실시간으로 대기 순번을 확인하세요."
            />
            <FeatureCard
              icon={<Star className="h-8 w-8 text-orange-500" />}
              title="리뷰 & 평점"
              description="다른 사용자들의 솔직한 리뷰를 확인하고 나만의 리뷰를 남겨보세요."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            사장님이신가요?
          </h2>
          <p className="text-orange-100 mb-8 max-w-xl mx-auto">
            EzenRoad에 가게를 등록하고 더 많은 고객을 만나보세요. <br />
            무료로 시작할 수 있습니다.
          </p>
          <Link href="/register?role=business">
            <Button variant="secondary" size="lg">
              사업자 회원가입
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

// 식당 카드 컴포넌트
function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
        <div className="relative h-48 bg-gray-200">
          {restaurant.thumbnail ? (
            <img
              src={restaurant.thumbnail}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Utensils className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium">
            {restaurant.category}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-1">
            {restaurant.address}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 font-medium">{restaurant.avgRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-400">
              리뷰 {restaurant.reviewCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// 기능 소개 카드 컴포넌트
function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}

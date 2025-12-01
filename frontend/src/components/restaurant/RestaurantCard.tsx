'use client';

import Link from 'next/link';
import { Star, MapPin, Heart } from 'lucide-react';
import { Restaurant } from '@/types';
import { cn } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFollowed?: boolean;
  onFollowToggle?: (restaurantId: number) => void;
  className?: string;
}

export default function RestaurantCard({
  restaurant,
  isFollowed = false,
  onFollowToggle,
  className,
}: RestaurantCardProps) {
  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFollowToggle?.(restaurant.id);
  };

  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <div
        className={cn(
          'bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow',
          className
        )}
      >
        {/* 이미지 */}
        <div className="relative aspect-[4/3] bg-gray-100">
          {restaurant.thumbnail ? (
            <img
              src={restaurant.thumbnail}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          
          {/* 카테고리 배지 */}
          <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {restaurant.category}
          </span>

          {/* 찜 버튼 */}
          {onFollowToggle && (
            <button
              onClick={handleFollowClick}
              className={cn(
                'absolute top-3 right-3 p-2 rounded-full transition-colors',
                isFollowed
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-500'
              )}
            >
              <Heart className={cn('h-4 w-4', isFollowed && 'fill-current')} />
            </button>
          )}
        </div>

        {/* 정보 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{restaurant.name}</h3>
          
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-sm">{restaurant.avgRating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({restaurant.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{restaurant.address}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

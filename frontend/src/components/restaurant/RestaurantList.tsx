'use client';

import { Restaurant } from '@/types';
import RestaurantCard from './RestaurantCard';
import Loading from '@/components/common/Loading';

interface RestaurantListProps {
  restaurants: Restaurant[];
  isLoading?: boolean;
  followedIds?: number[];
  onFollowToggle?: (restaurantId: number) => void;
  emptyMessage?: string;
  className?: string;
}

export default function RestaurantList({
  restaurants,
  isLoading = false,
  followedIds = [],
  onFollowToggle,
  emptyMessage = '등록된 식당이 없습니다',
  className,
}: RestaurantListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl mb-4 block">🍽️</span>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className || 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}>
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          isFollowed={followedIds.includes(restaurant.id)}
          onFollowToggle={onFollowToggle}
        />
      ))}
    </div>
  );
}

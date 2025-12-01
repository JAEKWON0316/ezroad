'use client';

import { Review } from '@/types';
import ReviewCard from './ReviewCard';
import Loading from '@/components/common/Loading';
import Button from '@/components/common/Button';
import { MessageSquare } from 'lucide-react';

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  showRestaurant?: boolean;
  currentUserId?: number;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  emptyMessage?: string;
}

export default function ReviewList({
  reviews,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  showRestaurant = false,
  currentUserId,
  onEdit,
  onDelete,
  emptyMessage = '아직 리뷰가 없습니다',
}: ReviewListProps) {
  if (isLoading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showRestaurant={showRestaurant}
          isOwner={currentUserId === review.member?.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {hasMore && onLoadMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onLoadMore}
          isLoading={isLoading}
        >
          더보기
        </Button>
      )}
    </div>
  );
}

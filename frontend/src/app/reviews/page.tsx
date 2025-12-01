'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Star, MessageSquare, User, MapPin } from 'lucide-react';
import { reviewApi } from '@/lib/api';
import { Review, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import RatingStars from '@/components/common/RatingStars';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Review> = await reviewApi.getAll(page, 12);
      setReviews(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            맛집 리뷰 ⭐
          </h1>
          <p className="text-gray-500 mt-2">
            {totalElements.toLocaleString()}개의 솔직한 리뷰를 확인해보세요
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">아직 리뷰가 없습니다</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

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

function ReviewCard({ review }: { review: Review }) {
  return (
    <Link href={`/restaurants/${review.restaurantId}`}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Review Image */}
        {review.images && review.images.length > 0 ? (
          <div className="relative h-48">
            <img
              src={review.images[0]}
              alt="리뷰 이미지"
              className="w-full h-full object-cover"
            />
            {review.images.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                +{review.images.length - 1}
              </span>
            )}
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-orange-300" />
          </div>
        )}

        <div className="p-4 flex-1 flex flex-col">
          {/* Restaurant Info */}
          {review.restaurant && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                {review.restaurant.category}
              </span>
              <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                {review.restaurant.name}
              </span>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={review.rating} size="sm" />
            <span className="text-sm font-medium text-gray-900">{review.rating}.0</span>
          </div>

          {/* Content */}
          {review.title && (
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{review.title}</h3>
          )}
          <p className="text-gray-600 text-sm line-clamp-3 flex-1">{review.content}</p>

          {/* Author & Date */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                {review.member?.profileImage ? (
                  <img
                    src={review.member.profileImage}
                    alt={review.member.nickname}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3 w-3 text-gray-400" />
                )}
              </div>
              <span className="text-sm text-gray-600">{review.member?.nickname}</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

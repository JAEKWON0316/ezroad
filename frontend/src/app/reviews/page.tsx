'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MessageSquare, User, MapPin, Quote } from 'lucide-react';
import { reviewApi } from '@/lib/api';
import { Review, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import RatingStars from '@/components/common/RatingStars';
import { useAuth } from '@/context/AuthContext';
import { useReviews } from '@/hooks/useReviews';
import Button from '@/components/common/Button';
import ReviewCardSkeleton from '@/components/review/ReviewCardSkeleton';

export default function ReviewsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useReviews(page, 12);

  const reviews = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Modern Header */}
      <div className="relative bg-gradient-to-br from-yellow-500 to-orange-600 text-white overflow-hidden mb-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-full mb-6 shadow-lg animate-fade-in-up">
            <MessageSquare className="h-8 w-8 text-yellow-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 shadow-sm animate-fade-in-up delay-75">
            생생한 맛집 리뷰
          </h1>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto animate-fade-in-up delay-150">
            <span className="font-bold text-white">{totalElements.toLocaleString()}</span>개의 솔직한 후기가 여러분을 기다리고 있어요.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">아직 작성된 리뷰가 없어요</h3>
            <p className="text-gray-500">첫 번째 리뷰의 주인공이 되어보세요!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {reviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-16 flex justify-center">
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

function ReviewCard({ review, index }: { review: any; index: number }) {
  return (
    <Link href={`/reviews/${review.id}`} className="group h-full block">
      <div
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1 transform"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Review Image Area */}
        <div className="relative h-56 overflow-hidden bg-gray-100">
          {review.imageUrls && review.imageUrls.length > 0 ? (
            <Image
              src={review.imageUrls[0]}
              alt="리뷰 이미지"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 group-hover:scale-110 transition-transform duration-700">
              <Quote className="h-12 w-12 text-orange-200" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Top Badge: Restaurant Category */}
          {review.restaurantCategory && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
              {review.restaurantCategory}
            </span>
          )}

          {/* Bottom Badge: Rating */}
          <div className="absolute bottom-3 right-3 flex items-center bg-white/95 backdrop-blur px-2 py-1 rounded-lg shadow-lg">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-bold text-gray-900">{review.rating.toFixed(1)}</span>
          </div>

          {review.imageUrls && review.imageUrls.length > 1 && (
            <span className="absolute bottom-3 left-3 bg-black/50 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full">
              +{review.imageUrls.length - 1} more
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Restaurant Name */}
          {review.restaurantName && (
            <h3 className="font-bold text-lg text-gray-900 mb-2 truncate group-hover:text-orange-600 transition-colors">
              {review.restaurantName}
            </h3>
          )}

          {/* Review Text */}
          <div className="relative mb-4 flex-1">
            <Quote className="absolute -top-1 -left-1 w-6 h-6 text-gray-100 fill-current -z-10 transform scale-150 rotate-180" />
            {review.title && (
              <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-1">{review.title}</h4>
            )}
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
              {review.content}
            </p>
          </div>

          {/* Footer: User & Date */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm">
                {review.memberProfileImage ? (
                  <Image
                    src={review.memberProfileImage}
                    alt={review.memberNickname || '사용자'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700 line-clamp-1 max-w-[100px]">{review.memberNickname}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Star, MapPin, Edit, Trash2, MessageSquare, Quote } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reviewApi } from '@/lib/api';
import { Review, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import CardListSkeleton from '@/components/common/CardListSkeleton';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';
import RatingStars from '@/components/common/RatingStars';

export default function MyReviewsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Review> = await reviewApi.getMyReviews(page, 10);
      setReviews(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('리뷰 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchReviews();
    }
  }, [authLoading, isAuthenticated, router, fetchReviews]);

  const handleDeleteReview = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    try {
      await reviewApi.delete(deleteModal.id);
      toast.success('리뷰가 삭제되었습니다');
      setDeleteModal({ isOpen: false, id: null });
      fetchReviews();
    } catch {
      toast.error('리뷰 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">내 리뷰 관리</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <CardListSkeleton viewMode="grid" count={6} />
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">작성한 리뷰가 없습니다</h3>
            <p className="text-gray-500 mb-8 text-center max-w-xs">
              맛집을 방문하고 경험을 공유하면<br />다른 분들에게 큰 도움이 됩니다.
            </p>
            <Link href="/restaurants">
              <Button size="lg" className="shadow-lg shadow-orange-200">리뷰 작성하러 가기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-1">
                    {/* Flex layout for image and basic info */}
                    <div className="flex gap-4 p-4 pb-0">
                      {/* Conditionally render thumbnail if images exist */}
                      {review.images && review.images.length > 0 && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          <Image
                            src={review.images[0]}
                            alt="Review thumbnail"
                            fill
                            className="object-cover"
                          />
                          {review.images.length > 1 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs">
                              +{review.images.length - 1}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <Link href={`/restaurants/${review.restaurantId}`}>
                            <h3 className="font-bold text-lg text-gray-900 hover:text-orange-600 truncate transition-colors">
                              {review.restaurant?.name || '식당 정보 없음'}
                            </h3>
                          </Link>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => router.push(`/reviews/${review.id}/edit`)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
                              title="수정"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, id: review.id })}
                              className="p-1.5 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {review.restaurant?.address && (
                          <p className="text-xs text-gray-500 flex items-center mt-1 mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            {review.restaurant.address}
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          <RatingStars rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toISOString().split('T')[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 pt-3">
                      {review.title && (
                        <h4 className="font-bold text-gray-800 mb-1">{review.title}</h4>
                      )}
                      <div className="relative bg-gray-50 rounded-xl p-4 mt-2">
                        <Quote className="absolute top-2 left-2 w-4 h-4 text-gray-200 transform scale-150 rotate-180" />
                        <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed relative z-10 pl-2">
                          {review.content}
                        </p>
                      </div>
                      <div className="mt-3 text-right text-xs text-gray-400">
                        조회수 {review.viewCount || 0}회
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="리뷰 삭제"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">이 리뷰를 삭제하시겠습니까?</p>
            <p className="text-sm text-gray-500 mt-1">삭제된 내용은 복구할 수 없습니다.</p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 py-3"
              onClick={() => setDeleteModal({ isOpen: false, id: null })}
            >
              취소
            </Button>
            <Button
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 shadow-md shadow-red-200"
              onClick={handleDeleteReview}
              isLoading={isDeleting}
            >
              삭제하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

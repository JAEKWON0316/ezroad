'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Star, MapPin, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reviewApi } from '@/lib/api';
import { Review, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="font-semibold text-gray-900">내 리뷰</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">작성한 리뷰가 없습니다</p>
            <Link href="/restaurants">
              <Button>맛집 둘러보고 리뷰 작성하기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link href={`/restaurants/${review.restaurantId}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-orange-500">
                            {review.restaurant?.name || '식당 정보 없음'}
                          </h3>
                        </Link>
                        {review.restaurant?.address && (
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {review.restaurant.address}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/reviews/${review.id}/edit`)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: review.id })}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {review.title && (
                      <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                    )}
                    
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{review.content}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`리뷰 이미지 ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                      조회수 {review.viewCount || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
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
          <p className="text-gray-600">정말 이 리뷰를 삭제하시겠습니까? 삭제된 리뷰는 복구할 수 없습니다.</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteModal({ isOpen: false, id: null })}
            >
              취소
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={handleDeleteReview}
              isLoading={isDeleting}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

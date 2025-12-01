'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Star, MapPin, Eye, Calendar, Edit, Trash2, ThumbsUp, Share2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reviewApi } from '@/lib/api';
import { Review } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await reviewApi.getById(parseInt(id));
        setReview(data);
      } catch {
        toast.error('리뷰를 불러오는데 실패했습니다');
        router.push('/reviews');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReview();
  }, [id, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await reviewApi.delete(parseInt(id));
      toast.success('리뷰가 삭제되었습니다');
      router.push('/reviews');
    } catch {
      toast.error('리뷰 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 복사되었습니다');
    } catch {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">리뷰를 찾을 수 없습니다</p>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === review.memberId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="font-semibold text-gray-900">리뷰 상세</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full">
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
            {isOwner && (
              <>
                <Link href={`/reviews/${id}/edit`}>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Edit className="h-5 w-5 text-gray-600" />
                  </button>
                </Link>
                <button 
                  onClick={() => setDeleteModal(true)}
                  className="p-2 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Restaurant Info */}
        <Link href={`/restaurants/${review.restaurantId}`}>
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {review.restaurant?.thumbnail ? (
                  <img 
                    src={review.restaurant.thumbnail} 
                    alt={review.restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{review.restaurant?.name || '식당 정보 없음'}</h2>
                {review.restaurant?.address && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {review.restaurant.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Review Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Author Info */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  {review.member?.profileImage ? (
                    <img 
                      src={review.member.profileImage} 
                      alt={review.member.nickname}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-orange-500 font-medium">
                      {review.member?.nickname?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.member?.nickname || '사용자'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>
          </div>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="p-4 border-b">
              <div className="grid grid-cols-3 gap-2">
                {review.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img 
                      src={image} 
                      alt={`리뷰 이미지 ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {review.title && (
              <h3 className="font-semibold text-lg text-gray-900 mb-3">{review.title}</h3>
            )}
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{review.content}</p>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                조회 {review.viewCount || 0}
              </span>
            </div>
            <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
              <ThumbsUp className="h-4 w-4" />
              도움이 돼요
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="리뷰 이미지"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="리뷰 삭제"
      >
        <div className="space-y-4">
          <p className="text-gray-600">정말 이 리뷰를 삭제하시겠습니까? 삭제된 리뷰는 복구할 수 없습니다.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModal(false)}>
              취소
            </Button>
            <Button 
              className="flex-1 bg-red-500 hover:bg-red-600" 
              onClick={handleDelete}
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

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Flag } from 'lucide-react';
import { Review } from '@/types';
import RatingStars from '@/components/common/RatingStars';
import ReportModal from '@/components/common/ReportModal';
import { formatRelativeTime } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  showRestaurant?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  isOwner?: boolean;
}

export default function ReviewCard({
  review,
  showRestaurant = false,
  onEdit,
  onDelete,
  isOwner = false,
}: ReviewCardProps) {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl p-5 shadow-sm">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
              {review.memberProfileImage ? (
                <Image
                  src={review.memberProfileImage}
                  alt={review.memberNickname || '사용자'}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <span className="text-orange-500 font-medium">
                  {review.memberNickname?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{review.memberNickname || '익명'}</p>
              <div className="flex items-center gap-2 text-sm">
                <RatingStars rating={review.rating} size="sm" />
                <span className="text-gray-400">{formatRelativeTime(review.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* 수정/삭제/신고 버튼 */}
          <div className="flex gap-2">
            {isOwner ? (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(review)}
                    className="text-sm text-gray-500 hover:text-orange-500"
                  >
                    수정
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(review.id)}
                    className="text-sm text-gray-500 hover:text-red-500"
                  >
                    삭제
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowReportModal(true)}
                className="text-gray-400 hover:text-red-500 p-1"
                title="신고하기"
              >
                <Flag className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 식당 정보 (선택적) */}
        {showRestaurant && review.restaurantName && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{review.restaurantName}</p>
            <p className="text-sm text-gray-500">{review.restaurantCategory}</p>
          </div>
        )}

        {/* 리뷰 내용 */}
        {review.title && (
          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
        )}
        <p className="text-gray-600 whitespace-pre-line">{review.content}</p>

        {/* 이미지 */}
        {review.imageUrls && review.imageUrls.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {review.imageUrls.map((imageUrl, index) => (
              <div key={index} className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={`리뷰 이미지 ${index + 1}`}
                  fill
                  sizes="96px"
                  className="rounded-lg object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 신고 모달 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="REVIEW"
        targetId={review.id}
        targetName={review.title || review.content.slice(0, 30)}
      />
    </>
  );
}

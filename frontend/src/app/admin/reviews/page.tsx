'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Star, Trash2, Eye } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Review, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [deleteModal, setDeleteModal] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Review> = await adminApi.getReviews(page, 20);
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
    fetchReviews();
  }, [fetchReviews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchReviews();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    
    setIsSubmitting(true);
    try {
      await adminApi.deleteReview(deleteModal.id);
      toast.success('리뷰가 삭제되었습니다');
      setDeleteModal(null);
      fetchReviews();
    } catch {
      toast.error('리뷰 삭제에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">리뷰 관리</h1>
        <p className="text-gray-500 mt-1">등록된 리뷰를 관리합니다.</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="리뷰 내용으로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <Button type="submit">검색</Button>
        </form>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            리뷰가 없습니다
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">식당</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">내용</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평점</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성일</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-500 font-medium text-sm">
                          {review.memberNickname?.charAt(0) || '?'}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{review.memberNickname || '탈퇴한 사용자'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {review.restaurantName || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                    {review.content}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeleteModal(review)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="리뷰 삭제"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            이 리뷰를 삭제하시겠습니까?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-1 mb-2">
              {deleteModal && renderStars(deleteModal.rating)}
            </div>
            <p className="text-sm text-gray-600 line-clamp-3">{deleteModal?.content}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModal(null)}>취소</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleDelete} isLoading={isSubmitting}>삭제</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

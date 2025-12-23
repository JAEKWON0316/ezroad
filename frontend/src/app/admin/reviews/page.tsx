'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Trash2, MessageSquare, Calendar, Store, Eye } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Review, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

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
      const response: PageResponse<Review> = await adminApi.getReviews(page, 10, keyword || undefined);
      setReviews(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('리뷰 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page, keyword]);

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

  // 서버사이드 검색을 사용하므로 클라이언트 필터링은 제거하고 reviews를 직접 사용합니다.
  const filteredReviews = reviews;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">리뷰 관리</h1>
          <p className="text-gray-500 font-medium mt-1">사용자들이 남긴 소중한 리뷰를 모니터링하고 관리하세요.</p>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
            <div className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-100">
              모든 리뷰
            </div>
          </div>
        </motion.div>
      </header>

      {/* Premium Search Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-xl shadow-gray-200/50"
      >
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="리뷰 내용, 작성자, 식당 이름으로 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all outline-none font-medium"
            />
          </div>
          <Button type="submit" className="h-12 px-8 rounded-2xl font-black shadow-lg shadow-orange-200">
            검색
          </Button>
        </form>
      </motion.div>

      {/* Results Table/List */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <Loading size="lg" />
            <p className="mt-4 text-gray-400 font-bold animate-pulse">데이터를 불러오는 중...</p>
          </motion.div>
        ) : filteredReviews.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100"
          >
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">등록된 리뷰가 없습니다</h3>
            <p className="text-gray-400 font-medium">검색어를 변경하거나 나중에 다시 확인해 보세요.</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/30 hover:shadow-orange-100/50 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Author & Info Column */}
                  <div className="lg:w-64 shrink-0 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-black overflow-hidden shadow-inner">
                        {review.memberProfileImage ? (
                          <img src={review.memberProfileImage} alt={review.memberNickname} className="w-full h-full object-cover" />
                        ) : (
                          review.memberNickname?.charAt(0) || 'U'
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">{review.memberNickname || '익명 사용자'}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{review.memberId ? `MEMBER ID: ${review.memberId}` : 'GUEST'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                        <Store className="w-3.5 h-3.5 text-orange-500" />
                        <span className="truncate">{review.restaurantName || '알 수 없는 식당'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{review.createdAt ? format(new Date(review.createdAt), 'yyyy. MM. dd', { locale: ko }) : '-'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 rounded-xl">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-yellow-700">{review.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {review.title && (
                        <h4 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                          {review.title}
                        </h4>
                      )}
                      <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap line-clamp-3">
                        {review.content}
                      </p>

                      {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {review.imageUrls.slice(0, 3).map((url, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                              <img src={url} alt="Review" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {review.imageUrls.length > 3 && (
                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                              +{review.imageUrls.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          댓글 0
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          조회 {review.hit || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => setDeleteModal(review)}
                        className="px-5 py-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl text-xs font-black transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        삭제하기
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Premium Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="리뷰 삭제 확인"
      >
        <div className="space-y-6 py-2">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-2">
            <Trash2 className="w-10 h-10" />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-black text-gray-900 mb-2">정말 이 리뷰를 삭제할까요?</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              <span className="font-bold underline decoration-rose-200">"{deleteModal?.content.substring(0, 20)}..."</span><br />
              리뷰를 삭제하면 복구할 수 없으며, 사용자 포인트 산정에도 영향을 줄 수 있습니다.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black border-2" onClick={() => setDeleteModal(null)}>취소</Button>
            <Button className="flex-1 h-14 rounded-2xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100" onClick={handleDelete} isLoading={isSubmitting}>삭제 승인</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

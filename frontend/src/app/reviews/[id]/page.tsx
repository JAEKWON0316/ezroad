'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Star,
  MapPin,
  Eye,
  Calendar,
  Edit,
  Trash2,
  ThumbsUp,
  Share2,
  Flag,
  MoreVertical,
  Maximize2,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reviewApi } from '@/lib/api';
import { Review } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import ReportModal from '@/components/common/ReportModal';
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
  const [reportModal, setReportModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

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
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-orange-500 fill-orange-500' : 'text-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loading size="lg" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <p className="text-gray-500 font-medium">리뷰를 찾을 수 없습니다</p>
          <Button onClick={() => router.push('/reviews')}>목록으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === review.memberId;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Premium Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-orange-50 sticky top-16 z-40"
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 hover:bg-orange-50 rounded-2xl transition-all text-gray-500 hover:text-orange-600"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="font-black text-lg text-[#0F172A] tracking-tight">리뷰 상세</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 hover:bg-orange-50 rounded-2xl transition-all text-gray-500 hover:text-orange-600"
              title="링크 복사"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {isAuthenticated && !isOwner && (
              <button
                onClick={() => setReportModal(true)}
                className="p-2.5 hover:bg-red-50 rounded-2xl transition-all text-gray-500 hover:text-red-500"
                title="신고하기"
              >
                <Flag className="h-5 w-5" />
              </button>
            )}

            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2.5 hover:bg-orange-50 rounded-2xl transition-all text-gray-500 hover:text-orange-600"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl shadow-orange-100 border border-orange-50 p-2 z-50 overflow-hidden"
                    >
                      <Link href={`/reviews/${id}/edit`} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 rounded-xl transition-all text-sm font-bold text-gray-600 hover:text-orange-600">
                        <Edit className="h-4 w-4" />
                        수정하기
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteModal(true);
                          setShowActions(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-all text-sm font-bold text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제하기
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-6 py-8 pb-24 space-y-8">
        {/* Restaurant Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href={`/restaurants/${review.restaurantId}`}>
            <div className="group bg-white rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-orange-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:opacity-[0.08] transition-opacity" />

              <div className="flex items-center gap-5 relative z-10">
                <div className="relative w-20 h-20 bg-gray-50 rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  {(review as any).restaurantThumbnail ? (
                    <Image
                      src={(review as any).restaurantThumbnail}
                      alt={(review as any).restaurantName || '식당'}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-1 bg-orange-100 text-[10px] font-black text-orange-600 rounded-lg uppercase tracking-wider">Restaurant</span>
                  </div>
                  <h2 className="text-xl font-black text-[#0F172A] group-hover:text-orange-500 transition-colors">
                    {(review as any).restaurantName || '식당 정보 없음'}
                  </h2>
                  {(review as any).restaurantAddress && (
                    <p className="text-sm text-gray-400 font-medium flex items-center mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-orange-300" />
                      {(review as any).restaurantAddress}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <Plus className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Review Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[3rem] shadow-sm border border-orange-50 overflow-hidden"
        >
          {/* Author Header */}
          <div className="px-8 py-6 border-b border-orange-50/50 flex items-center justify-between bg-gradient-to-r from-white to-orange-50/20">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-[1.25rem] flex items-center justify-center overflow-hidden shadow-sm">
                {(review as any).memberProfileImage ? (
                  <Image
                    src={(review as any).memberProfileImage}
                    alt={(review as any).memberNickname || '사용자'}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-orange-600 font-black text-xl">
                    {(review as any).memberNickname?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-black text-[#0F172A]">{(review as any).memberNickname || '사용자'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-orange-300" />
                    {new Date(review.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Rating</p>
              {renderStars(review.rating)}
            </div>
          </div>

          <div className="p-8 pb-4">
            {review.title && (
              <h3 className="text-2xl font-black text-[#0F172A] mb-6 leading-tight tracking-tight">{review.title}</h3>
            )}
            <p className="text-gray-600 whitespace-pre-wrap leading-[1.8] text-lg font-medium">
              {review.content}
            </p>
          </div>

          {/* Premium Image Grid */}
          {(review as any).imageUrls && (review as any).imageUrls.length > 0 && (
            <div className="px-8 py-4">
              <div className={`grid gap-3 ${(review as any).imageUrls.length === 1 ? 'grid-cols-1' :
                  (review as any).imageUrls.length === 2 ? 'grid-cols-2' :
                    'grid-cols-3'
                }`}>
                {(review as any).imageUrls.map((image: string, index: number) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 0.98 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(image)}
                    className="relative aspect-[4/3] bg-gray-50 rounded-[2rem] overflow-hidden group shadow-sm"
                  >
                    <Image
                      src={image}
                      alt={`리뷰 이미지 ${index + 1}`}
                      fill
                      sizes="33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Stats Footer */}
          <div className="px-8 py-6 mt-4 bg-gray-50/50 flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <Eye className="h-4 w-4 text-orange-300" />
                <span>Views <span className="text-[#0F172A] ml-1">{(review as any).hit || 0}</span></span>
              </div>
            </div>
            <motion.button
              whileHover={{ x: 5 }}
              className="flex items-center gap-2.5 text-orange-500 font-black tracking-tight group"
            >
              <ThumbsUp className="h-4 w-4 fill-orange-500 group-hover:scale-125 transition-transform" />
              도움이 돼요
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modern Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full max-w-5xl max-h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <Image
                src={selectedImage}
                alt="리뷰 이미지"
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="리뷰 삭제"
      >
        <div className="space-y-6 pt-2">
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
            <Trash2 className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
            <p className="text-sm font-bold text-red-900 leading-relaxed">
              정말 이 리뷰를 삭제하시겠습니까? 삭제된 후에는 다시 복구하실 수 없습니다.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-2xl h-14" onClick={() => setDeleteModal(false)}>
              취소
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 rounded-2xl h-14"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              삭제하기
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal}
        onClose={() => setReportModal(false)}
        targetType="REVIEW"
        targetId={parseInt(id)}
        targetName={review.title || '리뷰'}
      />
    </div>
  );
}

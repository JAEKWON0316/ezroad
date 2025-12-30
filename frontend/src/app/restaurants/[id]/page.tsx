'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  MapPin,
  Phone,
  Clock,
  Globe,
  Heart,
  Share2,
  ChevronLeft,
  Utensils,
  Calendar,
  Users,
  MessageSquare,
  Flag,
} from 'lucide-react';
import { restaurantApi, menuApi, reviewApi, followApi, themeApi, waitingApi } from '@/lib/api';
import { Restaurant, Menu, Review, PageResponse, Theme } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import { useRestaurantDetail } from '@/hooks/useRestaurantDetail';
import RestaurantDetailSkeleton from '@/components/restaurant/RestaurantDetailSkeleton';
import RatingStars from '@/components/common/RatingStars';
import Modal from '@/components/common/Modal';
import ReportModal from '@/components/common/ReportModal';
import toast from 'react-hot-toast';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const restaurantId = Number(params.id);

  const {
    restaurant,
    menus,
    initialReviews: reviewsData,
    isFollowed: initialIsFollowed,
    isLoading,
    isError,
    refetchFollow
  } = useRestaurantDetail(restaurantId, isAuthenticated);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'reviews'>('info');

  // Handle tab from query param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'menu' || tabParam === 'reviews' || tabParam === 'info') {
      setActiveTab(tabParam);

      // Auto scroll to content if tab is specified
      if (tabParam !== 'info') {
        const timer = setTimeout(() => {
          const container = document.getElementById('content-container');
          if (container) {
            const offset = container.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offset, behavior: 'smooth' });
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [myThemes, setMyThemes] = useState<Theme[]>([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  // 🔴 실시간 대기 인원
  const [waitingCount, setWaitingCount] = useState<number>(0);

  // 🔴 WebSocket 연결
  const { isConnected, subscribeToWaitingCount } = useWebSocket();

  // Sync React Query data to local state for updates (like load more reviews)
  useEffect(() => {
    if (reviewsData) {
      setReviews(reviewsData.content);
      setHasMoreReviews(0 < reviewsData.totalPages - 1);
    }
  }, [reviewsData]);

  useEffect(() => {
    setIsFollowed(initialIsFollowed);
  }, [initialIsFollowed]);

  // 🔴 초기 대기 인원 조회 + WebSocket 구독
  useEffect(() => {
    // 초기 대기 인원 조회 (API)
    const fetchWaitingCount = async () => {
      try {
        const response = await waitingApi.getWaitingCount(restaurantId);
        setWaitingCount(response.waitingCount || 0);
      } catch (error) {
        console.error('Failed to fetch waiting count:', error);
      }
    };

    if (restaurantId) {
      fetchWaitingCount();
    }
  }, [restaurantId]);

  // 🔴 WebSocket 구독 (연결 후)
  useEffect(() => {
    if (!isConnected || !restaurantId) return;

    const unsubscribe = subscribeToWaitingCount(restaurantId, (data) => {
      console.log('[Restaurant] Waiting count update:', data);
      setWaitingCount(data.waitingCount);
    });

    return () => {
      unsubscribe?.();
    };
  }, [isConnected, restaurantId, subscribeToWaitingCount]);

  const fetchReviews = useCallback(async (page: number) => {
    try {
      const response: PageResponse<Review> = await reviewApi.getByRestaurant(restaurantId, page, 5);
      if (page === 0) {
        setReviews(response.content);
      } else {
        setReviews(prev => [...prev, ...response.content]);
      }
      setHasMoreReviews(page < response.totalPages - 1);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  }, [restaurantId]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      return;
    }
    try {
      if (isFollowed) {
        await followApi.unfollowRestaurant(restaurantId);
        setIsFollowed(false);
        toast.success('찜 해제했습니다');
      } else {
        await followApi.followRestaurant(restaurantId);
        setIsFollowed(true);
        toast.success('찜했습니다');
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: restaurant?.name,
        text: restaurant?.description,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 복사되었습니다');
    }
  };

  const handleOpenThemeModal = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      return;
    }
    try {
      const themes = await themeApi.getMyAll();
      setMyThemes(themes);
      setShowThemeModal(true);
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      toast.error('테마 목록을 불러오는데 실패했습니다');
    }
  };

  const handleAddToTheme = async (themeId: number) => {
    try {
      await themeApi.addRestaurant(themeId, { restaurantId });
      toast.success('테마에 추가되었습니다!');
      setShowThemeModal(false);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('이미 테마에 추가된 식당입니다');
      } else {
        toast.error('테마 추가에 실패했습니다');
      }
    }
  };

  const loadMoreReviews = () => {
    const nextPage = reviewPage + 1;
    setReviewPage(nextPage);
    fetchReviews(nextPage);
  };

  if (isLoading) {
    return <RestaurantDetailSkeleton />;
  }

  if (isError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>식당 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Immersive Hero Image */}
      <div className="relative h-[45vh] lg:h-[50vh] w-full overflow-hidden">
        {restaurant.thumbnail ? (
          <Image
            src={restaurant.thumbnail}
            alt={restaurant.name}
            fill
            priority
            sizes="100vw"
            className="object-cover animate-scale-in"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Utensils className="h-20 w-20 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Navigation & Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/30 text-white transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="flex gap-2">
            {isAuthenticated && (
              <button
                onClick={handleOpenThemeModal}
                className="p-2.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/30 text-white transition-all"
                title="테마에 추가"
              >
                <span className="text-lg leading-none">📁</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/30 text-white transition-all"
            >
              <Share2 className="h-5 w-5" />
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/30 text-white transition-all"
                title="신고하기"
              >
                <Flag className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleFollow}
              className={`p-2.5 rounded-full transition-all shadow-lg ${isFollowed
                ? 'bg-red-500 text-white border border-red-400'
                : 'bg-white/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/30'
                }`}
            >
              <Heart className={`h-5 w-5 ${isFollowed ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Restaurant Title Texture */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 container mx-auto max-w-5xl">
          <div className="animate-fade-in-up">
            <span className="inline-block px-3 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white mb-3 shadow-lg">
              {restaurant.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-display mb-2 text-shadow-lg leading-tight">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex items-center bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-bold text-lg">{restaurant.avgRating.toFixed(1)}</span>
                <span className="text-white/70 text-sm ml-1">({restaurant.reviewCount})</span>
              </div>
              <div className="h-4 w-[1px] bg-white/30 mx-1"></div>
              <div className="flex items-center text-sm md:text-base font-medium">
                <MapPin className="h-4 w-4 mr-1 text-white/80" />
                {restaurant.address.split(' ')[0]} {restaurant.address.split(' ')[1]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 -mt-6" id="content-container">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 min-h-[500px]">
          {/* Tabs - Removed Sticky */}
          <div className="bg-white border-b border-gray-100 z-30 rounded-t-3xl">
            <div className="flex">
              {(['info', 'menu', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    const container = document.getElementById('content-container');
                    if (container) {
                      const offset = container.getBoundingClientRect().top + window.scrollY - 80;
                      window.scrollTo({ top: offset, behavior: 'smooth' });
                    }
                  }}
                  className={`flex-1 py-4 text-center font-medium transition-all relative ${activeTab === tab ? 'text-orange-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {tab === 'info' && '홈'}
                  {tab === 'menu' && '메뉴'}
                  {tab === 'reviews' && `리뷰 ${restaurant.reviewCount}`}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-8 animate-fade-in">
                {/* Notice */}
                {restaurant.notice && (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex gap-3 items-start">
                    <span className="text-xl">📢</span>
                    <div>
                      <h3 className="font-bold text-orange-900 mb-1">사장님 공지</h3>
                      <p className="text-orange-800 text-sm leading-relaxed">{restaurant.notice}</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {restaurant.description && (
                  <div className="prose prose-orange max-w-none">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 block border-l-4 border-orange-500 pl-3">소개</h3>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{restaurant.description}</p>
                  </div>
                )}

                {/* Information Grid */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 block border-l-4 border-orange-500 pl-3">상세 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><MapPin className="h-5 w-5 text-orange-500" /></div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 block mb-1">위치</span>
                        <p className="text-gray-900 font-medium">{restaurant.address}</p>
                        {restaurant.addressDetail && (
                          <p className="text-gray-500 text-sm mt-0.5">{restaurant.addressDetail}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm"><Clock className="h-5 w-5 text-orange-500" /></div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 block mb-1">영업 시간</span>
                        <p className="text-gray-900 font-medium whitespace-pre-line text-sm">{restaurant.businessHours || '정보 없음'}</p>
                      </div>
                    </div>

                    {restaurant.phone && (
                      <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm"><Phone className="h-5 w-5 text-orange-500" /></div>
                        <div>
                          <span className="text-xs font-bold text-gray-400 block mb-1">전화번호</span>
                          <a href={`tel:${restaurant.phone}`} className="text-gray-900 font-medium hover:text-orange-500 transition-colors">
                            {restaurant.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {restaurant.website && (
                      <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm"><Globe className="h-5 w-5 text-orange-500" /></div>
                        <div>
                          <span className="text-xs font-bold text-gray-400 block mb-1">웹사이트</span>
                          <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-medium hover:underline text-sm truncate block max-w-[200px]">
                            방문하기
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-6 animate-fade-in">
                {menus.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">등록된 메뉴가 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menus.filter(m => m.isVisible).map((menu, idx) => (
                      <div key={menu.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:shadow-lg hover:border-orange-100 transition-all duration-300 group">
                        {menu.thumbnail ? (
                          <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                            <Image
                              src={menu.thumbnail}
                              alt={menu.name}
                              fill
                              sizes="112px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-28 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Utensils className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">{menu.name}</h3>
                            {menu.description && (
                              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{menu.description}</p>
                            )}
                          </div>
                          <p className="text-orange-500 font-bold text-lg text-right">
                            {menu.price.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">리뷰 <span className="text-orange-500">{restaurant.reviewCount}</span></h3>
                  <p className="text-xs text-gray-400">
                    방문완료 후 예약 내역에서 작성 가능
                  </p>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">아직 작성된 리뷰가 없습니다</p>
                    <p className="text-gray-400 text-sm mt-1">첫 번째 리뷰의 주인공이 되어보세요!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                    {hasMoreReviews && (
                      <div className="pt-4">
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-xl text-gray-600 border-gray-300 hover:bg-gray-50"
                          onClick={loadMoreReviews}
                        >
                          리뷰 더보기
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar (Mobile/Info Tab only) - Removed Sticky (Fixed) */}
      <div className="px-4 py-6 bg-white border-t border-gray-200 md:hidden max-w-5xl mx-auto">
        {/* 🔴 모바일 대기 인원 표시 */}
        {waitingCount > 0 && (
          <div className="flex items-center justify-center gap-2 mb-3 py-2 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-purple-700 font-medium text-sm">
              현재 <span className="font-bold">{waitingCount}팀</span> 대기중
            </span>
          </div>
        )}
        <div className="flex gap-3">
          <Link href={`/waitings/new?restaurantId=${restaurantId}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-xl" size="lg">
              대기
            </Button>
          </Link>
          <Button
            className="flex-1 rounded-xl shadow-lg shadow-orange-500/30"
            size="lg"
            onClick={() => setShowReservationModal(true)}
          >
            예약하기
          </Button>
        </div>
      </div>

      {/* Desktop Floating Action Buttons (Sticky on side or bottom right) - Keeping original simple buttons in Info Tab for now, or move to sidebar? The updated design puts them in Info tab content, but maybe we need a dedicated CTA area for Desktop */}
      {activeTab === 'info' && (
        <div className="hidden md:flex justify-end items-center gap-3 mt-8 max-w-5xl mx-auto px-6 pb-10">
          {/* 🔴 실시간 대기 인원 표시 */}
          {waitingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl mr-auto">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-purple-700 font-medium">
                현재 <span className="font-bold">{waitingCount}팀</span> 대기중
              </span>
            </div>
          )}
          <Link href={`/waitings/new?restaurantId=${restaurantId}`} className="flex-1 max-w-[200px]">
            <Button variant="outline" className="w-full h-14 text-lg rounded-2xl border-2" leftIcon={<Users className="h-5 w-5" />}>
              대기 등록
            </Button>
          </Link>
          <Button
            className="flex-1 max-w-[200px] h-14 text-lg rounded-2xl shadow-xl shadow-orange-500/30 hover:-translate-y-1 transition-transform"
            onClick={() => setShowReservationModal(true)}
            leftIcon={<Calendar className="h-5 w-5" />}
          >
            예약하기
          </Button>
        </div>
      )}


      {/* Modals */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        restaurantId={restaurantId}
        restaurantName={restaurant.name}
      />

      <ThemeSelectModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        themes={myThemes}
        onSelectTheme={handleAddToTheme}
        restaurantName={restaurant.name}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="RESTAURANT"
        targetId={restaurantId}
        targetName={restaurant.name}
      />
    </div>
  );
}

// Modernized Review Card
function ReviewCard({ review }: { review: any }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            {review.memberProfileImage ? (
              <Image
                src={review.memberProfileImage}
                alt={review.memberNickname || '사용자'}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <span className="text-orange-600 font-bold text-sm">
                {review.memberNickname?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{review.memberNickname || '사용자'}</p>
            <span className="text-gray-400 text-xs">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>

      {review.title && (
        <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
      )}
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.content}</p>

      {review.imageUrls && review.imageUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
          {review.imageUrls.map((imageUrl: string, index: number) => (
            <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border border-gray-100">
              <Image
                src={imageUrl}
                alt={`리뷰 이미지 ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover hover:opacity-90 transition-opacity"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Reservation Modal Component  
function ReservationModal({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
}: {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number;
  restaurantName: string;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="예약하기">
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">예약하려면 로그인이 필요합니다</p>
          <Button onClick={() => router.push('/login')}>로그인하기</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${restaurantName} 예약`}>
      <div className="space-y-4">
        <p className="text-gray-600">예약 페이지로 이동합니다.</p>
        <Button
          className="w-full"
          onClick={() => router.push(`/reservations/new?restaurantId=${restaurantId}`)}
        >
          예약 페이지로 이동
        </Button>
      </div>
    </Modal>
  );
}

// Theme Select Modal Component
function ThemeSelectModal({
  isOpen,
  onClose,
  themes,
  onSelectTheme,
  restaurantName,
}: {
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  onSelectTheme: (themeId: number) => void;
  restaurantName: string;
}) {
  const router = useRouter();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`"${restaurantName}" 테마에 추가`}>
      <div className="space-y-3">
        {themes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">아직 생성한 테마가 없습니다</p>
            <Button onClick={() => router.push('/themes/new')}>
              새 테마 만들기
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">추가할 테마를 선택하세요</p>
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className="w-full p-3 text-left border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {theme.thumbnail ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={theme.thumbnail}
                        alt={theme.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                      <span className="text-xl">🍽️</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{theme.title}</p>
                    <p className="text-sm text-gray-500">
                      {theme.restaurantCount}개 식당 · {theme.isPublic ? '공개' : '비공개'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/themes/new')}
              >
                + 새 테마 만들기
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { restaurantApi, menuApi, reviewApi, followApi, themeApi } from '@/lib/api';
import { Restaurant, Menu, Review, PageResponse, Theme } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import RatingStars from '@/components/common/RatingStars';
import Modal from '@/components/common/Modal';
import ReportModal from '@/components/common/ReportModal';
import toast from 'react-hot-toast';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const restaurantId = Number(params.id);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'reviews'>('info');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [myThemes, setMyThemes] = useState<Theme[]>([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  const fetchRestaurant = useCallback(async () => {
    try {
      const data = await restaurantApi.getById(restaurantId);
      setRestaurant(data);
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
      toast.error('식당 정보를 불러오는데 실패했습니다');
      router.push('/restaurants');
    }
  }, [restaurantId, router]);

  const fetchMenus = useCallback(async () => {
    try {
      const data = await menuApi.getByRestaurant(restaurantId);
      setMenus(data);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    }
  }, [restaurantId]);

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

  const checkFollow = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const followed = await followApi.checkFollow(restaurantId);
      setIsFollowed(followed);
    } catch (error) {
      console.error('Failed to check follow:', error);
    }
  }, [isAuthenticated, restaurantId]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchRestaurant(),
        fetchMenus(),
        fetchReviews(0),
        checkFollow(),
      ]);
      setIsLoading(false);
    };
    init();
  }, [fetchRestaurant, fetchMenus, fetchReviews, checkFollow]);

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64 md:h-80 bg-gray-200">
        {restaurant.thumbnail ? (
          <img
            src={restaurant.thumbnail}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="h-16 w-16 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isAuthenticated && (
            <button
              onClick={handleOpenThemeModal}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
              title="테마에 추가"
            >
              <span className="text-lg">📁</span>
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
          >
            <Share2 className="h-5 w-5" />
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
              title="신고하기"
            >
              <Flag className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleFollow}
            className={`p-2 rounded-full ${
              isFollowed 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 backdrop-blur-sm hover:bg-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFollowed ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <span className="inline-block px-3 py-1 bg-orange-500 rounded-full text-sm font-medium mb-2">
            {restaurant.category}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-semibold">{restaurant.avgRating.toFixed(1)}</span>
              <span className="ml-1 opacity-80">({restaurant.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 bg-white border-b z-30">
        <div className="max-w-4xl mx-auto">
          <div className="flex">
            {(['info', 'menu', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                  activeTab === tab ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'info' && '정보'}
                {tab === 'menu' && '메뉴'}
                {tab === 'reviews' && `리뷰 (${restaurant.reviewCount})`}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Notice */}
            {restaurant.notice && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <h3 className="font-semibold text-orange-800 mb-2">📢 공지사항</h3>
                <p className="text-orange-700">{restaurant.notice}</p>
              </div>
            )}

            {/* Description */}
            {restaurant.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">소개</h3>
                <p className="text-gray-600 whitespace-pre-line">{restaurant.description}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">기본 정보</h3>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900">{restaurant.address}</p>
                  {restaurant.addressDetail && (
                    <p className="text-gray-500 text-sm">{restaurant.addressDetail}</p>
                  )}
                </div>
              </div>

              {restaurant.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a href={`tel:${restaurant.phone}`} className="text-gray-900 hover:text-orange-500">
                    {restaurant.phone}
                  </a>
                </div>
              )}

              {restaurant.businessHours && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-gray-900 whitespace-pre-line">{restaurant.businessHours}</p>
                </div>
              )}

              {restaurant.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <a 
                    href={restaurant.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    웹사이트 방문
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                size="lg"
                onClick={() => setShowReservationModal(true)}
                leftIcon={<Calendar className="h-5 w-5" />}
              >
                예약하기
              </Button>
              <Link href={`/waitings/new?restaurantId=${restaurantId}`} className="flex-1">
                <Button variant="outline" className="w-full" size="lg" leftIcon={<Users className="h-5 w-5" />}>
                  대기 등록
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            {menus.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">등록된 메뉴가 없습니다</p>
              </div>
            ) : (
              menus.filter(m => m.isVisible).map((menu) => (
                <div key={menu.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
                  {menu.thumbnail && (
                    <img
                      src={menu.thumbnail}
                      alt={menu.name}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{menu.name}</h3>
                    {menu.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{menu.description}</p>
                    )}
                    <p className="text-orange-500 font-semibold mt-2">
                      {menu.price.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Write Review Button */}
            {isAuthenticated && (
              <Link href={`/reviews/write?restaurantId=${restaurantId}`}>
                <Button className="w-full" leftIcon={<MessageSquare className="h-5 w-5" />}>
                  리뷰 작성하기
                </Button>
              </Link>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">아직 리뷰가 없습니다</p>
                <p className="text-gray-400 text-sm mt-1">첫 번째 리뷰를 작성해보세요!</p>
              </div>
            ) : (
              <>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {hasMoreReviews && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={loadMoreReviews}
                  >
                    더보기
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        restaurantId={restaurantId}
        restaurantName={restaurant.name}
      />

      {/* Theme Modal */}
      <ThemeSelectModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        themes={myThemes}
        onSelectTheme={handleAddToTheme}
        restaurantName={restaurant.name}
      />

      {/* Report Modal */}
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

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          {review.member?.profileImage ? (
            <img
              src={review.member.profileImage}
              alt={review.member.nickname}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-orange-500 font-medium">
              {review.member?.nickname?.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{review.member?.nickname}</p>
          <div className="flex items-center gap-2">
            <RatingStars rating={review.rating} size="sm" />
            <span className="text-gray-400 text-sm">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      {review.title && (
        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
      )}
      <p className="text-gray-600">{review.content}</p>
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {review.images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt="리뷰 이미지"
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
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
                    <img
                      src={theme.thumbnail}
                      alt={theme.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
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

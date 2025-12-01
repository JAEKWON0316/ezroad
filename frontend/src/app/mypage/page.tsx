'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Star,
  Heart,
  Calendar,
  Clock,
  Settings,
  ChevronRight,
  LogOut,
  Pencil,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { memberApi, reviewApi, reservationApi, followApi } from '@/lib/api';
import { MemberStats, Review, Reservation, Restaurant, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
import Button from '@/components/common/Button';
import RatingStars from '@/components/common/RatingStars';
import toast from 'react-hot-toast';

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'reservations' | 'favorites'>('reviews');

  const fetchData = useCallback(async () => {
    try {
      const [statsData, reviewsData, reservationsData, favoritesData] = await Promise.all([
        memberApi.getMyStats(),
        reviewApi.getMyReviews(0, 5),
        reservationApi.getMyReservations(0, 5),
        followApi.getMyFollowedRestaurants(0, 10),
      ]);
      setStats(statsData);
      setRecentReviews(reviewsData.content);
      setRecentReservations(reservationsData.content);
      setFavorites(favoritesData.content);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, router, fetchData]);

  const handleLogout = async () => {
    await logout();
    toast.success('로그아웃되었습니다');
    router.push('/');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.nickname}</h1>
              <p className="text-orange-100">{user.email}</p>
              {user.role === 'BUSINESS' && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-xs">
                  사업자 회원
                </span>
              )}
            </div>
            <Link href="/mypage/edit">
              <Button variant="secondary" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
                수정
              </Button>
            </Link>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.reviewCount}</div>
                <div className="text-orange-100 text-sm">리뷰</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-2xl font-bold">{stats.followerCount}</div>
                <div className="text-orange-100 text-sm">팔로워</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.followingCount}</div>
                <div className="text-orange-100 text-sm">팔로잉</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-sm divide-y">
          {user.role === 'BUSINESS' && (
            <Link
              href="/partner"
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-orange-500" />
                </div>
                <span className="font-medium">사업자 관리</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          )}
          <Link
            href="/mypage/reservations"
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-medium">예약 내역</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
          <Link
            href="/mypage/waitings"
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <span className="font-medium">대기 내역</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-between p-4 hover:bg-gray-50 w-full"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="h-5 w-5 text-red-500" />
              </div>
              <span className="font-medium text-red-500">로그아웃</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-t-xl border-b">
          <div className="flex">
            {[
              { id: 'reviews', label: '내 리뷰', icon: Star },
              { id: 'reservations', label: '예약', icon: Calendar },
              { id: 'favorites', label: '찜 목록', icon: Heart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl p-4 shadow-sm mb-8">
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {recentReviews.length === 0 ? (
                <p className="text-center text-gray-500 py-8">작성한 리뷰가 없습니다</p>
              ) : (
                recentReviews.map((review) => (
                  <Link key={review.id} href={`/restaurants/${review.restaurantId}`}>
                    <div className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.restaurant?.name}</span>
                        <RatingStars rating={review.rating} size="sm" />
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{review.content}</p>
                      <p className="text-gray-400 text-xs mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))
              )}
              {recentReviews.length > 0 && (
                <Link href="/mypage/reviews">
                  <Button variant="outline" className="w-full">전체 보기</Button>
                </Link>
              )}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="space-y-4">
              {recentReservations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">예약 내역이 없습니다</p>
              ) : (
                recentReservations.map((reservation) => (
                  <div key={reservation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{reservation.restaurantName || '식당'}</span>
                      <StatusBadge status={reservation.status} />
                    </div>
                    <p className="text-gray-600 text-sm">
                      {reservation.reservationDate} {reservation.reservationTime}
                    </p>
                    <p className="text-gray-500 text-sm">{reservation.guestCount}명</p>
                  </div>
                ))
              )}
              {recentReservations.length > 0 && (
                <Link href="/mypage/reservations">
                  <Button variant="outline" className="w-full">전체 보기</Button>
                </Link>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {favorites.length === 0 ? (
                <p className="text-center text-gray-500 py-8">찜한 식당이 없습니다</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {favorites.map((restaurant) => (
                      <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-24 bg-gray-100">
                            {restaurant.thumbnail && (
                              <img
                                src={restaurant.thumbnail}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-sm line-clamp-1">
                              {restaurant.name}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                              {restaurant.avgRating?.toFixed(1) || '0.0'}
                            </div>
                          </div>
                        </div>
                      </Link>
                  ))}
                </div>
              )}
              {favorites.length > 0 && (
                <Link href="/mypage/favorites">
                  <Button variant="outline" className="w-full">전체 보기</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
  };
  const labels = {
    PENDING: '대기중',
    CONFIRMED: '확정',
    CANCELLED: '취소됨',
    COMPLETED: '완료',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

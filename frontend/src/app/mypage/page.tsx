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
  ChevronRight,
  LogOut,
  Pencil,
  Utensils,
  Store // Added Store icon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { memberApi, reviewApi, reservationApi, followApi } from '@/lib/api';
import { MemberStats, Review, Reservation, Restaurant } from '@/types';
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
  const [activeTab, setActiveTab] = useState<'reviews' | 'reservations' | 'favorites'>('favorites');

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero / Header Section */}
      <div className="relative bg-gradient-to-br from-orange-500/90 to-red-600/90 text-white overflow-hidden pb-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 py-8 pt-24">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-75 blur transition duration-500 group-hover:opacity-100" />
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-white p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
              </div>
              <Link href="/mypage/edit" className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-orange-600 shadow-lg hover:bg-gray-50 transition-colors">
                <Pencil className="h-4 w-4" />
              </Link>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left mb-2">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white shadow-sm">{user.nickname}</h1>
                {user.role === 'BUSINESS' && (
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-xs font-medium border border-white/30 flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    사업자
                  </span>
                )}
              </div>
              <p className="text-orange-50/90 font-medium">{user.email}</p>
            </div>

            {/* Stats Cards - Floating */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto mt-6 md:mt-0">
                <div className="glass-card bg-white/10 backdrop-blur-md border-white/20 p-3 rounded-xl text-center min-w-[80px]">
                  <div className="text-2xl font-bold">{stats.reviewCount}</div>
                  <div className="text-xs text-orange-100 opacity-80">리뷰</div>
                </div>
                <div className="glass-card bg-white/10 backdrop-blur-md border-white/20 p-3 rounded-xl text-center min-w-[80px]">
                  <div className="text-2xl font-bold">{stats.followerCount}</div>
                  <div className="text-xs text-orange-100 opacity-80">팔로워</div>
                </div>
                <div className="glass-card bg-white/10 backdrop-blur-md border-white/20 p-3 rounded-xl text-center min-w-[80px]">
                  <div className="text-2xl font-bold">{stats.followingCount}</div>
                  <div className="text-xs text-orange-100 opacity-80">팔로잉</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 space-y-8">
        {/* Quick Links - Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/mypage/reservations" className="glass bg-white hover:bg-blue-50/50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-center justify-center gap-2 text-center h-28">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-medium text-gray-700 text-sm">예약 내역</span>
          </Link>

          <Link href="/mypage/waitings" className="glass bg-white hover:bg-purple-50/50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-center justify-center gap-2 text-center h-28">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <span className="font-medium text-gray-700 text-sm">대기 현황</span>
          </Link>

          {user.role === 'BUSINESS' && (
            <Link href="/partner" className="glass bg-white hover:bg-orange-50/50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-center justify-center gap-2 text-center h-28">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="h-5 w-5 text-orange-600" />
              </div>
              <span className="font-medium text-gray-700 text-sm">가게 관리</span>
            </Link>
          )}

          <button onClick={handleLogout} className="glass bg-white hover:bg-red-50/50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-center justify-center gap-2 text-center h-28">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>
            <span className="font-medium text-gray-700 text-sm">로그아웃</span>
          </button>
        </div>

        {/* Content Tabs */}
        <div>
          {/* Sticky Tab Navigation */}
          <div className="sticky top-16 z-20 bg-gray-50/95 backdrop-blur-sm pt-2 pb-4">
            <div className="bg-white/80 border border-gray-200/60 p-1.5 rounded-full flex shadow-sm max-w-md mx-auto">
              {[
                { id: 'favorites', label: '찜한 맛집', icon: Heart },
                { id: 'reviews', label: '나의 리뷰', icon: Star },
                { id: 'reservations', label: '최근 예약', icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                    }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'fill-current' : ''}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px] animate-fade-in-up">
            {activeTab === 'favorites' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-bold text-xl text-gray-800">찜한 맛집 <span className="text-orange-500">{favorites.length}</span></h2>
                  {favorites.length > 0 && <Link href="/mypage/favorites" className="text-sm text-gray-500 hover:text-orange-500 flex items-center">더보기 <ChevronRight className="w-4 h-4" /></Link>}
                </div>
                {favorites.length === 0 ? (
                  <EmptyState icon={Heart} message="아직 찜한 맛집이 없습니다." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((restaurant) => (
                      <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="group">
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                          <div className="relative h-36 bg-gray-200 overflow-hidden">
                            {restaurant.thumbnail ? (
                              <img
                                src={restaurant.thumbnail}
                                alt={restaurant.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                <Utensils className="w-8 h-8 opacity-50" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full text-orange-500 shadow-sm">
                              <Heart className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{restaurant.name}</h3>
                                <div className="flex items-center text-xs font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                                  <Star className="w-3 h-3 fill-current mr-0.5" />
                                  {restaurant.avgRating?.toFixed(1) || '0.0'}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mb-2 truncate">
                                {restaurant.category} · {restaurant.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-bold text-xl text-gray-800">최근 작성 리뷰</h2>
                  {recentReviews.length > 0 && <Link href="/mypage/reviews" className="text-sm text-gray-500 hover:text-orange-500 flex items-center">더보기 <ChevronRight className="w-4 h-4" /></Link>}
                </div>
                {recentReviews.length === 0 ? (
                  <EmptyState icon={Star} message="작성한 리뷰가 없습니다." />
                ) : (
                  <div className="space-y-3">
                    {recentReviews.map((review) => (
                      <Link key={review.id} href={`/restaurants/${review.restaurantId}`}>
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {review.restaurant?.thumbnail ? (
                                  <img src={review.restaurant.thumbnail} alt={review.restaurant.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Utensils className="w-5 h-5" /></div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{review.restaurant?.name}</h3>
                                <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <RatingStars rating={review.rating} size="sm" />
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2 pl-[52px]">{review.content}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reservations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-bold text-xl text-gray-800">최근 예약</h2>
                  {recentReservations.length > 0 && <Link href="/mypage/reservations" className="text-sm text-gray-500 hover:text-orange-500 flex items-center">더보기 <ChevronRight className="w-4 h-4" /></Link>}
                </div>
                {recentReservations.length === 0 ? (
                  <EmptyState icon={Calendar} message="예약 내역이 없습니다." />
                ) : (
                  <div className="space-y-3">
                    {recentReservations.map((reservation) => (
                      <div key={reservation.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-12 h-12 bg-orange-50 rounded-xl text-orange-600 font-bold border border-orange-100">
                            <span className="text-xs uppercase leading-none mb-0.5">
                              {new Date(reservation.reservationDate).toLocaleString('en', { month: 'short' })}
                            </span>
                            <span className="text-lg leading-none">
                              {new Date(reservation.reservationDate).getDate()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-bold text-gray-900">{reservation.restaurantName || '식당 정보 없음'}</h3>
                              <StatusBadge status={reservation.status} />
                            </div>
                            <div className="flex items-center text-xs text-gray-500 gap-2">
                              <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{reservation.reservationTime.slice(0, 5)}</span>
                              <span className="flex items-center"><User className="w-3 h-3 mr-1" />{reservation.guestCount}명</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/mypage/reservations`} passHref>
                          <Button variant="outline" size="sm" className="hidden sm:flex">
                            상세
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const labels = {
    PENDING: '대기중',
    CONFIRMED: '확정됨',
    CANCELLED: '취소됨',
    COMPLETED: '방문완료',
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 opacity-30" />
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Plus,
  Settings,
  Star,
  Calendar,
  Users,
  ChevronRight,
  Utensils,
  TrendingUp,
  Heart,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, reservationApi, waitingApi, partnerApi, PartnerStats } from '@/lib/api';
import { Restaurant, Reservation, Waiting } from '@/types';
import Loading from '@/components/common/Loading';
import DashboardSkeleton from '@/components/layout/DashboardSkeleton';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function PartnerPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [activeWaitings, setActiveWaitings] = useState<Waiting[]>([]);
  const [partnerStats, setPartnerStats] = useState<PartnerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [restaurantsData, statsData] = await Promise.all([
        restaurantApi.getMyRestaurants(),
        partnerApi.getStats(),
      ]);
      setRestaurants(restaurantsData);
      setPartnerStats(statsData);

      if (restaurantsData.length > 0) {
        setSelectedRestaurant(restaurantsData[0]);

        // Fetch reservations and waitings for first restaurant
        const [reservationsData, waitingsData] = await Promise.all([
          reservationApi.getByRestaurant(restaurantsData[0].id, 0, 5),
          waitingApi.getByRestaurant(restaurantsData[0].id, 0, 10),
        ]);

        setPendingReservations(
          reservationsData.content.filter(r => r.status === 'PENDING')
        );
        setActiveWaitings(
          waitingsData.content.filter(w => w.status === 'WAITING' || w.status === 'CALLED')
        );
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user?.role !== 'BUSINESS') {
        toast.error('사업자 회원만 접근할 수 있습니다');
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [authLoading, isAuthenticated, user, router, fetchData]);

  const handleRestaurantChange = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsLoading(true);
    try {
      const [reservationsData, waitingsData] = await Promise.all([
        reservationApi.getByRestaurant(restaurant.id, 0, 5),
        waitingApi.getByRestaurant(restaurant.id, 0, 10),
      ]);
      setPendingReservations(
        reservationsData.content.filter(r => r.status === 'PENDING')
      );
      setActiveWaitings(
        waitingsData.content.filter(w => w.status === 'WAITING' || w.status === 'CALLED')
      );
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReservation = async (id: number) => {
    try {
      await reservationApi.confirm(id);
      toast.success('예약이 확정되었습니다');
      setPendingReservations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleCallWaiting = async (id: number) => {
    try {
      await waitingApi.call(id);
      toast.success('대기 손님을 호출했습니다');
      setActiveWaitings(prev => prev.map(w =>
        w.id === id ? { ...w, status: 'CALLED' as const } : w
      ));
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleSeatWaiting = async (id: number) => {
    try {
      await waitingApi.seat(id);
      toast.success('착석 처리되었습니다');
      setActiveWaitings(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  if (authLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/10 to-transparent rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Partner Center
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
              BUSINESS
            </span>
          </div>
          <Link href="/partner/restaurants/new">
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              className="bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-900/20 rounded-full px-5"
            >
              새 가게 등록
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {restaurants.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center max-w-2xl mx-auto mt-20">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="h-10 w-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              등록된 가게가 없습니다
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              사장님의 맛집을 등록하고 더 많은 손님을 만나보세요!
              <br />
              예약부터 웨이팅까지 한 번에 관리할 수 있습니다.
            </p>
            <Link href="/partner/restaurants/new">
              <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/20">
                첫 가게 등록하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar / Restaurant Selector */}
            <aside className="w-full lg:w-80 shrink-0 space-y-6">
              <div className="glass-card rounded-2xl p-1 overflow-hidden">
                <div className="p-4 border-b border-gray-100/50 bg-white/40">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Store className="h-4 w-4 text-gray-500" />
                    내 가게 목록
                  </h2>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                  {restaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      onClick={() => handleRestaurantChange(restaurant)}
                      className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 group ${selectedRestaurant?.id === restaurant.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                        : 'hover:bg-white/60 hover:shadow-sm text-gray-700'
                        }`}
                    >
                      <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border transition-colors ${selectedRestaurant?.id === restaurant.id
                        ? 'bg-white/20 border-white/20'
                        : 'bg-gray-100 border-gray-200 group-hover:bg-white'
                        }`}>
                        {restaurant.thumbnail ? (
                          <Image
                            src={restaurant.thumbnail}
                            alt={restaurant.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <Utensils className={`h-5 w-5 ${selectedRestaurant?.id === restaurant.id ? 'text-white' : 'text-gray-400'
                            }`} />
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-semibold text-sm truncate">{restaurant.name}</h3>
                        <div className={`flex items-center text-xs ${selectedRestaurant?.id === restaurant.id ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                          <Star className={`h-3 w-3 mr-1 ${selectedRestaurant?.id === restaurant.id ? 'text-orange-200 fill-current' : 'text-yellow-400 fill-current'
                            }`} />
                          {restaurant.avgRating.toFixed(1)} ({restaurant.reviewCount})
                        </div>
                      </div>
                      {selectedRestaurant?.id === restaurant.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links Card */}
              {selectedRestaurant && (
                <div className="glass-card rounded-2xl p-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link
                      href={`/partner/restaurants/${selectedRestaurant.id}/edit`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Settings className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-gray-700 text-sm">가게 정보 수정</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </Link>
                    <Link
                      href={`/partner/restaurants/${selectedRestaurant.id}/menus`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <Utensils className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-gray-700 text-sm">메뉴 관리</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </Link>
                  </div>
                </div>
              )}
            </aside>

            {/* Main Content Area */}
            {selectedRestaurant && (
              <main className="flex-1 space-y-8">
                {/* Stats Grid */}
                {partnerStats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Reviews */}
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MessageSquare className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span>총 리뷰</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{partnerStats.totalReviews.toLocaleString()}</div>
                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 inline-flex px-2 py-0.5 rounded-full font-medium">
                          +{partnerStats.weekReviews} this week
                        </div>
                      </div>
                    </div>

                    {/* Total Reservations */}
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span>총 예약</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{partnerStats.totalReservations.toLocaleString()}</div>
                        <div className="mt-2 text-xs text-purple-600 bg-purple-50 inline-flex px-2 py-0.5 rounded-full font-medium">
                          +{partnerStats.weekReservations} this week
                        </div>
                      </div>
                    </div>

                    {/* Followers */}
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Heart className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>단골 손님</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{partnerStats.totalFollowers.toLocaleString()}</div>
                        <div className="mt-2 text-xs text-gray-500 font-medium">
                          팔로워 수
                        </div>
                      </div>
                    </div>

                    {/* Avg Rating */}
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Star className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>평균 별점</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{partnerStats.avgRating.toFixed(1)}</div>
                        <div className="mt-2 flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${star <= Math.round(partnerStats.avgRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Pending Reservations (Inbox Style) */}
                  <div className="glass-card rounded-2xl overflow-hidden border border-white/40 shadow-sm">
                    <div className="p-5 border-b border-gray-100/50 bg-white/40 backdrop-blur-sm flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                          <Calendar className="h-4 w-4" />
                        </div>
                        예약 요청
                        {pendingReservations.length > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {pendingReservations.length}
                          </span>
                        )}
                      </h3>
                      <Link href={`/partner/restaurants/${selectedRestaurant.id}/reservations`} className="text-xs font-medium text-gray-500 hover:text-orange-600 transition-colors">
                        전체보기
                      </Link>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {pendingReservations.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center justify-center text-gray-400">
                          <CheckCircle className="w-12 h-12 mb-3 text-gray-200" />
                          <p>처리할 예약이 없습니다</p>
                        </div>
                      ) : (
                        pendingReservations.map((reservation) => (
                          <div key={reservation.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-orange-200 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-orange-50 flex flex-col items-center justify-center shrink-0 border border-orange-100">
                                <span className="text-xs text-orange-400 font-semibold">{reservation.reservationDate.split('-')[1]}월</span>
                                <span className="text-lg font-bold text-orange-600 leading-none">{reservation.reservationDate.split('-')[2]}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900">{reservation.memberName || '예약자'}</span>
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                                    {reservation.guestCount}명
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {reservation.reservationTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleConfirmReservation(reservation.id)}
                              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 rounded-full text-xs px-4"
                            >
                              예약 확정하기
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Active Waitings (Queue Style) */}
                  <div className="glass-card rounded-2xl overflow-hidden border border-white/40 shadow-sm">
                    <div className="p-5 border-b border-gray-100/50 bg-white/40 backdrop-blur-sm flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                        현장 대기
                        {activeWaitings.length > 0 && (
                          <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {activeWaitings.length}
                          </span>
                        )}
                      </h3>
                      <Link href={`/partner/restaurants/${selectedRestaurant.id}/waitings`} className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        전체보기
                      </Link>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {activeWaitings.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center justify-center text-gray-400">
                          <Users className="w-12 h-12 mb-3 text-gray-200" />
                          <p>현재 대기 중인 손님이 없습니다</p>
                        </div>
                      ) : (
                        activeWaitings.map((waiting) => (
                          <div key={waiting.id} className={`bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between transition-all ${waiting.status === 'CALLED'
                            ? 'border-red-200 bg-red-50/30'
                            : 'border-gray-100 hover:border-blue-200'
                            }`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl shadow-sm ${waiting.status === 'CALLED'
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-white border border-gray-200 text-gray-900'
                                }`}>
                                {waiting.waitingNumber}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900">{waiting.memberNickname || '손님'}</span>
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                                    {waiting.guestCount}명
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {waiting.estimatedWaitTime}분 대기 예상
                                  </span>
                                  {waiting.status === 'CALLED' && (
                                    <span className="text-red-500 font-bold flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" /> 호출됨
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {waiting.status === 'WAITING' ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleCallWaiting(waiting.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white rounded-full text-xs px-4"
                                >
                                  호출
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleSeatWaiting(waiting.id)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white border-none rounded-full text-xs px-4"
                                >
                                  착석 완료
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </main>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

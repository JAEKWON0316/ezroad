'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, reservationApi, waitingApi, partnerApi, PartnerStats } from '@/lib/api';
import { Restaurant, Reservation, Waiting, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">사업자 관리</h1>
            <Link href="/partner/restaurants/new">
              <Button leftIcon={<Plus className="h-5 w-5" />}>
                새 가게 등록
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {restaurants.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              등록된 가게가 없습니다
            </h2>
            <p className="text-gray-500 mb-6">
              첫 번째 가게를 등록하고 고객을 만나보세요
            </p>
            <Link href="/partner/restaurants/new">
              <Button>가게 등록하기</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Restaurant Selector */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b">
                  <h2 className="font-semibold">내 가게</h2>
                </div>
                <div className="divide-y">
                  {restaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      onClick={() => handleRestaurantChange(restaurant)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        selectedRestaurant?.id === restaurant.id ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {restaurant.thumbnail ? (
                          <img
                            src={restaurant.thumbnail}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Utensils className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium line-clamp-1">{restaurant.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          {restaurant.avgRating.toFixed(1)} ({restaurant.reviewCount})
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              {selectedRestaurant && (
                <div className="bg-white rounded-xl shadow-sm mt-4 divide-y">
                  <Link
                    href={`/partner/restaurants/${selectedRestaurant.id}/edit`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-gray-400" />
                      <span>가게 정보 수정</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                  <Link
                    href={`/partner/restaurants/${selectedRestaurant.id}/menus`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Utensils className="h-5 w-5 text-gray-400" />
                      <span>메뉴 관리</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
              )}
            </div>

            {/* Main Content */}
            {selectedRestaurant && (
              <div className="lg:col-span-2 space-y-6">
                {/* Overall Stats */}
                {partnerStats && (
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <h2 className="text-lg font-semibold mb-4">전체 통계</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{partnerStats.totalReviews}</div>
                        <div className="text-orange-100 text-sm flex items-center justify-center gap-1">
                          <MessageSquare className="h-4 w-4" /> 총 리뷰
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{partnerStats.totalReservations}</div>
                        <div className="text-orange-100 text-sm flex items-center justify-center gap-1">
                          <Calendar className="h-4 w-4" /> 총 예약
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{partnerStats.totalFollowers}</div>
                        <div className="text-orange-100 text-sm flex items-center justify-center gap-1">
                          <Heart className="h-4 w-4" /> 팔로워
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{partnerStats.avgRating.toFixed(1)}</div>
                        <div className="text-orange-100 text-sm flex items-center justify-center gap-1">
                          <Star className="h-4 w-4" /> 평균 평점
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Today & Week Stats */}
                {partnerStats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">오늘</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{partnerStats.todayReservations}</div>
                          <div className="text-sm text-gray-500">예약</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{partnerStats.todayReviews}</div>
                          <div className="text-sm text-gray-500">리뷰</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">이번 주</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{partnerStats.weekReservations}</div>
                          <div className="text-sm text-gray-500">예약</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{partnerStats.weekReviews}</div>
                          <div className="text-sm text-gray-500">리뷰</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-3xl font-bold text-orange-500">
                      {selectedRestaurant.reviewCount}
                    </div>
                    <div className="text-gray-500 text-sm">이 가게 리뷰</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-3xl font-bold text-orange-500">
                      {pendingReservations.length}
                    </div>
                    <div className="text-gray-500 text-sm">대기 예약</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-3xl font-bold text-orange-500">
                      {activeWaitings.length}
                    </div>
                    <div className="text-gray-500 text-sm">대기 손님</div>
                  </div>
                </div>

                {/* Pending Reservations */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      대기 중인 예약
                    </h2>
                    <Link href={`/partner/restaurants/${selectedRestaurant.id}/reservations`}>
                      <span className="text-sm text-orange-500">전체 보기</span>
                    </Link>
                  </div>
                  <div className="divide-y">
                    {pendingReservations.length === 0 ? (
                      <p className="p-8 text-center text-gray-500">
                        대기 중인 예약이 없습니다
                      </p>
                    ) : (
                      pendingReservations.map((reservation) => (
                        <div key={reservation.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{reservation.member?.nickname}</p>
                            <p className="text-sm text-gray-500">
                              {reservation.reservationDate} {reservation.reservationTime} · {reservation.guestCount}명
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmReservation(reservation.id)}
                          >
                            확정
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Active Waitings */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      대기 손님
                    </h2>
                    <Link href={`/partner/restaurants/${selectedRestaurant.id}/waitings`}>
                      <span className="text-sm text-orange-500">전체 보기</span>
                    </Link>
                  </div>
                  <div className="divide-y">
                    {activeWaitings.length === 0 ? (
                      <p className="p-8 text-center text-gray-500">
                        대기 중인 손님이 없습니다
                      </p>
                    ) : (
                      activeWaitings.map((waiting) => (
                        <div key={waiting.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-500">
                              {waiting.waitingNumber}
                            </div>
                            <div>
                              <p className="font-medium">{waiting.member?.nickname}</p>
                              <p className="text-sm text-gray-500">
                                {waiting.partySize}명 · {waiting.estimatedWaitTime}분 예상
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {waiting.status === 'WAITING' ? (
                              <Button
                                size="sm"
                                onClick={() => handleCallWaiting(waiting.id)}
                              >
                                호출
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleSeatWaiting(waiting.id)}
                              >
                                착석
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

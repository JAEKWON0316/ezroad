'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Phone,
  Clock,
  Check,
  X,
  Bell,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, reservationApi } from '@/lib/api';
import { Restaurant, Reservation } from '@/types';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-400 border-red-100',
};

const statusLabels: Record<string, string> = {
  PENDING: '대기중',
  CONFIRMED: '확정',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export default function ReservationsManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [restaurantData, reservationsData] = await Promise.all([
        restaurantApi.getById(Number(id)),
        reservationApi.getByRestaurant(Number(id), 0, 200), // 전체 예약 가져오기
      ]);
      setRestaurant(restaurantData);
      setReservations(reservationsData.content);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

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

  const handleConfirm = async (reservationId: number) => {
    try {
      await reservationApi.confirm(reservationId);
      toast.success('예약이 확정되었습니다');
      fetchData(true);
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleComplete = async (reservationId: number) => {
    try {
      await reservationApi.complete(reservationId);
      toast.success('예약이 완료 처리되었습니다');
      fetchData(true);
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleCancel = async (reservationId: number) => {
    if (!window.confirm('예약을 취소하시겠습니까?')) return;
    try {
      await reservationApi.cancel(reservationId);
      toast.success('예약이 취소되었습니다');
      fetchData(true);
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  // 날짜별 예약 건수 계산
  const getReservationCountByDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.filter(r => r.reservationDate === dateStr && r.status !== 'CANCELLED').length;
  };

  // 선택된 날짜의 예약 목록
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateReservations = reservations
    .filter(r => r.reservationDate === selectedDateStr)
    .sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));

  // 캘린더 날짜 배열 생성
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 시작 요일에 맞춰 빈 칸 추가
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);


  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">예약 현황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="font-bold text-xl text-gray-900">예약 관리</h1>
                <p className="text-sm text-gray-500">{restaurant?.name}</p>
              </div>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 캘린더 섹션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
              {/* 월 네비게이션 */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-bold text-gray-900">
                  {format(currentMonth, 'yyyy년 M월', { locale: ko })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                  <div
                    key={day}
                    className={`text-center text-xs font-bold py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                      }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-1">
                {/* 빈 칸 */}
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* 날짜들 */}
                {daysInMonth.map((day) => {
                  const count = getReservationCountByDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${isSelected
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                        : isTodayDate
                          ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                          : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {count > 0 && (
                        <div className={`absolute bottom-1 flex gap-0.5 ${isSelected ? 'opacity-80' : ''}`}>
                          {count <= 3 ? (
                            Array(count).fill(null).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-400'
                                  }`}
                              />
                            ))
                          ) : (
                            <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-orange-500'
                              }`}>
                              {count}건
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 오늘 버튼 */}
              <button
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
                className="w-full mt-4 py-2 text-sm font-bold text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
              >
                오늘로 이동
              </button>
            </div>
          </div>


          {/* 선택된 날짜의 예약 목록 */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                📅 {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
                <span className="ml-2 text-orange-500">{selectedDateReservations.length}건</span>
              </h2>
            </div>

            {selectedDateReservations.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">예약이 없습니다</h3>
                <p className="text-gray-500">선택한 날짜에 예약이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${reservation.status === 'PENDING'
                      ? 'border-l-4 border-l-yellow-400 border-t-gray-100 border-r-gray-100 border-b-gray-100'
                      : reservation.status === 'CONFIRMED'
                        ? 'border-l-4 border-l-blue-500 border-t-gray-100 border-r-gray-100 border-b-gray-100'
                        : reservation.status === 'COMPLETED'
                          ? 'border-l-4 border-l-green-500 border-t-gray-100 border-r-gray-100 border-b-gray-100'
                          : 'border-gray-100 opacity-60'
                      }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        {/* 시간 */}
                        <div className="flex-shrink-0 w-20 text-center">
                          <div className="text-2xl font-black text-gray-900">
                            {reservation.reservationTime.substring(0, 5)}
                          </div>
                        </div>

                        {/* 예약 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900">{reservation.memberName || '예약자'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusStyles[reservation.status]} whitespace-nowrap`}>
                              {statusLabels[reservation.status]}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {reservation.guestCount}명
                            </span>
                            {reservation.memberPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {reservation.memberPhone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex-shrink-0 flex flex-col gap-2">
                          {reservation.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() => handleConfirm(reservation.id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                확정
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => handleCancel(reservation.id)}
                              >
                                거절
                              </Button>
                            </>
                          )}
                          {reservation.status === 'CONFIRMED' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => handleComplete(reservation.id)}
                              >
                                방문완료
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => handleCancel(reservation.id)}
                              >
                                취소
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 요청사항 - Full width outside the flex container */}
                      {reservation.request && (
                        <div className="mt-4 p-4 bg-orange-50 rounded-xl text-sm text-gray-700 border border-orange-100/50">
                          <span className="font-bold text-orange-600">요청사항:</span> {reservation.request}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}

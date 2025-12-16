'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Users, Phone, Clock, Check, X, Bell, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, reservationApi } from '@/lib/api';
import { Restaurant, Reservation } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import CardListSkeleton from '@/components/common/CardListSkeleton';
import Pagination from '@/components/common/Pagination';
import toast from 'react-hot-toast';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-400 border-red-100',
};

const statusLabels: Record<string, string> = {
  PENDING: '대기중',
  CONFIRMED: '확정됨',
  COMPLETED: '방문완료',
  CANCELLED: '취소',
};

export default function ReservationsManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [restaurantData, reservationsData] = await Promise.all([
        restaurantApi.getById(Number(id)),
        reservationApi.getByRestaurant(Number(id), page, 10),
      ]);
      setRestaurant(restaurantData);
      setReservations(reservationsData.content);
      setTotalPages(reservationsData.totalPages);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [id, page]);

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
      fetchData();
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleComplete = async (reservationId: number) => {
    try {
      await reservationApi.complete(reservationId);
      toast.success('예약이 완료 처리되었습니다');
      fetchData();
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleCancel = async (reservationId: number) => {
    if (!window.confirm('예약을 취소하시겠습니까?')) return;
    try {
      await reservationApi.cancel(reservationId);
      toast.success('예약이 취소되었습니다');
      fetchData();
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const filteredReservations = statusFilter === 'all'
    ? reservations
    : reservations.filter(r => r.status === statusFilter);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pb-20">
        <div className="sticky top-0 z-30 bg-white/70 border-b border-white/50 shadow-sm h-16 flex items-center px-4">
          <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            <div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6 h-10 w-full bg-gray-200 rounded-2xl animate-pulse" />
          <CardListSkeleton viewMode="list" count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/10 to-transparent rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-700">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-gray-900">예약 관리</h1>
            <p className="text-sm text-gray-500 font-medium">{restaurant?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Status Filter Tabs */}
        <div className="glass-panel p-1.5 rounded-2xl flex flex-wrap gap-1 mb-6">
          {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${statusFilter === status
                ? 'bg-white text-orange-600 shadow-md transform scale-[1.02]'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                }`}
            >
              {status === 'all' ? '전체' : statusLabels[status]}
            </button>
          ))}
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">예약 내역이 없습니다</h3>
            <p className="text-gray-500 text-sm">해당 상태의 예약이 존재하지 않습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className={`glass-card p-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-l-4 ${reservation.status === 'PENDING' ? 'border-l-yellow-400' :
                  reservation.status === 'CONFIRMED' ? 'border-l-blue-500' :
                    reservation.status === 'COMPLETED' ? 'border-l-green-500' : 'border-l-gray-300'
                  }`}
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    {/* Left: User Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 shadow-inner">
                        {reservation.memberName?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-gray-900 text-lg">{reservation.memberName || '예약자'}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyles[reservation.status]}`}>
                            {statusLabels[reservation.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {reservation.memberPhone || '연락처 없음'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Date/Time Info */}
                    <div className="flex items-center gap-6 bg-white/50 px-5 py-3 rounded-xl border border-white/60">
                      <div className="text-center">
                        <span className="block text-xs text-gray-400 font-medium mb-0.5">날짜</span>
                        <span className="block text-gray-800 font-bold">{reservation.reservationDate}</span>
                      </div>
                      <div className="w-px h-8 bg-gray-200" />
                      <div className="text-center">
                        <span className="block text-xs text-gray-400 font-medium mb-0.5">시간</span>
                        <span className="block text-gray-800 font-bold">{reservation.reservationTime}</span>
                      </div>
                      <div className="w-px h-8 bg-gray-200" />
                      <div className="text-center">
                        <span className="block text-xs text-gray-400 font-medium mb-0.5">인원</span>
                        <span className="block text-gray-800 font-bold flex items-center gap-1 justify-center">
                          <Users className="w-3.5 h-3.5 text-gray-400" /> {reservation.guestCount}명
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request */}
                  {reservation.request && (
                    <div className="bg-orange-50/50 border border-orange-100/50 rounded-xl p-3 mb-4 flex gap-3 text-sm text-gray-700">
                      <Bell className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span><span className="font-bold text-orange-600 mr-1">요청사항:</span> {reservation.request}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED' && (
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-100/50 mt-2">
                      {reservation.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancel(reservation.id)}
                          >
                            거절
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md shadow-blue-500/20"
                            onClick={() => handleConfirm(reservation.id)}
                            leftIcon={<Check className="w-4 h-4" />}
                          >
                            예약 확정
                          </Button>
                        </>
                      )}
                      {reservation.status === 'CONFIRMED' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancel(reservation.id)}
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-md shadow-green-500/20"
                            onClick={() => handleComplete(reservation.id)}
                          >
                            방문 완료 처리
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

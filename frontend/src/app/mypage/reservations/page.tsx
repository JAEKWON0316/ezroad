'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  X, 
  PenSquare,
  CalendarCheck,
  CalendarX,
  History
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reservationApi } from '@/lib/api';
import { Reservation, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  PENDING: '확정 대기',
  CONFIRMED: '예약 확정',
  CANCELLED: '취소됨',
  COMPLETED: '방문 완료',
};

type TabType = 'upcoming' | 'past' | 'cancelled';

export default function MyReservationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [isCancelling, setIsCancelling] = useState(false);

  // 예약 분류
  const upcomingReservations = reservations.filter(r => {
    if (r.status === 'CANCELLED') return false;
    const reservationDate = parseISO(r.reservationDate);
    return !isPast(reservationDate) || isToday(reservationDate) || r.status === 'PENDING' || r.status === 'CONFIRMED';
  }).filter(r => r.status !== 'COMPLETED');

  const pastReservations = reservations.filter(r => 
    r.status === 'COMPLETED'
  );

  const cancelledReservations = reservations.filter(r => 
    r.status === 'CANCELLED'
  );

  const getFilteredReservations = () => {
    switch (activeTab) {
      case 'upcoming': return upcomingReservations;
      case 'past': return pastReservations;
      case 'cancelled': return cancelledReservations;
      default: return [];
    }
  };

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Reservation> = await reservationApi.getMyReservations(0, 50);
      setReservations(response.content);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      toast.error('예약 목록을 불러오는데 실패했습니다');
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
      fetchReservations();
    }
  }, [authLoading, isAuthenticated, router, fetchReservations]);

  const handleCancelReservation = async () => {
    if (!cancelModal.id) return;

    setIsCancelling(true);
    try {
      await reservationApi.cancel(cancelModal.id);
      toast.success('예약이 취소되었습니다');
      setCancelModal({ isOpen: false, id: null });
      fetchReservations();
    } catch {
      toast.error('예약 취소에 실패했습니다');
    } finally {
      setIsCancelling(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    );
  }

  const filteredReservations = getFilteredReservations();


  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">예약 내역</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 탭 메뉴 */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'upcoming' 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            예정된 예약
            {upcomingReservations.length > 0 && (
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                {upcomingReservations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'past' 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4" />
            지난 예약
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'cancelled' 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarX className="w-4 h-4" />
            취소됨
          </button>
        </div>

        {/* 예약 목록 */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {activeTab === 'upcoming' && '예정된 예약이 없습니다'}
              {activeTab === 'past' && '지난 예약이 없습니다'}
              {activeTab === 'cancelled' && '취소된 예약이 없습니다'}
            </h3>
            {activeTab === 'upcoming' && (
              <>
                <p className="text-gray-500 mb-6">맛집을 예약하고 기다림 없이 즐겨보세요!</p>
                <Link href="/restaurants">
                  <Button>맛집 둘러보기</Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-md ${
                  reservation.status === 'CONFIRMED' 
                    ? 'border-l-4 border-l-green-500 border-t-gray-100 border-r-gray-100 border-b-gray-100' 
                    : reservation.status === 'PENDING'
                    ? 'border-l-4 border-l-yellow-400 border-t-gray-100 border-r-gray-100 border-b-gray-100'
                    : reservation.status === 'COMPLETED'
                    ? 'border-l-4 border-l-blue-400 border-t-gray-100 border-r-gray-100 border-b-gray-100'
                    : 'border-gray-100 opacity-70'
                }`}
              >
                <div className="p-5">
                  {/* 날짜/시간 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-black text-gray-900">
                        {format(parseISO(reservation.reservationDate), 'M/d')}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-700">
                          {format(parseISO(reservation.reservationDate), 'EEEE', { locale: ko })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.reservationTime.substring(0, 5)}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      reservation.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-600' 
                        : reservation.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-600'
                        : reservation.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {statusLabels[reservation.status]}
                    </span>
                  </div>

                  {/* 식당 정보 */}
                  <Link href={`/restaurants/${reservation.restaurantId}`}>
                    <h3 className="text-lg font-bold text-gray-900 hover:text-orange-600 mb-2">
                      {reservation.restaurantName || '식당 정보 없음'}
                    </h3>
                  </Link>

                  {/* 정보 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {reservation.guestCount}명
                    </span>
                    {reservation.restaurantAddress && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {reservation.restaurantAddress}
                      </span>
                    )}
                  </div>

                  {/* 요청사항 */}
                  {reservation.request && (
                    <div className="p-3 bg-orange-50 rounded-xl text-sm text-gray-700 mb-4">
                      <span className="font-bold text-orange-600">요청:</span> {reservation.request}
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                      <button
                        onClick={() => setCancelModal({ isOpen: true, id: reservation.id })}
                        className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                      >
                        예약 취소
                      </button>
                    )}
                    {reservation.status === 'COMPLETED' && (
                      <Link href={`/reviews/write?restaurantId=${reservation.restaurantId}`}>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                          <PenSquare className="w-4 h-4 mr-1" />
                          리뷰 작성
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* 취소 확인 모달 */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, id: null })}
        title="예약 취소"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">정말 예약을 취소하시겠습니까?</p>
            <p className="text-sm text-gray-500 mt-1">취소 후에는 복구할 수 없습니다.</p>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 py-3"
              onClick={() => setCancelModal({ isOpen: false, id: null })}
            >
              닫기
            </Button>
            <Button
              className="flex-1 py-3 bg-red-500 hover:bg-red-600"
              onClick={handleCancelReservation}
              isLoading={isCancelling}
            >
              예약 취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

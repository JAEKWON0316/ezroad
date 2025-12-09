'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, Clock, Users, MapPin, X, Ticket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reservationApi } from '@/lib/api';
import { Reservation, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100/80 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-green-100/80 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100/80 text-red-700 border-red-200',
  COMPLETED: 'bg-gray-100/80 text-gray-700 border-gray-200',
};

const statusLabels: Record<string, string> = {
  PENDING: '대기중',
  CONFIRMED: '확정됨',
  CANCELLED: '취소됨',
  COMPLETED: '방문완료',
};

export default function MyReservationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Reservation> = await reservationApi.getMyReservations(page, 10);
      setReservations(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      toast.error('예약 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Modern Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">예약 내역</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">예약 내역이 없습니다</h3>
            <p className="text-gray-500 mb-8 text-center max-w-xs">
              원하는 시간을 미리 예약하고<br />기다림 없이 맛집을 즐겨보세요!
            </p>
            <Link href="/restaurants">
              <Button size="lg" className="shadow-lg shadow-orange-200">맛집 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {reservations.map((reservation, index) => (
                <div
                  key={reservation.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 block relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Status Bar */}
                  <div className={`h-1.5 w-full ${reservation.status === 'CONFIRMED' ? 'bg-green-500' :
                      reservation.status === 'PENDING' ? 'bg-yellow-400' :
                        reservation.status === 'CANCELLED' ? 'bg-red-400' : 'bg-gray-300'
                    }`} />

                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                      <div>
                        <Link href={`/restaurants/${reservation.restaurantId}`}>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                            {reservation.restaurantName || '식당 정보 없음'}
                            <span className="text-gray-300 font-normal">|</span>
                            <span className="text-sm font-normal text-gray-500">지점명</span>
                          </h3>
                        </Link>
                        {reservation.restaurantAddress && (
                          <p className="text-sm text-gray-500 flex items-center mt-2 bg-gray-50 w-fit px-2 py-1 rounded-full">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {reservation.restaurantAddress}
                          </p>
                        )}
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusStyles[reservation.status]}`}>
                        {statusLabels[reservation.status]}
                      </span>
                    </div>

                    {/* Ticket Style Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gray-50/80 rounded-xl border border-gray-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Calendar className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-medium">날짜</span>
                          <span className="font-bold text-gray-900">{reservation.reservationDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Clock className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-medium">시간</span>
                          <span className="font-bold text-gray-900">{reservation.reservationTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Users className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-medium">인원</span>
                          <span className="font-bold text-gray-900">{reservation.guestCount}명</span>
                        </div>
                      </div>
                    </div>

                    {reservation.request && (
                      <div className="mt-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                        <p className="text-sm text-gray-700">
                          <span className="font-bold text-orange-600 mr-2">요청사항</span>
                          {reservation.request}
                        </p>
                      </div>
                    )}

                    {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                      <div className="mt-6 flex justify-end pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancelModal({ isOpen: true, id: reservation.id })}
                          className="hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                        >
                          예약 취소하기
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Modal */}
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
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 shadow-md shadow-red-200"
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

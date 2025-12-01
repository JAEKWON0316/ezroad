'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, Clock, Users, MapPin, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reservationApi } from '@/lib/api';
import { Reservation, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  PENDING: '대기중',
  CONFIRMED: '확정',
  CANCELLED: '취소됨',
  COMPLETED: '완료',
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
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="font-semibold text-gray-900">예약 내역</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">예약 내역이 없습니다</p>
            <Link href="/restaurants">
              <Button>맛집 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link href={`/restaurants/${reservation.restaurantId}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-orange-500">
                            {reservation.restaurantName || '식당 정보 없음'}
                          </h3>
                        </Link>
                        {reservation.restaurantAddress && (
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {reservation.restaurantAddress}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[reservation.status]}`}>
                        {statusLabels[reservation.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{reservation.reservationDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{reservation.reservationTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{reservation.guestCount}명</span>
                      </div>
                    </div>

                    {reservation.request && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">요청사항:</span> {reservation.request}
                        </p>
                      </div>
                    )}

                    {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancelModal({ isOpen: true, id: reservation.id })}
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          예약 취소
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
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
          <p className="text-gray-600">정말 예약을 취소하시겠습니까?</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCancelModal({ isOpen: false, id: null })}
            >
              아니오
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600"
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

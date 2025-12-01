'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, Users, Phone, Clock, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, reservationApi } from '@/lib/api';
import { Restaurant, Reservation, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import toast from 'react-hot-toast';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  PENDING: '대기중',
  CONFIRMED: '확정',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

export default function PartnerReservationsPage({ params }: { params: Promise<{ id: string }> }) {
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
          <div>
            <h1 className="font-semibold text-gray-900">예약 관리</h1>
            <p className="text-sm text-gray-500">{restaurant?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? '전체' : statusLabels[status]}
            </button>
          ))}
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">예약 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{reservation.memberName || '예약자'}</p>
                    {reservation.memberPhone && (
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        {reservation.memberPhone}
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
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <span className="font-medium">요청사항: </span>{reservation.request}
                  </div>
                )}

                {/* Action Buttons */}
                {reservation.status === 'PENDING' && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                    <Button size="sm" onClick={() => handleConfirm(reservation.id)} leftIcon={<Check className="h-4 w-4" />}>
                      확정
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel(reservation.id)} className="text-red-500 border-red-200" leftIcon={<X className="h-4 w-4" />}>
                      거절
                    </Button>
                  </div>
                )}
                {reservation.status === 'CONFIRMED' && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleComplete(reservation.id)}>
                      완료 처리
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel(reservation.id)} className="text-red-500 border-red-200">
                      취소
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

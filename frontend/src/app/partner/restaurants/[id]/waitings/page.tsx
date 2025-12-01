'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Users, Clock, Hash, Bell, Check, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, waitingApi } from '@/lib/api';
import { Restaurant, Waiting, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import toast from 'react-hot-toast';

const statusStyles: Record<string, string> = {
  WAITING: 'bg-yellow-100 text-yellow-700',
  CALLED: 'bg-blue-100 text-blue-700',
  SEATED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  WAITING: '대기중',
  CALLED: '호출됨',
  SEATED: '착석완료',
  CANCELLED: '취소됨',
  NO_SHOW: '노쇼',
};

export default function PartnerWaitingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [waitings, setWaitings] = useState<Waiting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [restaurantData, waitingsData] = await Promise.all([
        restaurantApi.getById(Number(id)),
        waitingApi.getByRestaurant(Number(id), page, 10),
      ]);
      setRestaurant(restaurantData);
      setWaitings(waitingsData.content);
      setTotalPages(waitingsData.totalPages);
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

  const handleCall = async (waitingId: number) => {
    try {
      await waitingApi.call(waitingId);
      toast.success('대기 손님을 호출했습니다');
      fetchData();
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleSeat = async (waitingId: number) => {
    try {
      await waitingApi.seat(waitingId);
      toast.success('착석 처리되었습니다');
      fetchData();
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleNoShow = async (waitingId: number) => {
    try {
      await waitingApi.noShow(waitingId);
      toast.success('노쇼 처리되었습니다');
      fetchData();
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const filteredWaitings = statusFilter === 'all' 
    ? waitings 
    : waitings.filter(w => w.status === statusFilter);

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
            <h1 className="font-semibold text-gray-900">대기 관리</h1>
            <p className="text-sm text-gray-500">{restaurant?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'WAITING', 'CALLED', 'SEATED', 'NO_SHOW'].map((status) => (
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

        {/* Waitings List */}
        {filteredWaitings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">대기 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWaitings.map((waiting) => (
              <div key={waiting.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-500 text-lg">
                      {waiting.waitingNumber}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{waiting.memberNickname || '손님'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(waiting.createdAt).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[waiting.status]}`}>
                    {statusLabels[waiting.status]}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span>대기번호 {waiting.waitingNumber}번</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{waiting.guestCount}명</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>약 {waiting.estimatedWaitTime || 0}분</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {waiting.status === 'WAITING' && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                    <Button size="sm" onClick={() => handleCall(waiting.id)} leftIcon={<Bell className="h-4 w-4" />}>
                      호출
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleNoShow(waiting.id)} className="text-gray-500">
                      노쇼 처리
                    </Button>
                  </div>
                )}
                {waiting.status === 'CALLED' && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                    <Button size="sm" onClick={() => handleSeat(waiting.id)} leftIcon={<Check className="h-4 w-4" />}>
                      착석 완료
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleNoShow(waiting.id)} className="text-gray-500" leftIcon={<XCircle className="h-4 w-4" />}>
                      노쇼
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

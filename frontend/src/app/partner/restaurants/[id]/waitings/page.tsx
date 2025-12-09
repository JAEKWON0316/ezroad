'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Users, Clock, Hash, Bell, Check, XCircle, User, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, waitingApi } from '@/lib/api';
import { Restaurant, Waiting } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import toast from 'react-hot-toast';

const statusStyles: Record<string, string> = {
  WAITING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CALLED: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse',
  SEATED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-500 border-red-100',
  NO_SHOW: 'bg-gray-100 text-gray-500 border-gray-200',
};

const statusLabels: Record<string, string> = {
  WAITING: '대기중',
  CALLED: '호출중',
  SEATED: '착석',
  CANCELLED: '취소',
  NO_SHOW: '노쇼',
};

export default function WaitingsManagementPage({ params }: { params: Promise<{ id: string }> }) {
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
    if (!window.confirm('노쇼 처리하시겠습니까?')) return;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loading size="lg" />
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
            <h1 className="font-bold text-xl text-gray-900">웨이팅 관리</h1>
            <p className="text-sm text-gray-500 font-medium">{restaurant?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Status Filter Tabs */}
        <div className="glass-panel p-1.5 rounded-2xl flex flex-wrap gap-1 mb-6">
          {['all', 'WAITING', 'CALLED', 'SEATED', 'NO_SHOW'].map((status) => (
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

        {/* Waitings List */}
        {filteredWaitings.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">대기 손님이 없습니다</h3>
            <p className="text-gray-500 text-sm">현재 대기 중인 손님이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWaitings.map((waiting) => (
              <div
                key={waiting.id}
                className={`glass-card p-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${waiting.status === 'WAITING' ? 'border-l-yellow-400' :
                    waiting.status === 'CALLED' ? 'border-l-blue-500' :
                      waiting.status === 'SEATED' ? 'border-l-green-500' : 'border-l-gray-300'
                  }`}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                  {/* Left: Number Badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 border-r border-gray-100 md:pr-6">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Queue No.</span>
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600 font-mono">
                      {waiting.waitingNumber}
                    </div>
                  </div>

                  {/* Middle: Waiting Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{waiting.memberNickname || '비회원 손님'}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${statusStyles[waiting.status]}`}>
                        {waiting.status === 'CALLED' && <Bell className="w-3 h-3 animate-bounce" />}
                        {statusLabels[waiting.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{waiting.guestCount}명</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>대기시간: <span className="font-semibold text-orange-600">약 {waiting.estimatedWaitTime || 0}분</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        {new Date(waiting.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 접수
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2 md:pl-6 md:border-l md:border-gray-100">
                    {waiting.status === 'WAITING' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full md:w-auto hover:bg-red-50 text-red-500 border-red-100"
                          onClick={() => handleNoShow(waiting.id)}
                        >
                          노쇼
                        </Button>
                        <Button
                          size="sm"
                          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md shadow-blue-500/20"
                          onClick={() => handleCall(waiting.id)}
                          leftIcon={<Bell className="w-4 h-4" />}
                        >
                          호출하기
                        </Button>
                      </>
                    )}

                    {waiting.status === 'CALLED' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full md:w-auto hover:bg-red-50 text-red-500 border-red-100"
                          onClick={() => handleNoShow(waiting.id)}
                        >
                          노쇼/취소
                        </Button>
                        <Button
                          size="sm"
                          className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white border-0 shadow-md shadow-green-500/20"
                          onClick={() => handleSeat(waiting.id)}
                          leftIcon={<Check className="w-4 h-4" />}
                        >
                          착석 완료
                        </Button>
                      </>
                    )}
                  </div>
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

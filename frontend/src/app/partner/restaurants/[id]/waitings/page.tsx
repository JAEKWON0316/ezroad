'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Users, 
  Clock, 
  Bell, 
  Check, 
  XCircle, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, waitingApi } from '@/lib/api';
import { Restaurant, Waiting } from '@/types';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

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
  SEATED: '착석완료',
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 오늘 날짜의 웨이팅만 필터링
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayWaitings = waitings.filter(w => {
    const waitingDate = format(new Date(w.createdAt), 'yyyy-MM-dd');
    return waitingDate === today;
  });

  // 상태별 분류
  const waitingList = todayWaitings.filter(w => w.status === 'WAITING');
  const calledList = todayWaitings.filter(w => w.status === 'CALLED');
  const completedList = todayWaitings.filter(w => 
    w.status === 'SEATED' || w.status === 'CANCELLED' || w.status === 'NO_SHOW'
  );

  // 통계
  const stats = {
    waiting: waitingList.length,
    called: calledList.length,
    seated: todayWaitings.filter(w => w.status === 'SEATED').length,
    cancelled: todayWaitings.filter(w => w.status === 'CANCELLED').length,
    noShow: todayWaitings.filter(w => w.status === 'NO_SHOW').length,
  };

  const fetchData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const [restaurantData, waitingsData] = await Promise.all([
        restaurantApi.getById(Number(id)),
        waitingApi.getByRestaurant(Number(id), 0, 100), // 오늘 전체 가져오기
      ]);
      setRestaurant(restaurantData);
      setWaitings(waitingsData.content);
      setLastUpdated(new Date());
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

  // 30초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleCall = async (waitingId: number) => {
    try {
      await waitingApi.call(waitingId);
      toast.success('대기 손님을 호출했습니다');
      fetchData(true);
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleSeat = async (waitingId: number) => {
    try {
      await waitingApi.seat(waitingId);
      toast.success('착석 처리되었습니다');
      fetchData(true);
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleNoShow = async (waitingId: number) => {
    if (!window.confirm('노쇼 처리하시겠습니까?')) return;
    try {
      await waitingApi.noShow(waitingId);
      toast.success('노쇼 처리되었습니다');
      fetchData(true);
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  const handleCancel = async (waitingId: number) => {
    if (!window.confirm('대기를 취소하시겠습니까?')) return;
    try {
      await waitingApi.cancel(waitingId);
      toast.success('대기가 취소되었습니다');
      fetchData(true);
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  // 경과 시간 계산
  const getElapsedTime = (createdAt: string) => {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    return `${Math.floor(diff / 60)}시간 ${diff % 60}분 전`;
  };


  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">대기 현황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="font-bold text-xl text-gray-900">웨이팅 관리</h1>
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

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 오늘 날짜 & 마지막 업데이트 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-lg font-bold text-gray-900">
              {format(new Date(), 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            마지막 업데이트: {format(lastUpdated, 'HH:mm:ss')}
          </span>
        </div>

        {/* 실시간 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-yellow-600">{stats.waiting}</div>
            <div className="text-xs font-bold text-yellow-600/70 mt-1">대기중</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-blue-600">{stats.called}</div>
            <div className="text-xs font-bold text-blue-600/70 mt-1">호출중</div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-green-600">{stats.seated}</div>
            <div className="text-xs font-bold text-green-600/70 mt-1">착석완료</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-red-500">{stats.cancelled}</div>
            <div className="text-xs font-bold text-red-500/70 mt-1">취소</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-gray-500">{stats.noShow}</div>
            <div className="text-xs font-bold text-gray-500/70 mt-1">노쇼</div>
          </div>
        </div>


        {/* 🟡 대기중 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <h2 className="font-bold text-gray-900">대기중 ({waitingList.length}팀)</h2>
          </div>
          
          {waitingList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">현재 대기중인 손님이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingList.map((waiting, index) => (
                <div
                  key={waiting.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* 순번 */}
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                      <span className="text-2xl font-black text-white">#{waiting.waitingNumber}</span>
                    </div>
                    
                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{waiting.memberNickname || '비회원'}</span>
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                          {waiting.guestCount}명
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {getElapsedTime(waiting.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5" />
                          예상 {waiting.estimatedWaitTime || 0}분
                        </span>
                      </div>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancel(waiting.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="취소"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-200"
                        onClick={() => handleCall(waiting.id)}
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        호출
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 🔵 호출중 섹션 */}
        {calledList.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <h2 className="font-bold text-gray-900">호출중 ({calledList.length}팀)</h2>
              <span className="text-xs text-blue-500 font-medium">5분 내 미입장시 노쇼 처리</span>
            </div>
            
            <div className="space-y-3">
              {calledList.map((waiting) => (
                <div
                  key={waiting.id}
                  className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-4 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    {/* 순번 */}
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <span className="text-2xl font-black text-white">#{waiting.waitingNumber}</span>
                    </div>
                    
                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-4 h-4 text-blue-500 animate-bounce" />
                        <span className="font-bold text-gray-900">{waiting.memberNickname || '비회원'}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          {waiting.guestCount}명
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 font-medium">
                        호출됨 · 손님을 기다리는 중...
                      </p>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleNoShow(waiting.id)}
                        className="px-3 py-2 text-red-500 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors"
                      >
                        노쇼
                      </button>
                      <button
                        onClick={() => handleCall(waiting.id)}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-colors"
                      >
                        재호출
                      </button>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-200"
                        onClick={() => handleSeat(waiting.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        착석
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* ⚫ 완료/취소 히스토리 (접기/펼치기) */}
        {completedList.length > 0 && (
          <section>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gray-500" />
                <span className="font-bold text-gray-700">오늘 처리 내역 ({completedList.length}건)</span>
              </div>
              {showHistory ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {showHistory && (
              <div className="mt-3 space-y-2">
                {completedList.map((waiting) => (
                  <div
                    key={waiting.id}
                    className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 text-sm"
                  >
                    <span className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-500">
                      #{waiting.waitingNumber}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{waiting.memberNickname || '비회원'}</span>
                      <span className="text-gray-400 ml-2">{waiting.guestCount}명</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      waiting.status === 'SEATED' 
                        ? 'bg-green-100 text-green-600' 
                        : waiting.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {statusLabels[waiting.status]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(waiting.createdAt), 'HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 대기가 하나도 없을 때 */}
        {todayWaitings.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-orange-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">오늘 대기가 없습니다</h3>
            <p className="text-gray-500">손님이 대기를 등록하면 여기에 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

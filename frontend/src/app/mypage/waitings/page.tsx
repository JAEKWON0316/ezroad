'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Clock, 
  Users, 
  X, 
  Hash, 
  Coffee, 
  TrendingUp,
  Bell,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { waitingApi } from '@/lib/api';
import { Waiting, PageResponse, WaitingQueueUpdate } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  WAITING: '대기중',
  CALLED: '입장안내',
  SEATED: '착석완료',
  CANCELLED: '취소됨',
  NO_SHOW: '노쇼',
};

export default function MyWaitingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { lastNotification } = useNotifications();

  const [waitings, setWaitings] = useState<Waiting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [isCancelling, setIsCancelling] = useState(false);
  const [queueUpdates, setQueueUpdates] = useState<Map<number, WaitingQueueUpdate>>(new Map());

  // 현재 활성 웨이팅 (대기중 또는 호출중)
  const activeWaitings = waitings.filter(w => w.status === 'WAITING' || w.status === 'CALLED');
  // 지난 웨이팅 (착석, 취소, 노쇼)
  const historyWaitings = waitings.filter(w => 
    w.status === 'SEATED' || w.status === 'CANCELLED' || w.status === 'NO_SHOW'
  );

  const fetchWaitings = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const response: PageResponse<Waiting> = await waitingApi.getMyWaitings(0, 50);
      setWaitings(response.content);
    } catch (error) {
      console.error('Failed to fetch waitings:', error);
      toast.error('대기 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchWaitings();
    }
  }, [authLoading, isAuthenticated, router, fetchWaitings]);

  // WebSocket 알림 수신 시 처리
  useEffect(() => {
    if (!lastNotification) return;
    const { type } = lastNotification;
    
    if (type === 'WAITING_CALLED' || type === 'WAITING_CANCELLED') {
      fetchWaitings(true);
    }
    
    if (type === 'WAITING_QUEUE_UPDATE') {
      const update = lastNotification as unknown as WaitingQueueUpdate;
      setQueueUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(update.waitingId, update);
        return newMap;
      });
    }
  }, [lastNotification, fetchWaitings]);

  const handleCancelWaiting = async () => {
    if (!cancelModal.id) return;

    setIsCancelling(true);
    try {
      await waitingApi.cancel(cancelModal.id);
      toast.success('대기가 취소되었습니다');
      setCancelModal({ isOpen: false, id: null });
      fetchWaitings(true);
    } catch {
      toast.error('대기 취소에 실패했습니다');
    } finally {
      setIsCancelling(false);
    }
  };

  const getQueueInfo = (waiting: Waiting) => {
    const update = queueUpdates.get(waiting.id);
    if (update) {
      return {
        positionInQueue: update.positionInQueue,
        estimatedWaitTime: update.estimatedWaitTime,
      };
    }
    return {
      positionInQueue: waiting.positionInQueue ?? null,
      estimatedWaitTime: waiting.estimatedWaitTime,
    };
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <Loading size="lg" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">웨이팅 내역</h1>
          </div>
          <button
            onClick={() => fetchWaitings(true)}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 현재 웨이팅이 없을 때 */}
        {activeWaitings.length === 0 && historyWaitings.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-10 h-10 text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">웨이팅 내역이 없습니다</h3>
            <p className="text-gray-500 mb-6">맛집에서 스마트하게 웨이팅을 신청해보세요!</p>
            <Link href="/restaurants">
              <Button className="bg-purple-600 hover:bg-purple-700">맛집 둘러보기</Button>
            </Link>
          </div>
        )}

        {/* 현재 웨이팅만 없을 때 */}
        {activeWaitings.length === 0 && historyWaitings.length > 0 && (
          <div className="bg-purple-50 rounded-2xl p-6 text-center border border-purple-100">
            <p className="text-purple-600 font-medium">현재 대기중인 웨이팅이 없습니다</p>
          </div>
        )}

        {/* 🔴 현재 웨이팅 (강조) */}
        {activeWaitings.map((waiting) => {
          const queueInfo = getQueueInfo(waiting);
          const isCalled = waiting.status === 'CALLED';

          return (
            <div
              key={waiting.id}
              className={`rounded-3xl overflow-hidden shadow-lg ${
                isCalled 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white animate-pulse' 
                  : 'bg-white border border-gray-100'
              }`}
            >
              {/* 호출 알림 배너 */}
              {isCalled && (
                <div className="bg-white/20 px-6 py-3 flex items-center justify-center gap-2">
                  <Bell className="w-5 h-5 animate-bounce" />
                  <span className="font-bold">순서가 되었습니다! 매장으로 와주세요</span>
                </div>
              )}

              <div className="p-6">
                {/* 식당명 */}
                <div className="flex items-center justify-between mb-6">
                  <Link href={`/restaurants/${waiting.restaurantId}`}>
                    <h3 className={`text-xl font-bold ${isCalled ? 'text-white' : 'text-gray-900'} hover:underline`}>
                      {waiting.restaurantName || '식당 정보 없음'}
                    </h3>
                  </Link>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isCalled ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {statusLabels[waiting.status]}
                  </span>
                </div>

                {/* 대기번호 크게 */}
                <div className="text-center py-6">
                  <p className={`text-sm font-medium mb-2 ${isCalled ? 'text-white/70' : 'text-gray-500'}`}>
                    대기번호
                  </p>
                  <div className={`text-6xl font-black ${isCalled ? 'text-white' : 'text-purple-600'}`}>
                    #{waiting.waitingNumber}
                  </div>
                </div>

                {/* 내 앞 팀 & 예상 대기시간 */}
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-2xl mb-6 ${
                  isCalled ? 'bg-white/10' : 'bg-purple-50'
                }`}>
                  <div className="text-center">
                    <p className={`text-sm mb-1 ${isCalled ? 'text-white/70' : 'text-gray-500'}`}>내 앞</p>
                    <p className={`text-2xl font-black ${isCalled ? 'text-white' : 'text-purple-600'}`}>
                      {queueInfo.positionInQueue !== null ? `${queueInfo.positionInQueue}팀` : '-'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm mb-1 ${isCalled ? 'text-white/70' : 'text-gray-500'}`}>예상 대기</p>
                    <p className={`text-2xl font-black ${isCalled ? 'text-white' : 'text-purple-600'}`}>
                      약 {queueInfo.estimatedWaitTime || 0}분
                    </p>
                  </div>
                </div>

                {/* 인원 & 등록시간 */}
                <div className={`flex items-center justify-between text-sm ${
                  isCalled ? 'text-white/70' : 'text-gray-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {waiting.guestCount}명
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(waiting.createdAt), 'HH:mm')} 등록
                  </span>
                </div>

                {/* 취소 버튼 */}
                {waiting.status === 'WAITING' && (
                  <button
                    onClick={() => setCancelModal({ isOpen: true, id: waiting.id })}
                    className="w-full mt-6 py-3 border border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                  >
                    대기 취소
                  </button>
                )}
              </div>
            </div>
          );
        })}


        {/* 📋 지난 웨이팅 기록 (접기/펼치기) */}
        {historyWaitings.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
            >
              <span className="font-bold text-gray-700">지난 웨이팅 기록 ({historyWaitings.length}건)</span>
              {showHistory ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2">
                {historyWaitings.map((waiting) => (
                  <div
                    key={waiting.id}
                    className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4"
                  >
                    {/* 상태 아이콘 */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      waiting.status === 'SEATED' 
                        ? 'bg-green-100' 
                        : waiting.status === 'CANCELLED' 
                        ? 'bg-red-50' 
                        : 'bg-gray-100'
                    }`}>
                      {waiting.status === 'SEATED' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/restaurants/${waiting.restaurantId}`}>
                        <h4 className="font-bold text-gray-900 truncate hover:text-purple-600">
                          {waiting.restaurantName || '식당'}
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-500">
                        {format(new Date(waiting.createdAt), 'M/d (EEE) HH:mm', { locale: ko })} · {waiting.guestCount}명
                      </p>
                    </div>

                    {/* 상태 */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      waiting.status === 'SEATED' 
                        ? 'bg-green-100 text-green-600' 
                        : waiting.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {statusLabels[waiting.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 취소 확인 모달 */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, id: null })}
        title="대기 취소"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">정말 대기를 취소하시겠습니까?</p>
            <p className="text-sm text-gray-500 mt-1">대기열에서 완전히 삭제됩니다.</p>
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
              onClick={handleCancelWaiting}
              isLoading={isCancelling}
            >
              대기 취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

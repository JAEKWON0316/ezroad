'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, Users, X, Hash, Coffee, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { waitingApi } from '@/lib/api';
import { Waiting, PageResponse, WaitingQueueUpdate } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import CardListSkeleton from '@/components/common/CardListSkeleton';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

const statusStyles: Record<string, string> = {
  WAITING: 'bg-purple-100/80 text-purple-700 border-purple-200',
  CALLED: 'bg-blue-100/80 text-blue-700 border-blue-200 animate-pulse',
  SEATED: 'bg-green-100/80 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100/80 text-red-700 border-red-200',
  NO_SHOW: 'bg-gray-100/80 text-gray-700 border-gray-200',
};

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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [isCancelling, setIsCancelling] = useState(false);
  
  // 🔴 실시간 순번 정보 (WaitingQueueUpdate)
  const [queueUpdates, setQueueUpdates] = useState<Map<number, WaitingQueueUpdate>>(new Map());

  const fetchWaitings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Waiting> = await waitingApi.getMyWaitings(page, 10);
      setWaitings(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch waitings:', error);
      toast.error('대기 목록을 불러오는데 실패했습니다');
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
      fetchWaitings();
    }
  }, [authLoading, isAuthenticated, router, fetchWaitings]);

  // 🔴 WebSocket 알림 수신 시 처리
  useEffect(() => {
    if (!lastNotification) return;
    
    const { type } = lastNotification;
    
    // 대기 관련 알림이면 목록 새로고침
    if (type === 'WAITING_CALLED' || type === 'WAITING_CANCELLED') {
      console.log('[MyWaitings] 대기 상태 변경 알림 수신, 목록 새로고침');
      fetchWaitings();
    }
    
    // 순번 업데이트 알림 처리
    if (type === 'WAITING_QUEUE_UPDATE') {
      const update = lastNotification as unknown as WaitingQueueUpdate;
      console.log('[MyWaitings] 순번 업데이트:', update);
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
      fetchWaitings();
    } catch {
      toast.error('대기 취소에 실패했습니다');
    } finally {
      setIsCancelling(false);
    }
  };

  // 대기 순번 정보 가져오기
  const getQueueInfo = (waiting: Waiting) => {
    // WebSocket 업데이트가 있으면 우선 사용 (더 최신 정보)
    const update = queueUpdates.get(waiting.id);
    if (update) {
      return {
        positionInQueue: update.positionInQueue,
        estimatedWaitTime: update.estimatedWaitTime,
        totalWaitingCount: update.totalWaitingCount,
      };
    }
    // API 응답 데이터 사용 (초기 로딩 시)
    return {
      positionInQueue: waiting.positionInQueue ?? null,
      estimatedWaitTime: waiting.estimatedWaitTime,
      totalWaitingCount: waiting.totalWaitingCount ?? null,
    };
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
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">웨이팅 내역</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <CardListSkeleton viewMode="list" count={5} />
        ) : waitings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
              <Coffee className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">대기 내역이 없습니다</h3>
            <p className="text-gray-500 mb-8 text-center max-w-xs">
              긴 줄 서지 말고<br />스마트하게 웨이팅을 신청해보세요!
            </p>
            <Link href="/restaurants">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200">맛집 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {waitings.map((waiting, index) => {
                const queueInfo = getQueueInfo(waiting);
                
                return (
                  <div
                    key={waiting.id}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 block relative"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Status Bar */}
                    <div className={`h-1.5 w-full ${waiting.status === 'SEATED' ? 'bg-green-500' :
                      waiting.status === 'CALLED' ? 'bg-blue-500' :
                        waiting.status === 'WAITING' ? 'bg-purple-500' :
                          waiting.status === 'CANCELLED' ? 'bg-red-400' : 'bg-gray-300'
                      }`} />

                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                          <Link href={`/restaurants/${waiting.restaurantId}`}>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
                              {waiting.restaurantName || '식당 정보 없음'}
                              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md font-normal">웨이팅</span>
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mt-2">
                            신청일시: <span className="font-medium text-gray-700">{new Date(waiting.createdAt).toLocaleDateString()} {new Date(waiting.createdAt).toLocaleTimeString()}</span>
                          </p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusStyles[waiting.status]}`}>
                          {statusLabels[waiting.status]}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                            <Hash className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium">대기번호</span>
                            <span className="font-bold text-gray-900 text-lg">{waiting.waitingNumber}번</span>
                          </div>
                        </div>
                        
                        {/* 🔴 내 앞에 몇 팀 (실시간) */}
                        {waiting.status === 'WAITING' && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-purple-100">
                              <TrendingUp className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 font-medium">내 앞에</span>
                              <span className={`font-bold text-lg ${queueInfo.positionInQueue !== null ? 'text-purple-600' : 'text-gray-900'}`}>
                                {queueInfo.positionInQueue !== null 
                                  ? `${queueInfo.positionInQueue}팀` 
                                  : '-'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                            <Users className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium">인원</span>
                            <span className="font-bold text-gray-900 text-lg">{waiting.guestCount}명</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                            <Clock className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium">예상대기</span>
                            <span className={`font-bold text-lg ${waiting.status === 'WAITING' ? 'text-purple-600 animate-pulse' : 'text-gray-900'}`}>
                              약 {queueInfo.estimatedWaitTime || 0}분
                            </span>
                          </div>
                        </div>
                      </div>

                      {waiting.status === 'CALLED' && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-bounce-subtle">
                          <p className="text-blue-700 font-bold flex items-center justify-center gap-2">
                            🔔 순서가 되었습니다! 지금 바로 매장으로 와주세요.
                          </p>
                        </div>
                      )}

                      {waiting.status === 'WAITING' && (
                        <div className="mt-6 flex justify-end pt-4 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCancelModal({ isOpen: true, id: waiting.id })}
                            className="hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                          >
                            대기 취소하기
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

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
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 shadow-md shadow-red-200"
              onClick={handleCancelWaiting}
              isLoading={isCancelling}
            >
              대기 취소 완료
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

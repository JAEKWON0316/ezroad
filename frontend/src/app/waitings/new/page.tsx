'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Users, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, waitingApi } from '@/lib/api';
import { Restaurant } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';

const waitingSchema = z.object({
  guestCount: z.number().min(1, '인원을 선택해주세요').max(20, '최대 20명까지 가능'),
});

type WaitingFormData = z.infer<typeof waitingSchema>;

export default function NewWaitingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <NewWaitingContent />
    </Suspense>
  );
}

function NewWaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const restaurantId = searchParams.get('restaurantId');
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitingInfo, setWaitingInfo] = useState<{ waitingNumber: number; estimatedMinutes: number } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<WaitingFormData>({
    resolver: zodResolver(waitingSchema),
    defaultValues: { guestCount: 2 },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }
    if (!restaurantId) {
      toast.error('식당 정보가 없습니다');
      router.push('/restaurants');
      return;
    }
    const fetchRestaurant = async () => {
      try {
        const data = await restaurantApi.getById(Number(restaurantId));
        setRestaurant(data);
      } catch {
        toast.error('식당 정보를 불러오는데 실패했습니다');
        router.push('/restaurants');
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated) fetchRestaurant();
  }, [authLoading, isAuthenticated, restaurantId, router]);

  const onSubmit = async (data: WaitingFormData) => {
    if (!restaurantId) return;
    setIsSubmitting(true);
    try {
      const result = await waitingApi.create({
        restaurantId: Number(restaurantId),
        guestCount: data.guestCount,
      });
      setWaitingInfo({
        waitingNumber: result.waitingNumber,
        estimatedMinutes: result.estimatedWaitTime || 15,
      });
      toast.success('대기 등록이 완료되었습니다');
    } catch {
      toast.error('대기 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loading size="lg" /></div>;
  }
  if (!restaurant) return null;

  // 대기 등록 완료 화면
  if (waitingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">대기 등록 완료!</h1>
          <p className="text-gray-500 mb-6">{restaurant.name}</p>
          
          <div className="bg-orange-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">대기 번호</p>
            <p className="text-5xl font-bold text-orange-500 mb-4">{waitingInfo.waitingNumber}</p>
            <p className="text-sm text-gray-500">
              예상 대기 시간: <span className="font-semibold text-gray-900">{waitingInfo.estimatedMinutes}분</span>
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            순서가 되면 카카오톡으로 알림을 보내드립니다.<br />
            호출 후 5분 내로 입장해주세요.
          </p>
          
          <div className="space-y-3">
            <Button onClick={() => router.push('/mypage')} className="w-full">
              마이페이지에서 확인
            </Button>
            <button onClick={() => router.push('/restaurants')} className="w-full py-3 text-gray-500 hover:text-gray-700">
              다른 식당 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">원격 줄서기</h1>
            <p className="text-sm text-gray-500">{restaurant.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 식당 정보 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">대기 정보 입력</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                인원 수
              </label>
              <select
                {...register('guestCount', { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>{num}명</option>
                ))}
              </select>
              {errors.guestCount && <p className="text-red-500 text-sm mt-1">{errors.guestCount.message}</p>}
            </div>

            {/* 안내사항 */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-900">📌 대기 안내</p>
              <ul className="list-disc list-inside space-y-1">
                <li>원격 줄서기로 매장 방문 없이 대기할 수 있습니다</li>
                <li>순서가 되면 카카오톡으로 알림을 보내드립니다</li>
                <li>호출 후 5분 내로 입장하지 않으면 자동 취소됩니다</li>
                <li>대기 취소는 마이페이지에서 가능합니다</li>
              </ul>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            대기 등록하기
          </Button>
        </form>
      </div>
    </div>
  );
}

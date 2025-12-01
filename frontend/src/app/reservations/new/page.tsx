'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Calendar, Clock, Users, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, reservationApi } from '@/lib/api';
import { Restaurant } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';

const reservationSchema = z.object({
  guestCount: z.number().min(1, '인원을 선택해주세요').max(20, '최대 20명까지 가능'),
  reservationDate: z.string().min(1, '날짜를 선택해주세요'),
  reservationTime: z.string().min(1, '시간을 선택해주세요'),
  request: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

const timeSlots = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00',
];

export default function NewReservationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <NewReservationContent />
    </Suspense>
  );
}

function NewReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const restaurantId = searchParams.get('restaurantId');
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { guestCount: 2 },
  });

  const guestCount = watch('guestCount');

  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'M월 d일 (EEE)', { locale: ko }),
      isToday: i === 0,
    };
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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setValue('reservationDate', date);
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setValue('reservationTime', time);
    setStep(3);
  };

  const onSubmit = async (data: ReservationFormData) => {
    if (!restaurantId) return;
    setIsSubmitting(true);
    try {
      await reservationApi.create({
        restaurantId: Number(restaurantId),
        guestCount: data.guestCount,
        reservationDate: data.reservationDate,
        reservationTime: data.reservationTime,
        request: data.request,
      });
      toast.success('예약이 완료되었습니다');
      router.push('/mypage');
    } catch {
      toast.error('예약에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loading size="lg" /></div>;
  }
  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">예약하기</h1>
            <p className="text-sm text-gray-500">{restaurant.name}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center gap-4">
          {[
            { num: 1, label: '날짜', icon: Calendar },
            { num: 2, label: '시간', icon: Clock },
            { num: 3, label: '정보', icon: Users },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= s.num ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={`ml-2 text-sm ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
              {i < 2 && <div className={`w-12 h-1 mx-4 ${step > s.num ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: 날짜 선택 */}
          {step === 1 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">날짜를 선택해주세요</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleDateSelect(opt.value)}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      selectedDate === opt.value
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <span className="block font-medium">{opt.label}</span>
                    {opt.isToday && <span className="text-xs text-orange-500">오늘</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 시간 선택 */}
          {step === 2 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">시간을 선택해주세요</h2>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-orange-500">
                  날짜 변경
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">선택한 날짜: {selectedDate}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      selectedTime === time
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: 인원 및 요청사항 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">예약 정보</h2>
                  <button type="button" onClick={() => setStep(2)} className="text-sm text-orange-500">
                    시간 변경
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{selectedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{selectedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">인원</label>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">요청사항 (선택)</label>
                    <textarea
                      {...register('request')}
                      rows={3}
                      placeholder="예: 창가 자리 부탁드립니다"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 예약 요약 */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <h3 className="font-semibold text-gray-900 mb-3">예약 정보 확인</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">식당</span>
                    <span className="font-medium">{restaurant.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">날짜</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">시간</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">인원</span>
                    <span className="font-medium">{guestCount}명</span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                예약하기
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

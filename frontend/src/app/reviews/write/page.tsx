'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, X, ChevronLeft, ImagePlus, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, reviewApi, fileApi, reservationApi } from '@/lib/api';
import { Restaurant, Reservation } from '@/types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import FormSkeleton from '@/components/common/FormSkeleton';
import toast from 'react-hot-toast';

const reviewSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(10, '리뷰는 최소 10자 이상 작성해주세요'),
  rating: z.number().min(1, '별점을 선택해주세요').max(5),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<Loading />}>
      <WriteReviewContent />
    </Suspense>
  );
}

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // URL 파라미터
  const restaurantId = searchParams.get('restaurantId');
  const reservationId = searchParams.get('reservationId');
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    if (!restaurantId && !reservationId) {
      toast.error('식당 정보 또는 예약 정보가 필요합니다');
      router.push('/restaurants');
      return;
    }

    const fetchData = async () => {
      try {
        // 예약 기반 리뷰인 경우
        if (reservationId) {
          // 1. 리뷰 작성 가능 여부 확인
          const { canWrite } = await reviewApi.canWriteReview(Number(reservationId));
          if (!canWrite) {
            toast.error('해당 예약에 대해 리뷰를 작성할 수 없습니다');
            router.push('/mypage/reservations');
            return;
          }

          // 2. 예약 정보 조회 (API가 없으면 직접 만들어야 함)
          // 임시로 예약 목록에서 찾기
          const reservationsData = await reservationApi.getMyReservations(0, 100);
          const foundReservation = reservationsData.content.find(
            (r) => r.id === Number(reservationId)
          );
          
          if (!foundReservation) {
            toast.error('예약 정보를 찾을 수 없습니다');
            router.push('/mypage/reservations');
            return;
          }
          
          setReservation(foundReservation);
          
          // 3. 식당 정보 조회
          const restaurantData = await restaurantApi.getById(foundReservation.restaurantId);
          setRestaurant(restaurantData);
        } 
        // 직접 리뷰 작성 (예약 없이)
        else if (restaurantId) {
          const data = await restaurantApi.getById(Number(restaurantId));
          setRestaurant(data);
        }
      } catch (error) {
        toast.error('정보를 불러오는데 실패했습니다');
        router.push('/restaurants');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, restaurantId, reservationId, router]);

  const handleRatingClick = (value: number) => {
    setRating(value);
    setValue('rating', value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    if (images.length + newImages.length > 5) {
      toast.error('이미지는 최대 5개까지 업로드할 수 있습니다');
      return;
    }

    setImages((prev) => [...prev, ...newImages]);

    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!restaurant) return;

    setIsSubmitting(true);
    try {
      // 이미지 업로드
      const imageUrls: string[] = [];
      for (const image of images) {
        const result = await fileApi.upload(image, 'review');
        imageUrls.push(result.url);
      }

      // 리뷰 생성
      await reviewApi.create({
        reservationId: reservationId ? Number(reservationId) : undefined,
        restaurantId: reservationId ? undefined : Number(restaurantId),
        title: data.title,
        content: data.content,
        rating: data.rating,
        images: imageUrls,
      });

      toast.success('리뷰가 등록되었습니다');
      
      // 예약 기반이면 예약 내역으로, 아니면 식당 상세로
      if (reservationId) {
        router.push('/mypage/reservations');
      } else {
        router.push(`/restaurants/${restaurantId}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '리뷰 등록에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <FormSkeleton />
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">리뷰 작성</h1>
              <p className="text-sm text-gray-500">{restaurant.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 예약 정보 표시 (예약 기반 리뷰인 경우) */}
        {reservation && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">방문 완료된 예약</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  {reservation.reservationDate} {reservation.reservationTime?.slice(0, 5)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{reservation.guestCount}명</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              별점을 선택해주세요
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${value <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              {rating === 0 && '터치하여 별점을 선택하세요'}
              {rating === 1 && '별로예요'}
              {rating === 2 && '그저 그래요'}
              {rating === 3 && '괜찮아요'}
              {rating === 4 && '맛있어요'}
              {rating === 5 && '최고예요!'}
            </p>
            {errors.rating && (
              <p className="text-red-500 text-sm text-center mt-2">{errors.rating.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <Input
              label="제목 (선택)"
              placeholder="리뷰 제목을 입력하세요"
              {...register('title')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                리뷰 내용
              </label>
              <textarea
                {...register('content')}
                rows={6}
                placeholder="음식, 서비스, 분위기 등에 대한 솔직한 리뷰를 작성해주세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              사진 추가 (최대 5장)
            </label>
            <div className="flex flex-wrap gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                  <ImagePlus className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">추가</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
          >
            리뷰 등록
          </Button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Star, X, Camera, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reviewApi, fileApi } from '@/lib/api';
import { Review } from '@/types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import FormSkeleton from '@/components/common/FormSkeleton';
import toast from 'react-hot-toast';

const reviewSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(10, '리뷰 내용은 10자 이상이어야 합니다'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchReview = async () => {
      try {
        const data = await reviewApi.getById(parseInt(id));

        // Check ownership
        if (data.memberId !== user?.id) {
          toast.error('수정 권한이 없습니다');
          router.push(`/reviews/${id}`);
          return;
        }

        setReview(data);
        setRating(data.rating);
        setImages(data.imageUrls || []);
        reset({
          title: data.title || '',
          content: data.content,
        });
      } catch {
        toast.error('리뷰를 불러오는데 실패했습니다');
        router.push('/reviews');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchReview();
    }
  }, [authLoading, isAuthenticated, user, id, router, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error('이미지는 최대 5장까지 업로드할 수 있습니다');
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(file => fileApi.upload(file, 'review'));
      const results = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...results.map(r => r.url)]);
      toast.success('이미지가 업로드되었습니다');
    } catch {
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast.error('별점을 선택해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewApi.update(parseInt(id), {
        ...data,
        rating,
        images,
      });
      toast.success('리뷰가 수정되었습니다');
      router.push(`/reviews/${id}`);
    } catch {
      toast.error('리뷰 수정에 실패했습니다');
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

  if (!review) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">리뷰를 찾을 수 없습니다</p>
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
          <h1 className="font-semibold text-gray-900">리뷰 수정</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Restaurant Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {review.restaurant?.thumbnail ? (
                <Image
                  src={review.restaurant.thumbnail}
                  alt={review.restaurant.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{review.restaurant?.name}</h2>
              {review.restaurant?.address && (
                <p className="text-sm text-gray-500 flex items-center mt-0.5">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {review.restaurant.address}
                </p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4 text-center">이 맛집은 어떠셨나요?</h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              {rating === 1 && '별로예요'}
              {rating === 2 && '그저 그래요'}
              {rating === 3 && '보통이에요'}
              {rating === 4 && '맛있어요'}
              {rating === 5 && '최고예요!'}
            </p>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">사진 ({images.length}/5)</h3>
            <div className="grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`리뷰 이미지 ${index + 1}`}
                    fill
                    sizes="20vw"
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200">
                  {isUploadingImage ? (
                    <Loading size="sm" />
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-400 mt-1">추가</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <Input
              label="제목 (선택)"
              placeholder="리뷰 제목을 입력하세요"
              error={errors.title?.message}
              {...register('title')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                리뷰 내용 *
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={6}
                placeholder="음식의 맛, 서비스, 분위기 등 방문 경험을 자세히 적어주세요"
                {...register('content')}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            수정 완료
          </Button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Store, Phone, MapPin, Clock, Globe, Camera, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantApi, fileApi } from '@/lib/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';

const restaurantSchema = z.object({
  name: z.string().min(2, '식당명은 2자 이상이어야 합니다'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  description: z.string().optional(),
  phone: z.string().optional(),
  zipcode: z.string().optional(),
  address: z.string().min(1, '주소를 입력해주세요'),
  addressDetail: z.string().optional(),
  website: z.string().optional(),
  businessHours: z.string().optional(),
  notice: z.string().optional(),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

const categories = [
  '한식', '중식', '일식', '양식', '아시안', '분식', '패스트푸드', '치킨', '피자', '카페', '베이커리', '기타'
];

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [menuBoardImage, setMenuBoardImage] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingMenuBoard, setIsUploadingMenuBoard] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'BUSINESS') {
      router.push('/');
      return;
    }

    const fetchRestaurant = async () => {
      try {
        const restaurant = await restaurantApi.getById(parseInt(id));
        reset({
          name: restaurant.name,
          category: restaurant.category,
          description: restaurant.description || '',
          phone: restaurant.phone || '',
          zipcode: restaurant.zipcode || '',
          address: restaurant.address,
          addressDetail: restaurant.addressDetail || '',
          website: restaurant.website || '',
          businessHours: restaurant.businessHours || '',
          notice: restaurant.notice || '',
        });
        setThumbnail(restaurant.thumbnail || null);
        setMenuBoardImage(restaurant.menuBoardImage || null);
      } catch {
        toast.error('식당 정보를 불러오는데 실패했습니다');
        router.push('/partner');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'BUSINESS') {
      fetchRestaurant();
    }
  }, [authLoading, isAuthenticated, user, id, router, reset]);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    try {
      const result = await fileApi.upload(file, 'restaurant');
      setThumbnail(result.url);
      toast.success('대표 이미지가 업로드되었습니다');
    } catch {
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleMenuBoardChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMenuBoard(true);
    try {
      const result = await fileApi.upload(file, 'menupan');
      setMenuBoardImage(result.url);
      toast.success('메뉴판 이미지가 업로드되었습니다');
    } catch {
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setIsUploadingMenuBoard(false);
    }
  };

  const onSubmit = async (data: RestaurantFormData) => {
    setIsSubmitting(true);
    try {
      await restaurantApi.update(parseInt(id), {
        ...data,
        thumbnail: thumbnail || undefined,
        menuBoardImage: menuBoardImage || undefined,
      });
      toast.success('식당 정보가 수정되었습니다');
      router.push('/partner');
    } catch {
      toast.error('식당 수정에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="font-semibold text-gray-900">식당 정보 수정</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">이미지</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">대표 이미지</p>
                <label className="block w-full aspect-video bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 overflow-hidden">
                  {thumbnail ? (
                    <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      {isUploadingThumbnail ? <Loading size="sm" /> : <Camera className="h-8 w-8 mb-2" />}
                      <span className="text-sm">이미지 업로드</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    disabled={isUploadingThumbnail}
                  />
                </label>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">메뉴판 이미지</p>
                <label className="block w-full aspect-video bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 overflow-hidden">
                  {menuBoardImage ? (
                    <img src={menuBoardImage} alt="Menu Board" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      {isUploadingMenuBoard ? <Loading size="sm" /> : <FileText className="h-8 w-8 mb-2" />}
                      <span className="text-sm">메뉴판 업로드</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMenuBoardChange}
                    className="hidden"
                    disabled={isUploadingMenuBoard}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4">기본 정보</h2>
            
            <Input
              label="식당명 *"
              leftIcon={<Store className="h-5 w-5 text-gray-400" />}
              placeholder="식당 이름을 입력하세요"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                {...register('category')}
              >
                <option value="">카테고리 선택</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">식당 소개</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={3}
                placeholder="식당을 소개해주세요"
                {...register('description')}
              />
            </div>

            <Input
              label="전화번호"
              leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
              placeholder="02-1234-5678"
              {...register('phone')}
            />

            <Input
              label="웹사이트"
              leftIcon={<Globe className="h-5 w-5 text-gray-400" />}
              placeholder="https://example.com"
              {...register('website')}
            />
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4">주소</h2>

            <Input
              label="우편번호"
              placeholder="12345"
              {...register('zipcode')}
            />

            <Input
              label="주소 *"
              leftIcon={<MapPin className="h-5 w-5 text-gray-400" />}
              placeholder="주소를 입력하세요"
              error={errors.address?.message}
              {...register('address')}
            />

            <Input
              label="상세 주소"
              placeholder="상세 주소를 입력하세요"
              {...register('addressDetail')}
            />
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4">영업 정보</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">영업 시간</label>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="예: 09:00 - 22:00 (매주 월요일 휴무)"
                  {...register('businessHours')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">공지사항</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={3}
                placeholder="손님에게 알릴 공지사항이 있으면 입력하세요"
                {...register('notice')}
              />
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

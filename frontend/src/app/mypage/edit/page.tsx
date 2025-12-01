'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fileApi } from '@/lib/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다'),
  phone: z.string().optional(),
  zipcode: z.string().optional(),
  address: z.string().optional(),
  addressDetail: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      reset({
        name: user.name,
        nickname: user.nickname,
        phone: user.phone || '',
        zipcode: user.zipcode || '',
        address: user.address || '',
        addressDetail: user.addressDetail || '',
      });
      setProfileImage(user.profileImage || null);
    }
  }, [authLoading, isAuthenticated, user, router, reset]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const result = await fileApi.upload(file, 'profile');
      setProfileImage(result.url);
      toast.success('프로필 이미지가 업로드되었습니다');
    } catch {
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      await updateUser({
        ...data,
        profileImage: profileImage || undefined,
      });
      toast.success('프로필이 수정되었습니다');
      router.push('/mypage');
    } catch {
      toast.error('프로필 수정에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="font-semibold text-gray-900">프로필 수정</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-orange-500" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full cursor-pointer hover:bg-orange-600">
                  {isUploadingImage ? (
                    <Loading size="sm" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">프로필 사진 변경</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4">기본 정보</h2>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="text-gray-900">{user?.email}</p>
              </div>
            </div>

            <Input
              label="이름"
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="닉네임"
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              error={errors.nickname?.message}
              {...register('nickname')}
            />

            <Input
              label="전화번호"
              leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
              placeholder="010-0000-0000"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4">주소</h2>

            <Input
              label="우편번호"
              placeholder="12345"
              error={errors.zipcode?.message}
              {...register('zipcode')}
            />

            <Input
              label="주소"
              leftIcon={<MapPin className="h-5 w-5 text-gray-400" />}
              placeholder="주소를 입력하세요"
              error={errors.address?.message}
              {...register('address')}
            />

            <Input
              label="상세 주소"
              placeholder="상세 주소를 입력하세요"
              error={errors.addressDetail?.message}
              {...register('addressDetail')}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            저장하기
          </Button>
        </form>
      </div>
    </div>
  );
}

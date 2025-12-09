'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, User, Mail, Phone, MapPin, Camera, Save, ArrowLeft } from 'lucide-react';
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
      toast.success('프로필이 성공적으로 수정되었습니다 ✨');
      router.push('/mypage');
    } catch {
      toast.error('프로필 수정에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">프로필 수정</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-14 w-14 text-orange-300" />
                )}
              </div>

              <label className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-orange-600 transition-all hover:scale-110">
                {isUploadingImage ? (
                  <Loading size="sm" />
                ) : (
                  <Camera className="h-5 w-5" />
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
            <p className="text-sm text-gray-500 mt-3">프로필 사진을 클릭하여 변경하세요</p>
          </div>

          <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                기본 정보
              </h2>

              <div className="space-y-5">
                <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">이메일 (변경불가)</p>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="이름"
                    leftIcon={<User className="h-5 w-5 text-gray-400" />}
                    error={errors.name?.message}
                    {...register('name')}
                    className="bg-gray-50/50 focus:bg-white"
                  />

                  <Input
                    label="닉네임"
                    leftIcon={<User className="h-5 w-5 text-gray-400" />}
                    error={errors.nickname?.message}
                    {...register('nickname')}
                    className="bg-gray-50/50 focus:bg-white"
                  />
                </div>

                <Input
                  label="전화번호"
                  leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
                  placeholder="010-0000-0000"
                  error={errors.phone?.message}
                  {...register('phone')}
                  className="bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                주소 정보
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <Input
                      label="우편번호"
                      placeholder="12345"
                      error={errors.zipcode?.message}
                      {...register('zipcode')}
                      className="bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <Input
                  label="기본 주소"
                  placeholder="주소를 입력하세요"
                  error={errors.address?.message}
                  {...register('address')}
                  className="bg-gray-50/50 focus:bg-white"
                />

                <Input
                  label="상세 주소"
                  placeholder="동/호수 등 상세주소를 입력하세요"
                  error={errors.addressDetail?.message}
                  {...register('addressDetail')}
                  className="bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 pb-12">
            <Button
              type="submit"
              className="w-full py-4 text-lg font-bold shadow-xl shadow-orange-200"
              size="lg"
              isLoading={isSubmitting}
            >
              <Save className="w-5 h-5 mr-2" />
              변경사항 저장하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

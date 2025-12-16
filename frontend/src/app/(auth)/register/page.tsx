'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2, MapPin, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';

const registerSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다'),
  passwordConfirm: z.string(),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다'),
  phone: z.string().optional(),
  zipcode: z.string().optional(),
  address: z.string().optional(),
  addressDetail: z.string().optional(),
  businessNumber: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser } = useAuth();

  const isBusiness = searchParams.get('role') === 'business';
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    setValue('zipcode', data.zonecode);
    setValue('address', fullAddress);
    setIsAddressModalOpen(false);
    setFocus('addressDetail');
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordConfirm, ...registerData } = data;
      await registerUser(registerData);
      toast.success('회원가입이 완료되었습니다!');
      router.push('/');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100 via-orange-50 to-white">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[5%] w-[35%] h-[35%] bg-orange-200/40 rounded-full blur-3xl animate-[float_7s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-orange-300/30 rounded-full blur-3xl animate-[float_9s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-[fadeInUp_0.5s_ease-out]">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🍽️</span>
            <span className="text-3xl font-black font-display text-gradient">Linkisy</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900 font-display">
            {isBusiness ? '파트너 합류하기' : '미식 탐험 시작하기'}
          </h1>
          <p className="mt-2 text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-bold hover:underline transition-all">
              로그인
            </Link>
          </p>
        </div>

        {/* Type Selector */}
        <div className="glass p-1.5 rounded-2xl flex gap-1 mb-8 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards] opacity-0 translate-y-4">
          <Link
            href="/register"
            className={`flex-1 py-3 text-center rounded-xl font-bold transition-all duration-300 ${!isBusiness
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
              }`}
          >
            일반 회원
          </Link>
          <Link
            href="/register?role=business"
            className={`flex-1 py-3 text-center rounded-xl font-bold transition-all duration-300 ${isBusiness
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
              }`}
          >
            사업자 회원
          </Link>
        </div>

        {/* Register Form */}
        <div className="glass-card rounded-3xl p-8 animate-[fadeInUp_0.7s_ease-out_0.2s_forwards] opacity-0 translate-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              leftIcon={<Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
              error={errors.email?.message}
              {...register('email')}
              className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
            />

            <div className="relative">
              <Input
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                placeholder="8자 이상, 영문+숫자"
                leftIcon={<Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
                error={errors.password?.message}
                {...register('password')}
                className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-orange-500 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="비밀번호 확인"
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력하세요"
                leftIcon={<Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
                error={errors.passwordConfirm?.message}
                {...register('passwordConfirm')}
                className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-orange-500 transition-colors"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                {showPasswordConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              leftIcon={<User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
              error={errors.name?.message}
              {...register('name')}
              className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
            />

            <Input
              label="닉네임"
              type="text"
              placeholder="Linkisy에서 사용할 닉네임"
              leftIcon={<User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
              error={errors.nickname?.message}
              {...register('nickname')}
              className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
            />

            <Input
              label="전화번호"
              type="tel"
              placeholder="010-1234-5678"
              leftIcon={<Phone className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
              error={errors.phone?.message}
              {...register('phone')}
              className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
            />

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">주소</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="우편번호"
                    leftIcon={<MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
                    error={errors.zipcode?.message}
                    {...register('zipcode')}
                    className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
                    readOnly
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="mb-0 h-[46px] shrink-0"
                  variant="outline"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Input
                placeholder="기본 주소"
                error={errors.address?.message}
                {...register('address')}
                className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
                readOnly
              />
              <Input
                placeholder="상세 주소"
                error={errors.addressDetail?.message}
                {...register('addressDetail')}
                className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
              />
            </div>

            {isBusiness && (
              <Input
                label="사업자등록번호"
                type="text"
                placeholder="123-45-67890"
                leftIcon={<Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />}
                error={errors.businessNumber?.message}
                {...register('businessNumber')}
                className="bg-white/50 focus:bg-white transition-all border-gray-200 focus:border-orange-500 rounded-xl"
              />
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300"
                size="lg"
                isLoading={isLoading}
              >
                가입하기
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              가입 시{' '}
              <a href="#" className="font-bold text-orange-500 hover:text-orange-600 hover:underline">이용약관</a>
              {' '}및{' '}
              <a href="#" className="font-bold text-orange-500 hover:text-orange-600 hover:underline">개인정보처리방침</a>
              에 동의합니다.
            </p>
          </form>
        </div>
      </div>

      {/* Address Search Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">주소 검색</h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[400px]">
              <DaumPostcodeEmbed
                onComplete={handleComplete}
                autoClose
                style={{ height: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RegisterPageContent />
    </Suspense>
  );
}

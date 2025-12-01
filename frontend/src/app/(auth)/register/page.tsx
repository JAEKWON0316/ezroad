'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
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
  businessNumber: z.string().optional(),
  address: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🍽️</span>
            <span className="text-2xl font-bold text-gray-900">EzenRoad</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            {isBusiness ? '사업자 회원가입' : '회원가입'}
          </h1>
          <p className="mt-2 text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
              로그인
            </Link>
          </p>
        </div>

        {/* Type Selector */}
        <div className="flex gap-2 mb-6">
          <Link
            href="/register"
            className={`flex-1 py-3 text-center rounded-lg font-medium transition-colors ${
              !isBusiness
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            일반 회원
          </Link>
          <Link
            href="/register?role=business"
            className={`flex-1 py-3 text-center rounded-lg font-medium transition-colors ${
              isBusiness
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            사업자 회원
          </Link>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                placeholder="8자 이상, 영문+숫자"
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
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
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                error={errors.passwordConfirm?.message}
                {...register('passwordConfirm')}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                {showPasswordConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="닉네임"
              type="text"
              placeholder="EzenRoad에서 사용할 닉네임"
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              error={errors.nickname?.message}
              {...register('nickname')}
            />

            <Input
              label="전화번호"
              type="tel"
              placeholder="010-1234-5678"
              leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            {isBusiness && (
              <>
                <Input
                  label="사업자등록번호"
                  type="text"
                  placeholder="123-45-67890"
                  leftIcon={<Building2 className="h-5 w-5 text-gray-400" />}
                  error={errors.businessNumber?.message}
                  {...register('businessNumber')}
                />
                
                <Input
                  label="사업장 주소"
                  type="text"
                  placeholder="사업장 주소를 입력하세요"
                  leftIcon={<MapPin className="h-5 w-5 text-gray-400" />}
                  error={errors.address?.message}
                  {...register('address')}
                />
              </>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                가입하기
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              가입 시{' '}
              <a href="#" className="text-orange-500 hover:underline">이용약관</a>
              {' '}및{' '}
              <a href="#" className="text-orange-500 hover:underline">개인정보처리방침</a>
              에 동의합니다.
            </p>
          </form>
        </div>
      </div>
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

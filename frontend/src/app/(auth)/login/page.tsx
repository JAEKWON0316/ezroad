'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('로그인 성공!');
      router.push('/');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🍽️</span>
            <span className="text-2xl font-bold text-gray-900">EzenRoad</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">로그인</h1>
          <p className="mt-2 text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/register" className="text-orange-500 hover:text-orange-600 font-medium">
              회원가입
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                placeholder="비밀번호를 입력하세요"
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

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              로그인
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">또는</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => toast('소셜 로그인은 준비 중입니다')}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#FEE500"
                  d="M12 3c5.8 0 10.5 3.7 10.5 8.3 0 4.6-4.7 8.3-10.5 8.3-.6 0-1.2 0-1.8-.1L6.4 22l.8-3.3c-2.7-1.5-4.7-4.2-4.7-7.3C2.5 6.7 7.2 3 12 3z"
                />
                <path
                  fill="#3C1E1E"
                  d="M8.8 11.5c0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4c-.8 0-1.4-.6-1.4-1.4zm5.6 0c0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4c-.8 0-1.4-.6-1.4-1.4z"
                />
              </svg>
              <span className="font-medium">카카오로 로그인</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#03C75A] text-white rounded-lg hover:bg-[#02b351] transition-colors"
              onClick={() => toast('소셜 로그인은 준비 중입니다')}
            >
              <span className="font-bold text-lg">N</span>
              <span className="font-medium">네이버로 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

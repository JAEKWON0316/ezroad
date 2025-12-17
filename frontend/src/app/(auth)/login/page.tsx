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
  rememberMe: z.boolean().optional(),
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
      await login(data, data.rememberMe);
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100 via-orange-50 to-white">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-orange-300/20 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-[fadeInUp_0.5s_ease-out]">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🍽️</span>
            <span className="text-3xl font-black font-display text-gradient">Linkisy</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900 font-display">환영합니다!</h1>
          <p className="mt-2 text-gray-600">
            아직 계정이 없으신가요?{' '}
            <Link href="/register" className="text-orange-500 hover:text-orange-600 font-bold hover:underline transition-all">
              회원가입
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-3xl p-8 animate-[fadeInUp_0.7s_ease-out_0.1s_forwards] opacity-0 translate-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                placeholder="비밀번호를 입력하세요"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 transition-colors"
                  {...register('rememberMe')}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">로그인 유지</span>
              </label>

              <Link href="/find-password" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                비밀번호 찾기
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300"
              size="lg"
              isLoading={isLoading}
            >
              로그인
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/80 backdrop-blur px-4 text-gray-500 rounded-full">간편 로그인</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] rounded-xl hover:-translate-y-0.5 transition-all shadow-sm font-medium"
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth2/kakao`;
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 3c5.8 0 10.5 3.7 10.5 8.3 0 4.6-4.7 8.3-10.5 8.3-.6 0-1.2 0-1.8-.1L6.4 22l.8-3.3c-2.7-1.5-4.7-4.2-4.7-7.3C2.5 6.7 7.2 3 12 3z"
                />
              </svg>
              카카오로 로그인
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#03C75A] hover:bg-[#02b351] text-white rounded-xl hover:-translate-y-0.5 transition-all shadow-sm font-medium"
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth2/naver`;
              }}
            >
              <span className="font-extrabold text-lg leading-none">N</span>
              네이버로 로그인
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl hover:-translate-y-0.5 transition-all shadow-sm font-medium"
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth2/google`;
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              구글로 로그인
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-gray-500 animate-[fadeInUp_0.9s_ease-out_0.3s_forwards] opacity-0 translate-y-4">
          © 2025 Linkisy. All rights reserved.
        </p>
      </div >
    </div >
  );
}

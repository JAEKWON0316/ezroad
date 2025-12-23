'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api';
import Button from '@/components/common/Button';

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
        confirmPassword: z.string().min(6, '비밀번호 확인을 입력해주세요.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: '비밀번호가 일치하지 않습니다.',
        path: ['confirmPassword'],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (!token) {
            toast.error('유효하지 않은 접근입니다.');
            router.push('/login');
        }
    }, [token, router]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return;

        setIsLoading(true);
        try {
            await authApi.resetPassword(token, data.password);
            setIsSuccess(true);
            toast.success('비밀번호가 성공적으로 변경되었습니다.');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white py-10 px-6 shadow-2xl rounded-3xl sm:px-12 border border-gray-100 backdrop-blur-sm"
                >
                    <div className="mb-8 text-center sm:text-left">
                        {!isSuccess && (
                            <>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                                    새 비밀번호 설정
                                </h2>
                                <p className="text-gray-500 font-medium text-sm">
                                    계정 보안을 위해 새로운 비밀번호를 입력해주세요.
                                </p>
                            </>
                        )}
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                    새 비밀번호
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        {...register('password')}
                                        type="password"
                                        placeholder="••••••••"
                                        className={`block w-full pl-11 pr-4 h-14 bg-gray-50 border-2 rounded-2xl text-gray-900 font-bold placeholder-gray-300 transition-all focus:bg-white focus:ring-0 ${errors.password ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-orange-500'
                                            }`}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-xs font-bold text-red-500 ml-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                    비밀번호 확인
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <input
                                        {...register('confirmPassword')}
                                        type="password"
                                        placeholder="••••••••"
                                        className={`block w-full pl-11 pr-4 h-14 bg-gray-50 border-2 rounded-2xl text-gray-900 font-bold placeholder-gray-300 transition-all focus:bg-white focus:ring-0 ${errors.confirmPassword ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-orange-500'
                                            }`}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-xs font-bold text-red-500 ml-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                className="h-14 rounded-2xl font-black text-lg shadow-lg shadow-orange-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        변경 중...
                                    </div>
                                ) : (
                                    '비밀번호 변경하기'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6 text-green-500">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">변경 완료!</h3>
                            <p className="text-gray-500 font-medium mb-8">
                                비밀번호가 성공적으로 변경되었습니다.<br />
                                잠시 후 로그인 페이지로 이동합니다.
                            </p>
                            <Link href="/login" className="text-orange-500 font-black hover:underline">
                                지금 바로 로그인하기
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

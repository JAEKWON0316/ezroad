'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api';
import Button from '@/components/common/Button';

const findPasswordSchema = z.object({
    email: z.string().email('유효한 이메일을 입력해주세요.'),
});

type FindPasswordFormData = z.infer<typeof findPasswordSchema>;

export default function FindPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FindPasswordFormData>({
        resolver: zodResolver(findPasswordSchema),
    });

    const onSubmit = async (data: FindPasswordFormData) => {
        setIsLoading(true);
        try {
            await authApi.findPassword(data.email);
            setIsSubmitted(true);
            toast.success('이메일이 발송되었습니다.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || '이메일 발송에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <div className="mb-8">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-orange-500 transition-colors mb-6 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            로그인으로 돌아가기
                        </Link>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                            비밀번호 찾기
                        </h2>
                        <p className="text-gray-500 font-medium">
                            가입하신 이메일 주소를 입력하시면<br />
                            비밀번호 재설정 링크를 보내드립니다.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <div>
                                    <label htmlFor="email" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                        이메일 주소
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            placeholder="example@email.com"
                                            className={`block w-full pl-11 pr-4 h-14 bg-gray-50 border-2 rounded-2xl text-gray-900 font-bold placeholder-gray-300 transition-all focus:bg-white focus:ring-0 ${errors.email ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-orange-500'
                                                }`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-2 text-xs font-bold text-red-500 ml-1">
                                            {errors.email.message}
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
                                            발송 중...
                                        </div>
                                    ) : (
                                        '재설정 링크 발송'
                                    )}
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6 text-green-500">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">발송 완료!</h3>
                                <p className="text-gray-500 font-medium mb-8">
                                    이메일로 재설정 링크가 발송되었습니다.<br />
                                    메일함을 확인해주세요.
                                </p>
                                <div className="text-sm text-gray-400 bg-gray-50 p-4 rounded-2xl italic">
                                    * 현재 테스트 모드로, 서버 콘솔에서 링크를 확인할 수 있습니다.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

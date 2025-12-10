'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      toast.error(decodeURIComponent(error));
      router.replace('/login');
      return;
    }

    if (accessToken && refreshToken) {
      // 토큰 저장 및 로그인 처리
      setTokens(accessToken, refreshToken);
      toast.success('소셜 로그인 성공!');
      router.replace('/');
    } else {
      toast.error('로그인 처리 중 오류가 발생했습니다');
      router.replace('/login');
    }
  }, [searchParams, router, setTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}

'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/common/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'USER' | 'BUSINESS' | 'ADMIN';
  fallbackUrl?: string;
}

/**
 * 인증이 필요한 페이지를 감싸는 컴포넌트
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackUrl = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    router.push(fallbackUrl);
    return null;
  }

  // 역할 확인
  if (requiredRole && user?.role !== requiredRole) {
    // ADMIN은 모든 페이지 접근 가능
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return null;
    }
  }

  return <>{children}</>;
}

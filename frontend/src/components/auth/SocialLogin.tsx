'use client';

import toast from 'react-hot-toast';

interface SocialLoginProps {
  onLogin?: (provider: 'kakao' | 'naver' | 'google') => void;
}

/**
 * 소셜 로그인 버튼 컴포넌트
 */
export default function SocialLogin({ onLogin }: SocialLoginProps) {
  const handleSocialLogin = (provider: 'kakao' | 'naver' | 'google') => {
    if (onLogin) {
      onLogin(provider);
    } else {
      // 준비 중 메시지
      toast('소셜 로그인은 준비 중입니다', { icon: '🚧' });
    }
  };

  return (
    <div className="space-y-3">
      {/* 카카오 */}
      <button
        type="button"
        onClick={() => handleSocialLogin('kakao')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] text-[#191919] rounded-lg hover:bg-[#F5DC00] transition-colors font-medium"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 3c5.8 0 10.5 3.7 10.5 8.3 0 4.6-4.7 8.3-10.5 8.3-.6 0-1.2 0-1.8-.1L6.4 22l.8-3.3c-2.7-1.5-4.7-4.2-4.7-7.3C2.5 6.7 7.2 3 12 3z"
          />
        </svg>
        카카오로 시작하기
      </button>

      {/* 네이버 */}
      <button
        type="button"
        onClick={() => handleSocialLogin('naver')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#03C75A] text-white rounded-lg hover:bg-[#02b351] transition-colors font-medium"
      >
        <span className="font-bold text-lg">N</span>
        네이버로 시작하기
      </button>

      {/* 구글 */}
      <button
        type="button"
        onClick={() => handleSocialLogin('google')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google로 시작하기
      </button>
    </div>
  );
}

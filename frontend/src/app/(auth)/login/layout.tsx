import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인',
  description: 'EzenRoad에 로그인하세요. 카카오, 네이버, 구글 소셜 로그인도 지원합니다.',
  openGraph: {
    title: '로그인 | EzenRoad',
    description: 'EzenRoad에 로그인하세요.',
    url: '/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

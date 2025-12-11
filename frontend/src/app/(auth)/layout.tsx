import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인',
  description: 'EzenRoad에 로그인하세요. 맛집 예약, 리뷰 작성, 테마 만들기 등 다양한 기능을 이용할 수 있습니다.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

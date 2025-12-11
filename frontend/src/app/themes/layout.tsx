import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '맛집 테마',
  description: '사용자들이 직접 만든 맛집 코스를 탐색하세요. 데이트 코스, 가족 외식, 친구 모임 등 다양한 테마를 확인하세요.',
  openGraph: {
    title: '맛집 테마 | EzenRoad',
    description: '사용자들이 직접 만든 맛집 코스를 탐색하세요. 데이트 코스, 가족 외식, 친구 모임 등 다양한 테마를 확인하세요.',
  },
};

export default function ThemesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '지도',
  description: '지도에서 주변 맛집을 찾아보세요. 테마별 맛집 코스를 지도에서 확인하고 경로를 탐색하세요.',
  openGraph: {
    title: '맛집 지도 | EzenRoad',
    description: '지도에서 주변 맛집을 찾아보세요. 테마별 맛집 코스를 지도에서 확인하고 경로를 탐색하세요.',
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

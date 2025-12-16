import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '맛집 목록',
  description: '다양한 맛집을 검색하고 발견하세요. 카테고리별, 지역별로 원하는 맛집을 찾아보세요.',
  openGraph: {
    title: '맛집 목록 | Linkisy',
    description: '다양한 맛집을 검색하고 발견하세요. 카테고리별, 지역별로 원하는 맛집을 찾아보세요.',
  },
};

export default function RestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '리뷰',
  description: '실제 방문자들의 솔직한 맛집 리뷰를 확인하세요. 별점과 사진으로 맛집을 미리 만나보세요.',
  openGraph: {
    title: '맛집 리뷰 | Linkisy',
    description: '실제 방문자들의 솔직한 맛집 리뷰를 확인하세요. 별점과 사진으로 맛집을 미리 만나보세요.',
  },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

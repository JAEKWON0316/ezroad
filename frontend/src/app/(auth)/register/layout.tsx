import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입',
  description: 'EzenRoad 회원이 되어보세요. 일반 회원과 사업자 회원으로 가입할 수 있습니다.',
  openGraph: {
    title: '회원가입 | EzenRoad',
    description: 'EzenRoad 회원이 되어보세요.',
    url: '/register',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

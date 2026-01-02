import { Noto_Sans_KR, Montserrat } from 'next/font/google';
import './globals.css';
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper';
import Providers from './providers';
import { ChatWidget } from '@/components/chat';
import type { Metadata } from 'next';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  weight: ['300', '400', '500', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ezroad.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Linkisy - 맛집 탐색 및 예약 플랫폼',
    template: '%s | Linkisy',
  },
  description: 'Linkisy와 함께 숨겨진 맛집을 발견하고, 소중한 사람들과 특별한 식사를 즐겨보세요. 맛집 검색, 예약, 리뷰, 테마 코스까지 한 번에!',
  keywords: ['맛집', '맛집 추천', '맛집 예약', '식당 예약', '맛집 리뷰', '맛집 테마', '맛집 코스', 'Linkisy'],
  authors: [{ name: 'Linkisy Team' }],
  creator: 'Linkisy',
  publisher: 'Linkisy',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon-32x32.png', color: '#f97316' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: 'Linkisy',
    title: 'Linkisy - 맛집 탐색 및 예약 플랫폼',
    description: 'Linkisy와 함께 숨겨진 맛집을 발견하고, 소중한 사람들과 특별한 식사를 즐겨보세요.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Linkisy - 맛집 탐색 및 예약 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linkisy - 맛집 탐색 및 예약 플랫폼',
    description: 'Linkisy와 함께 숨겨진 맛집을 발견하고, 소중한 사람들과 특별한 식사를 즐겨보세요.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Google Search Console 인증 시 추가
    // google: 'your-google-verification-code',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${notoSansKR.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <Providers>
          <MainLayoutWrapper>
            {children}
          </MainLayoutWrapper>
          {/* 전역 챗봇 위젯 */}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}

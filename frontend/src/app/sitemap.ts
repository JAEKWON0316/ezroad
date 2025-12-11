import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ezroad.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/restaurants`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/themes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 동적 페이지들 (식당, 테마 등)은 API에서 가져올 수 있지만,
  // 빌드 시간 문제로 정적 페이지만 포함
  // 추후 API 연동 시 아래 주석 해제
  
  /*
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // 식당 목록 가져오기
    const restaurantsRes = await fetch(`${apiUrl}/api/restaurants?size=100`);
    const restaurantsData = await restaurantsRes.json();
    
    const restaurantPages: MetadataRoute.Sitemap = restaurantsData.content.map((restaurant: { id: number; updatedAt?: string }) => ({
      url: `${siteUrl}/restaurants/${restaurant.id}`,
      lastModified: restaurant.updatedAt ? new Date(restaurant.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // 테마 목록 가져오기
    const themesRes = await fetch(`${apiUrl}/api/themes?size=100`);
    const themesData = await themesRes.json();
    
    const themePages: MetadataRoute.Sitemap = themesData.content.map((theme: { id: number; updatedAt?: string }) => ({
      url: `${siteUrl}/themes/${theme.id}`,
      lastModified: theme.updatedAt ? new Date(theme.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...restaurantPages, ...themePages];
  } catch (error) {
    console.error('Failed to fetch dynamic pages for sitemap:', error);
    return staticPages;
  }
  */

  return staticPages;
}

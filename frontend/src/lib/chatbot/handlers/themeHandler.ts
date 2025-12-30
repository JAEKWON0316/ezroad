import { ActionButton } from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.106.186.205:8080/api';

interface ThemeData {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  likeCount: number;
  viewCount: number;
  restaurantCount?: number;
  member?: {
    nickname: string;
  };
}

interface ThemeHandlerResult {
  message: string;
  themes: ThemeData[];
  actions: ActionButton[];
}

export async function handleRecommendTheme(): Promise<ThemeHandlerResult> {
  try {
    // 인기 테마 목록 가져오기
    const response = await fetch(`${API_URL}/themes?page=0&size=5&sort=likeCount,desc`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch themes');
    }

    const data = await response.json();
    const themes: ThemeData[] = data.content || data || [];

    if (themes.length === 0) {
      return {
        message: '아직 등록된 테마가 없어요 😢\n직접 테마를 만들어보는 건 어떨까요?',
        themes: [],
        actions: [
          { type: 'link', label: '테마 만들기', url: '/themes/new', variant: 'primary' },
          { type: 'link', label: '전체 맛집 보기', url: '/restaurants', variant: 'secondary' },
        ],
      };
    }

    // 응답 메시지 생성 (테마명에 링크 포함)
    const message = `🎯 인기 테마 TOP ${themes.length}을 소개해드릴게요!\n\n` +
      themes.map((theme, i) => 
        `${i + 1}️⃣ **[${theme.title}](/themes/${theme.id})**\n` +
        `   ${theme.description ? theme.description.slice(0, 30) + (theme.description.length > 30 ? '...' : '') : ''}\n` +
        `   ❤️ ${theme.likeCount} · 👀 ${theme.viewCount}` +
        (theme.member ? ` · by ${theme.member.nickname}` : '')
      ).join('\n\n') +
      '\n\n테마 이름을 클릭하면 상세 정보를 볼 수 있어요! 😊';

    return {
      message,
      themes,
      actions: [
        { type: 'link', label: '더 많은 테마 보기', url: '/themes', variant: 'secondary' },
      ],
    };
  } catch (error) {
    console.error('Theme recommendation error:', error);
    return {
      message: '테마를 불러오는 중 오류가 발생했어요 😅\n잠시 후 다시 시도해주세요!',
      themes: [],
      actions: [],
    };
  }
}

export default handleRecommendTheme;

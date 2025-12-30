import { ChatCompletionTool } from 'openai/resources/chat/completions';

// GPT-4o-mini Function Calling Tools 정의
export const chatTools: ChatCompletionTool[] = [
  // 1. 코스/루트 추천
  {
    type: 'function',
    function: {
      name: 'recommend_course',
      description: '사용자가 가는 지역에 대한 맛집 코스/루트를 추천합니다. 데이트, 친구 모임, 가족 식사 등 상황에 맞는 코스를 생성합니다. "코스 추천", "루트 추천", "데이트 코스", "맛집 코스", "테마 추천" 등의 요청에 사용합니다.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: '사용자가 가는 지역 (예: 강남역, 홍대, 이태원, 명동)',
          },
          situation: {
            type: 'string',
            enum: ['date', 'friends', 'family', 'solo', 'business'],
            description: '상황/목적 (date: 데이트, friends: 친구, family: 가족, solo: 혼자, business: 비즈니스)',
          },
          meal_types: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['lunch', 'cafe', 'dinner', 'bar'],
            },
            description: '원하는 코스 구성 (lunch: 점심, cafe: 카페, dinner: 저녁, bar: 술집)',
          },
          preferences: {
            type: 'array',
            items: { type: 'string' },
            description: '추가 선호사항 (고급스러운, 캐주얼, 분위기 좋은 등)',
          },
        },
        required: ['location'],
      },
    },
  },

  // 2. 단일 가게 추천
  {
    type: 'function',
    function: {
      name: 'recommend_restaurant',
      description: '사용자가 원하는 조건에 맞는 단일 맛집을 추천합니다. "맛집 추천", "가게 추천", "어디 좋아?", "뭐 먹지?" 등의 요청에 사용합니다.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: '지역 (예: 강남, 홍대, 명동, 이태원)',
          },
          category: {
            type: 'string',
            description: '음식 카테고리 (한식, 양식, 일식, 중식, 카페, 분식 등)',
          },
          mood: {
            type: 'string',
            description: '분위기 (조용한, 활기찬, 로맨틱, 캐주얼, 고급스러운 등)',
          },
          price_range: {
            type: 'string',
            enum: ['cheap', 'moderate', 'expensive'],
            description: '가격대 (cheap: 저렴, moderate: 보통, expensive: 비쌈)',
          },
        },
        required: ['location'],
      },
    },
  },

  // 3. 예약 상태 조회
  {
    type: 'function',
    function: {
      name: 'get_reservation_status',
      description: '사용자의 현재 예약 상태를 조회합니다. "내 예약", "예약 상태", "예약 확인", "예약 어떻게 됐어?" 등의 질문에 사용합니다.',
      parameters: {
        type: 'object',
        properties: {
          include_past: {
            type: 'boolean',
            description: '과거 예약도 포함할지 여부 (기본값: false)',
          },
        },
      },
    },
  },

  // 4. 대기 상태 조회
  {
    type: 'function',
    function: {
      name: 'get_waiting_status',
      description: '사용자의 현재 대기 상태를 조회합니다. "대기 순번", "몇 번째", "대기 상태", "언제 들어가?" 등의 질문에 사용합니다.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },

  // 5. 예약 액션 연결 (페이지 이동)
  {
    type: 'function',
    function: {
      name: 'navigate_to_reservation',
      description: '사용자를 예약 관련 페이지로 안내합니다. "예약하고 싶어", "예약할래", "예약 취소", "예약 변경" 등의 요청에 사용합니다.',
      parameters: {
        type: 'object',
        properties: {
          restaurant_id: {
            type: 'number',
            description: '예약할 식당 ID (이전에 추천한 식당이 있는 경우)',
          },
          restaurant_name: {
            type: 'string',
            description: '식당 이름 (참고용)',
          },
          action: {
            type: 'string',
            enum: ['create', 'cancel', 'modify'],
            description: '예약 액션 종류 (create: 새 예약, cancel: 취소, modify: 변경)',
          },
        },
        required: ['action'],
      },
    },
  },
];

export default chatTools;

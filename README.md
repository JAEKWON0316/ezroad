# 🍽️ Linkisy - 지역 맛집 플랫폼

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai" alt="OpenAI"/>
</p>

<p align="center">
  <b>🔗 라이브 서비스: <a href="https://linkisy.kr">https://linkisy.kr</a></b>
</p>

Spring Boot + Next.js 기반의 현대적인 맛집 검색, 예약, 웨이팅 플랫폼입니다.

---

## 📸 스크린샷

| 메인 페이지 | 식당 상세 | 파트너 대시보드 |
|:---:|:---:|:---:|
| 인기 테마, 검색 | 메뉴, 리뷰, 예약 | 실시간 대기 관리 |

---

## 🎯 프로젝트 개요

기존 Spring MVC + JSP + MySQL 기반의 EZroad를 **현대적인 기술 스택으로 리빌딩**한 프로젝트입니다.

### ✨ 주요 특징

- 🗺️ **31만+ 전국 맛집 데이터** - 공공데이터 기반
- ⚡ **실시간 웨이팅** - WebSocket + Redis 기반 실시간 대기열
- 🔔 **실시간 알림** - 예약/웨이팅 상태 변경 즉시 알림
- 🔐 **소셜 로그인** - 카카오, 네이버, 구글 지원
- 📱 **반응형 디자인** - 모바일/태블릿/데스크톱 최적화

---

## 🛠️ 기술 스택

### Frontend
| 기술 | 버전 | 설명 |
|------|------|------|
| Next.js | 15.x | App Router, SSR/SSG |
| TypeScript | 5.x | 타입 안정성 |
| Tailwind CSS | 3.x | 유틸리티 CSS |
| SockJS + STOMP | - | WebSocket 클라이언트 |

### Backend
| 기술 | 버전 | 설명 |
|------|------|------|
| Spring Boot | 3.2.0 | REST API |
| Java | 17 | LTS 버전 |
| Spring Security | 6.x | JWT 인증 |
| Spring WebSocket | - | STOMP 프로토콜 |
| JPA (Hibernate) | - | ORM |

### Database & Cache
| 기술 | 설명 |
|------|------|
| PostgreSQL (Supabase) | 메인 DB (서울 리전) |
| Redis | 실시간 대기열 캐시 |

### Infrastructure
| 서비스 | 용도 |
|--------|------|
| AWS EC2 (Seoul) | 백엔드 서버 |
| AWS S3 + CloudFront | 이미지 저장소/CDN |
| Vercel | 프론트엔드 배포 |
| Docker | 컨테이너화 |
| GitHub Actions | CI/CD |
| Nginx | 리버스 프록시, SSL |

---

## 🧪 테스트 계정

> 서비스를 체험해보고 싶은 분들을 위한 **공용 테스트 계정**입니다.

### 👤 일반 사용자

| 항목 | 값 |
|------|-----|
| **이메일** | `demo@linkisy.com` |
| **비밀번호** | `test1234` |

**테스트 가능 기능:**
- ✅ 식당 검색 및 상세 보기
- ✅ 식당 찜하기 (팔로우)
- ✅ 예약 / 웨이팅 신청
- ✅ 리뷰 작성 (완료된 예약 기반)
- ✅ 맛집 테마 생성
- ✅ 지도에서 주변 맛집 찾기
- ✅ 실시간 알림 수신

### 🏪 사업자 (파트너)

| 항목 | 값 |
|------|-----|
| **이메일** | `business@linkisy.com` |
| **비밀번호** | `test1234` |

**등록된 테스트 식당:** 테스트 맛집 (한식, 강남구)

**테스트 가능 기능:**
- ✅ 파트너 대시보드 (통계)
- ✅ 식당/메뉴 관리
- ✅ 예약 확정/취소/완료 처리
- ✅ 웨이팅 호출/착석 처리
- ✅ 실시간 대기 인원 확인

### ⚠️ 주의사항

- 테스트 계정은 **공용**입니다 (다른 사용자와 함께 사용)
- 민감한 개인정보를 입력하지 마세요
- 데이터는 주기적으로 초기화될 수 있습니다

---

## 🎨 주요 기능

### 사용자 기능
| 기능 | 설명 |
|------|------|
| 🔐 회원가입/로그인 | 이메일, 카카오, 네이버, 구글 |
| 🔍 식당 검색 | 키워드, 카테고리, 위치 기반 |
| 🗺️ 지도 | 현재 위치 기반 주변 맛집 |
| 📅 예약 | 날짜/시간/인원 선택 |
| ⏳ 웨이팅 | 실시간 대기열, 순번 알림 |
| ⭐ 리뷰 | 방문 완료 후 별점/사진 리뷰 |
| ❤️ 찜하기 | 관심 식당 저장 |
| 📋 테마 | 나만의 맛집 코스 생성 |
| 🔔 알림 | 실시간 푸시 알림 |

### 사업자 기능
| 기능 | 설명 |
|------|------|
| 📊 대시보드 | 예약/리뷰/팔로워 통계 |
| 🏪 식당 관리 | 정보, 영업시간, 공지 수정 |
| 🍜 메뉴 관리 | 메뉴 CRUD, 이미지 업로드 |
| 📅 예약 관리 | 예약 확정/취소/완료 |
| ⏳ 웨이팅 관리 | 대기 호출/착석/노쇼 처리 |
| 🔔 알림 | 실시간 푸시 알림 |

### 관리자 기능
| 기능 | 설명 |
|------|------|
| 👥 회원 관리 | 역할 변경, 계정 관리 |
| 🏪 식당 관리 | 상태 변경, 삭제 |
| 📝 리뷰 관리 | 신고된 리뷰 처리 |
| 🚨 신고 관리 | 신고 접수/처리 |

---

## 🤖 AI 챗봇 시스템

실시간 맛집 추천과 예약 조회를 지원하는 **GPT-4o-mini 기반 AI 챗봇**입니다.

### 📋 핵심 기능

| 기능 | 설명 |
|------|------|
| 💬 맛집 추천 | 지역/분위기/음식 종류 기반 맛집 추천 |
| 🗺️ 코스 추천 | 데이트, 회식 등 상황별 맛집 코스 생성 |
| 📅 예약 조회 | 내 예약/웨이팅 내역 실시간 확인 |
| 🔍 식당 검색 | 자연어로 식당 정보 검색 |

### 🏗️ 아키텍처

```
사용자 질문
    ↓
┌─────────────────────────────────────┐
│          Next.js API Route          │
│       /api/chat/route.ts            │
├─────────────────────────────────────┤
│  1. 시스템 프롬프트 구성              │
│     └─ Supabase에서 가게 목록 로드    │
│  2. Vector 유사도 검색 (Optional)    │
│     └─ pgvector로 관련 식당 검색     │
│  3. OpenAI GPT-4o-mini 호출         │
│     └─ Function Calling 지원        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│        Function Handlers            │
├─────────────────────────────────────┤
│  🍽️ recommend_restaurants          │
│     → 조건 기반 맛집 추천            │
│  🗺️ recommend_course               │
│     → 지역별 맛집 코스 생성          │
│  📅 get_my_reservations            │
│     → 예약 내역 조회                │
│  ⏳ get_my_waitings                │
│     → 웨이팅 내역 조회              │
│  🔍 search_restaurants             │
│     → 식당 상세 검색                │
└─────────────────────────────────────┘
```

### 🔧 기술 스택

| 기술 | 용도 |
|------|------|
| **OpenAI GPT-4o-mini** | 자연어 이해 및 응답 생성 |
| **Function Calling** | 구조화된 API 호출 |
| **pgvector** | Vector 유사도 검색 (PostgreSQL 확장) |
| **Supabase** | 실시간 데이터 조회 |
| **Kakao Local API** | 지역 좌표 → 주소 변환 |

### 💬 사용 예시

```
👤 "강남역 근처 분위기 좋은 이탈리안 추천해줘"
🤖 "강남역 주변 이탈리안 맛집을 추천해드릴게요!
    1. 파스타 팩토리 - 수제 파스타 전문점
    2. 트라토리아 - 정통 이탈리안 레스토랑
    ..."

👤 "내 예약 내역 알려줘"  
🤖 "현재 예약 내역이에요:
    📅 맛있는 한식당 - 12/31 18:00 (4명)
    상태: 확정됨"

👤 "홍대에서 데이트 코스 짜줘"
🤖 "홍대 데이트 코스를 추천해드릴게요!
    1️⃣ 카페라떼 (카페) - 분위기 좋은 루프탑
    2️⃣ 스시오마카세 (일식) - 프라이빗 룸
    3️⃣ 와인바 홍대 (바) - 야경 맛집"
```

### 📁 관련 파일

```
frontend/src/
├── app/api/chat/
│   ├── route.ts              # 메인 API (GPT 호출)
│   └── sync-embeddings/      # 임베딩 동기화 API
├── lib/chatbot/
│   ├── systemPrompt.ts       # 시스템 프롬프트 빌더
│   ├── functions.ts          # Function 스키마 정의
│   ├── handlers.ts           # Function 실행 핸들러
│   └── vectordb.ts           # Vector DB (pgvector)
└── components/chat/
    ├── ChatWidget.tsx        # 플로팅 버튼
    ├── ChatModal.tsx         # 채팅 UI
    └── ChatMessages.tsx      # 메시지 렌더링
```

---

## 📦 프로젝트 구조

```
linkisy/
├── frontend/                # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/            # App Router 페이지
│   │   ├── components/     # React 컴포넌트
│   │   ├── context/        # React Context (Auth, Notification)
│   │   ├── hooks/          # Custom Hooks (useWebSocket 등)
│   │   ├── lib/            # API 클라이언트, 유틸리티
│   │   └── types/          # TypeScript 타입
│   └── public/             # 정적 파일
│
├── backend/                 # Spring Boot 백엔드
│   └── src/main/java/com/ezroad/
│       ├── config/         # 설정 (Security, Redis, WebSocket)
│       ├── controller/     # REST API 컨트롤러
│       ├── service/        # 비즈니스 로직
│       ├── repository/     # JPA Repository
│       ├── entity/         # JPA Entity
│       └── dto/            # Request/Response DTO
│
└── .github/workflows/       # CI/CD (GitHub Actions)
```

---

## 🚀 로컬 개발 환경 설정

### 사전 요구사항

- Node.js 18+
- Java 17+
- Docker (Redis용)

### 1. 저장소 클론

```bash
git clone https://github.com/JAEKWON0316/ezroad.git
cd ezroad
```

### 2. 백엔드 설정

```bash
cd backend

# 환경 변수 파일 생성
cp .env.example .env
# .env 파일에 실제 값 입력

# Redis 실행 (Docker)
docker run -d --name redis -p 6379:6379 redis:alpine

# 실행
./gradlew bootRun
```

`.env` 필수 항목:
```env
DATABASE_URL=jdbc:postgresql://your-db-host:5432/postgres
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
JWT_SECRET=your-jwt-secret-key-min-256-bits
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. 프론트엔드 설정

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL 설정

# 실행
npm run dev
```

### 4. 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080

---

## 📝 API 엔드포인트

### 인증
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| GET | `/api/auth/oauth2/{provider}` | 소셜 로그인 |

### 식당
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/restaurants` | 목록 (검색, 필터) |
| GET | `/api/restaurants/{id}` | 상세 |
| POST | `/api/restaurants` | 등록 (사업자) |
| PUT | `/api/restaurants/{id}` | 수정 |

### 예약 / 웨이팅
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/reservations` | 예약 생성 |
| PATCH | `/api/reservations/{id}/confirm` | 예약 확정 |
| POST | `/api/waitings` | 웨이팅 등록 |
| GET | `/api/waitings/restaurant/{id}/count` | 대기 인원 |

### WebSocket
| Endpoint | 설명 |
|----------|------|
| `/ws` | WebSocket 연결 (SockJS) |
| `/user/queue/notifications` | 개인 알림 구독 |
| `/topic/restaurant/{id}/waiting-count` | 식당 대기 인원 구독 |

---

## 🔐 보안 주의사항

⚠️ **중요**: 민감 정보는 절대 Git에 커밋하지 마세요!

- `.env` 파일 → `.gitignore`에 포함
- AWS 자격 증명 → 환경 변수로 관리
- JWT Secret → 최소 256비트 키 사용

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블
| 테이블 | 설명 |
|--------|------|
| `members` | 회원 (일반/사업자/관리자) |
| `member_oauth` | 소셜 로그인 연동 |
| `restaurants` | 등록된 식당 |
| `public_restaurants` | 공공데이터 식당 (31만+) |
| `menus` | 식당 메뉴 |
| `reviews` | 리뷰 (예약 기반) |
| `reservations` | 예약 |
| `waiting` | 웨이팅 |
| `follows` | 찜하기 |
| `themes` | 맛집 테마 |
| `notifications` | 알림 |

---

## 👨‍💻 개발자

- **이재권** - Full Stack Developer
  - Backend (Spring Boot)
  - Frontend (Next.js)
  - Infrastructure (AWS, Docker)

---

## 📄 라이선스

This project is licensed under the MIT License.

---

## 💬 문의 & 기여

- 🐛 버그 리포트: [GitHub Issues](https://github.com/JAEKWON0316/ezroad/issues)
- 💡 기능 제안: [GitHub Discussions](https://github.com/JAEKWON0316/ezroad/discussions)
- 📧 이메일: diwo02@naver.com

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/JAEKWON0316">JAEKWON0316</a>
</p>

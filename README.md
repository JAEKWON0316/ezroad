# EzenRoad 🍽️

지역 맛집 검색 및 예약 플랫폼

## 📋 프로젝트 개요

EzenRoad는 사용자들이 지역 맛집을 검색하고, 리뷰를 작성하며, 예약할 수 있는 플랫폼입니다.

## 🛠️ 기술 스택

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS

### Backend
- Spring Boot 3.x
- Java 17
- JPA (Hibernate)

### Database & Infrastructure
- PostgreSQL (Neon)
- AWS S3 + CloudFront
- Vercel (Frontend)
- AWS EC2 (Backend)

## 📁 프로젝트 구조

```
ezenroad/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Spring Boot 백엔드
└── README.md
```

## 🚀 시작하기

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
./gradlew bootRun
```

## 📝 주요 기능

- 🔐 회원 시스템 (일반/사업자)
- 🍽️ 식당 검색 및 상세 정보
- 📝 리뷰 작성 및 평점
- 📅 예약 시스템
- 💝 팔로우 및 찜하기
- 🗺️ 지도 기반 검색

## 📄 라이센스

MIT License

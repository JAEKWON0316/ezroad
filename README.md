# Linkisy - 지역 맛집 플랫폼

Spring Boot + Next.js 기반의 현대적인 맛집 검색 및 예약 플랫폼

## 🎯 프로젝트 개요

기존 Spring MVC + JSP + MySQL 기반의 EZroad를 현대적인 기술 스택으로 리빌딩한 프로젝트입니다.

### 기술 스택

**Frontend**
- Next.js 15
- TypeScript
- Tailwind CSS

**Backend**
- Spring Boot 3.2.0
- Java 17
- JPA (Hibernate)
- Spring Security + JWT
- PostgreSQL (Neon)

**Infrastructure**
- AWS S3 + CloudFront (파일 저장소)
- AWS EC2 (백엔드 서버)
- Vercel (프론트엔드 배포)

---

## 📦 프로젝트 구조

```
linkisy/
├── frontend/          # Next.js 프론트엔드
└── backend/           # Spring Boot 백엔드
```

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/yourusername/ezenroad.git
cd ezenroad
```

### 2. 백엔드 설정

#### 환경 변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# backend/.env.example 참고
cp backend/.env.example backend/.env
```

`.env` 파일에 실제 값 입력:
- `DATABASE_URL`: Neon PostgreSQL 연결 URL
- `DATABASE_USERNAME`: DB 사용자명
- `DATABASE_PASSWORD`: DB 비밀번호
- `JWT_SECRET`: JWT 토큰 서명 키 (최소 256비트)
- `AWS_S3_ACCESS_KEY`: AWS Access Key
- `AWS_S3_SECRET_KEY`: AWS Secret Key
- `AWS_S3_BUCKET`: S3 버킷 이름
- `AWS_CLOUDFRONT_DOMAIN`: CloudFront 도메인

#### 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

서버는 http://localhost:8080 에서 실행됩니다.

### 3. 프론트엔드 설정

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 http://localhost:3000 에서 실행됩니다.

---

## 📝 API 문서

백엔드 API 명세는 다음 엔드포인트에서 확인할 수 있습니다:
- Swagger UI: http://localhost:8080/swagger-ui.html (예정)

### 주요 API

**인증**
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신

**회원**
- `GET /api/members/me` - 내 정보 조회
- `PUT /api/members/me` - 내 정보 수정
- `DELETE /api/members/me` - 회원 탈퇴

**식당**
- `GET /api/restaurants` - 식당 목록
- `GET /api/restaurants/{id}` - 식당 상세
- `POST /api/restaurants` - 식당 등록 (사업자)

**리뷰, 예약, 팔로우, 대기 등**
- 자세한 API 명세는 문서 참고

---

## 🔐 보안 주의사항

⚠️ **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

- `.env` 파일에 실제 민감 정보 입력
- `.env.example`은 템플릿으로 Git에 포함
- AWS 자격 증명은 주기적으로 갱신

---

## 🧪 테스트

### Postman 컬렉션

프로젝트 루트의 `postman_collection.json`을 Postman에 import하여 사용할 수 있습니다.

---

## 📂 데이터베이스

### Neon PostgreSQL

- 서버리스 PostgreSQL
- 자동 확장
- 무료 티어 사용 가능

### 테이블 구조

- `members` - 회원
- `restaurants` - 식당
- `menus` - 메뉴
- `reviews` - 리뷰
- `reservations` - 예약
- `follows` - 팔로우/찜
- `waitings` - 대기

자세한 스키마는 문서 참고.

---

## 🎨 주요 기능

- ✅ 회원 관리 (일반/사업자)
- ✅ 식당 CRUD
- ✅ 메뉴 관리
- ✅ 리뷰 시스템
- ✅ 예약 시스템
- ✅ 대기 시스템
- ✅ 팔로우/찜
- ✅ 파일 업로드 (S3)
- ✅ 지도 매핑
- 🔄 프론트엔드 (진행중)

---

## 👥 개발자

- 재권 - Backend & Frontend

---

## 📄 라이선스

This project is licensed under the MIT License.

---

## 📞 문의

프로젝트에 대한 문의사항은 이슈를 등록해주세요.

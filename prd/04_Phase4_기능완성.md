# Phase 4: 기능 완성 및 통합

**상태**: ⬜ 대기
**기간**: 3주 예상
**담당**: 재권

---

## 📋 목표

Phase 2(백엔드)와 Phase 3(프론트엔드)를 통합하고, 남은 기능을 완성하여 서비스 런칭 준비

---

## 🔍 현재 상태 분석

### Phase 2 (백엔드) - 100% 완료 ✅
- 13개 Entity, 13개 Repository
- 9개 Service, 9개 Controller
- 60+ API 엔드포인트
- JWT 인증, S3 파일 업로드

### Phase 3 (프론트엔드) - 100% 완료 ✅
- 24개 페이지
- 7개 공통 컴포넌트
- 7개 도메인 컴포넌트
- API 클라이언트, AuthContext

### 남은 작업
1. **프론트-백엔드 통합 테스트**
2. **추가 기능 개발** (테마/루트, 관리자, 파트너 통계)
3. **배포 및 운영 환경 구축**

---

## 📝 Phase 4 작업 목록

### Week 1: 통합 및 버그 수정

#### 1-1. 백엔드 API 수정/보완
- ⬜ 팔로워/팔로잉 API 엔드포인트 추가
  - GET /api/follows/my/followers
  - GET /api/follows/my/following
  - DELETE /api/follows/followers/{id}
- ⬜ 리뷰 상세 조회 시 이미지 URL 배열 반환
- ⬜ 예약/대기 생성 시 식당 정보 함께 반환

#### 1-2. 프론트-백엔드 통합 테스트
- ⬜ 인증 플로우 테스트 (로그인/회원가입/로그아웃)
- ⬜ 식당 CRUD 테스트
- ⬜ 메뉴 CRUD 테스트
- ⬜ 리뷰 CRUD 테스트
- ⬜ 예약/대기 플로우 테스트
- ⬜ 팔로우/찜 기능 테스트
- ⬜ 파일 업로드 테스트 (S3)
- ⬜ 지도 연동 테스트

#### 1-3. 버그 수정
- ⬜ API 응답 형식 통일
- ⬜ 에러 핸들링 개선
- ⬜ CORS 설정 확인
- ⬜ 토큰 갱신 로직 검증

---

### Week 2: 추가 기능 개발

#### 2-1. 관리자 페이지 (NEW)
- ⬜ 관리자 레이아웃 (/admin/layout.tsx)
- ⬜ 대시보드 (/admin)
  - 총 회원 수, 식당 수, 리뷰 수
  - 일별 가입/예약 통계 차트
- ⬜ 회원 관리 (/admin/members)
  - 목록, 검색, 필터
  - 회원 상세/수정/삭제
  - 역할 변경 (USER/BUSINESS/ADMIN)
- ⬜ 식당 관리 (/admin/restaurants)
  - 목록, 검색, 필터
  - 식당 승인/거부
  - 상태 변경 (ACTIVE/INACTIVE/DELETED)
- ⬜ 리뷰 관리 (/admin/reviews)
  - 신고된 리뷰 처리
  - 리뷰 삭제

#### 2-2. 파트너 통계 대시보드 (NEW)
- ⬜ 통계 API 개발
  - GET /api/restaurants/{id}/stats
  - 일별/주별/월별 예약 수
  - 평균 평점 추이
  - 리뷰 수 추이
  - 조회수 통계
- ⬜ 통계 페이지 (/partner/stats)
  - 차트 (recharts 또는 chart.js)
  - 기간 필터

#### 2-3. 테마/루트 시스템 (선택적)
- ⬜ 테마 Entity/API (백엔드)
  - Theme, ThemeRestaurant Entity
  - 테마 CRUD API
- ⬜ 테마 페이지 (프론트엔드)
  - 테마 목록 (/themes)
  - 테마 상세 (/themes/[id])
  - 테마 생성 (/themes/new)
  - 마이 테마 (/mypage/themes)

---

### Week 3: 배포 및 최적화

#### 3-1. 배포 환경 구축
- ⬜ **백엔드 (EC2)**
  - EC2 인스턴스 확인 (t2.small)
  - Java 17, Gradle 설치
  - PostgreSQL 연결 확인 (Neon)
  - S3 연결 확인
  - 환경변수 설정
  - systemd 서비스 등록
  - Nginx 리버스 프록시 설정
  - SSL 인증서 (Let's Encrypt)

- ⬜ **프론트엔드 (Vercel)**
  - GitHub 연동
  - 환경변수 설정
  - 프로덕션 빌드 테스트
  - 커스텀 도메인 설정

#### 3-2. CI/CD 파이프라인
- ⬜ GitHub Actions 워크플로우
  - 백엔드: main 푸시 → EC2 자동 배포
  - 프론트엔드: main 푸시 → Vercel 자동 배포
- ⬜ 테스트 자동화
  - 백엔드 단위 테스트
  - 프론트엔드 빌드 검증

#### 3-3. 성능 최적화
- ⬜ **프론트엔드**
  - 이미지 최적화 (next/image)
  - 코드 스플리팅
  - 메타데이터 SEO
- ⬜ **백엔드**
  - 쿼리 최적화
  - N+1 문제 해결
  - 인덱스 확인

#### 3-4. 모니터링
- ⬜ 로깅 시스템 (logback)
- ⬜ 에러 추적 (선택: Sentry)
- ⬜ 성능 모니터링 (선택: CloudWatch)

---

## 📊 우선순위 정리

### 🔴 필수 (Week 1)
1. 프론트-백엔드 통합 테스트
2. API 호환성 수정
3. 핵심 기능 버그 수정

### 🟡 중요 (Week 2)
1. 파트너 통계 대시보드
2. 관리자 대시보드 (기본)
3. 관리자 회원/식당 관리

### 🟢 선택 (Week 2-3)
1. 테마/루트 시스템
2. 관리자 리뷰 관리
3. 고급 통계 기능

### 🔵 배포 (Week 3)
1. EC2 배포
2. Vercel 배포
3. CI/CD 구축

---

## 🛠️ 기술 스택 추가

### 관리자 페이지
- **차트**: recharts 또는 Chart.js
- **테이블**: TanStack Table (선택)
- **날짜 선택**: react-datepicker

### 배포
- **백엔드**: AWS EC2 + Nginx + systemd
- **프론트엔드**: Vercel
- **CI/CD**: GitHub Actions
- **SSL**: Let's Encrypt

---

## 📁 관리자 페이지 구조

```
frontend/src/app/admin/
├── layout.tsx              # 관리자 레이아웃
├── page.tsx                # 대시보드
├── members/
│   ├── page.tsx           # 회원 목록
│   └── [id]/
│       └── page.tsx       # 회원 상세
├── restaurants/
│   ├── page.tsx           # 식당 목록
│   └── [id]/
│       └── page.tsx       # 식당 상세
└── reviews/
    └── page.tsx           # 리뷰 관리
```

---

## 🔐 관리자 API (백엔드 추가)

```
# 관리자 전용 API
GET    /api/admin/stats                    # 전체 통계
GET    /api/admin/members                  # 회원 목록
GET    /api/admin/members/{id}             # 회원 상세
PUT    /api/admin/members/{id}/role        # 역할 변경
DELETE /api/admin/members/{id}             # 회원 삭제
GET    /api/admin/restaurants              # 식당 목록
PUT    /api/admin/restaurants/{id}/status  # 상태 변경
GET    /api/admin/reviews                  # 리뷰 목록
DELETE /api/admin/reviews/{id}             # 리뷰 삭제
```

---

## ✅ 완료 기준

### Week 1 완료 조건
- [ ] 모든 핵심 기능이 프론트-백엔드 연동되어 동작
- [ ] 주요 버그 0개
- [ ] API 응답 형식 통일 완료

### Week 2 완료 조건
- [ ] 파트너 통계 대시보드 동작
- [ ] 관리자 기본 기능 동작

### Week 3 완료 조건
- [ ] 백엔드 EC2 배포 완료
- [ ] 프론트엔드 Vercel 배포 완료
- [ ] CI/CD 파이프라인 동작
- [ ] HTTPS 적용

---

## 📝 관련 문서

- [[project_context]] - 프로젝트 전체 컨텍스트
- [[02_Phase2_백엔드핵심개발]] - 백엔드 개발
- [[03_Phase3_프론트핵심]] - 프론트엔드 개발
- [[05_Phase5_최적화]] - 최적화
- [[00_마스터플랜]] - 전체 계획

---

## 📅 일정 요약

| 주차 | 기간 | 주요 작업 | 산출물 |
|------|------|----------|--------|
| Week 1 | 5일 | 통합 테스트, 버그 수정 | 안정화된 서비스 |
| Week 2 | 5일 | 관리자, 통계, (테마) | 추가 기능 |
| Week 3 | 5일 | 배포, CI/CD, 최적화 | 운영 환경 |

**총 예상 기간: 3주 (15일)**

---

**마지막 업데이트**: 2025-11-26
**Phase 4 상태**: ⬜ 대기

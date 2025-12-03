# EzenRoad Project Context

## 🎯 프로젝트 목표

기존 Spring MVC + JSP + MySQL 기반의 EzenRoad (지역 맛집 플랫폼)를 
현대적인 기술 스택으로 리빌딩하여 성능, 유지보수성, 사용자 경험을 개선한다.

---

## 📊 프로젝트 정보

| 항목     | 내용                  |
| ------ | ------------------- |
| 프로젝트명  | EzRoad              |
| 서비스 유형 | 지역 맛집 검색 및 예약 플랫폼   |
| 사용자 유형 | 일반 회원, 사업자(점주), 관리자 |
| 핵심 기능  | 식당 검색, 예약, 리뷰, 팔로우  |

---

## 🛠️ 기술 스택

### 확정 스택
| 영역 | 기술 | 버전 | 상태 |
|------|------|------|------|
| Frontend | Next.js + TypeScript + Tailwind CSS | 15.x | ✅ 구현완료 |
| Backend | Spring Boot + JPA | 3.2.0 | ✅ 구현완료 |
| Database | PostgreSQL (Neon) | 15+ | ✅ 연결완료 |
| Storage | AWS S3 + CloudFront | - | ✅ 설정완료 |
| 배포 (FE) | Vercel | - | ⬜ Phase 4 |
| 배포 (BE) | AWS EC2 | t2.small | ⬜ Phase 4 |

### 기존 스택 (참조용)
- Spring MVC 5.2.25
- JSP + jQuery + Bootstrap
- MyBatis
- MySQL 8.x
- Apache Tiles

---

## 📁 경로 구조

```
프로젝트 루트
├── C:\linkisy\ezenroad\
│   ├── frontend\          # Next.js 프로젝트 ✅
│   └── backend\           # Spring Boot 프로젝트 ✅

문서
├── C:\Users\diwo0\Documents\Obsidian Vault\linkisy\EzenRoad\

원본 참조
├── C:\roadProject\roadProject\
```

---

## 🔧 핵심 기능 구현 현황

### 1. 회원 시스템 ✅
- [x] 일반 회원가입/로그인
- [x] 사업자 회원가입/로그인
- [x] JWT 기반 인증 (Access + Refresh Token)
- [x] 프로필 관리
- [x] 회원 탈퇴 (Soft Delete)

### 2. 식당 관리 ✅
- [x] 식당 목록 (검색/필터/페이지네이션)
- [x] 식당 상세 페이지
- [x] 식당 등록/수정/삭제 (사업자)
- [x] 공지사항 관리
- [x] 이미지 업로드 (가게, 메뉴판)

### 3. 메뉴 관리 ✅
- [x] 메뉴 CRUD
- [x] 메뉴 숨김/표시 토글
- [x] 메뉴 이미지 업로드

### 4. 예약 시스템 ✅
- [x] 예약 생성 (날짜/시간/인원)
- [x] 예약 목록 조회
- [x] 예약 확정/취소/완료

### 5. 대기 시스템 ✅
- [x] 대기 등록 (자동 대기번호)
- [x] 예상 대기시간 계산
- [x] 대기 호출/착석/취소/No-Show

### 6. 리뷰 시스템 ✅
- [x] 리뷰 작성 (별점 + 내용 + 이미지)
- [x] 리뷰 목록/상세
- [x] 리뷰 수정/삭제
- [x] 평균 점수 계산

### 7. 팔로우 시스템 ✅
- [x] 식당 팔로우/언팔로우 (찜)
- [x] 팔로워/팔로잉 목록
- [x] 팔로우 수 조회

### 8. 마이페이지 ✅
- [x] 내 정보 관리
- [x] 내 예약/대기 내역
- [x] 내 리뷰 내역
- [x] 찜한 식당

### 9. 지도 연동 ✅
- [x] Kakao Maps API
- [x] 현재 위치 기반 검색
- [x] 반경 내 식당 검색

### 10. 관리자 기능 ⬜ Phase 4
- [ ] 회원/식당 관리
- [ ] 통계 대시보드

---

## 🗃️ 데이터베이스 엔티티 (13개)

### 주요 테이블
1. **members** - 회원 정보
2. **restaurants** - 식당 정보
3. **menus** - 메뉴 정보
4. **reviews** - 리뷰
5. **reservations** - 예약
6. **waitings** - 대기
7. **follows** - 팔로우 관계
8. **mappings** - 지도 매핑
9. **review_images** - 리뷰 이미지
10. **restaurant_images** - 식당 이미지
11. **menu_images** - 메뉴 이미지
12. **menupan_images** - 메뉴판 이미지
13. **images** - 범용 이미지

### 관계
- Member 1:N Restaurant (사업자)
- Restaurant 1:N Menu
- Restaurant 1:N Review
- Member 1:N Review
- Member 1:N Reservation
- Member 1:N Waiting
- Member N:N Restaurant (Follow)

---

## 🌐 API 구조 (구현 완료)

### 인증 ✅
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/logout` - 로그아웃

### 회원 ✅
- `GET /api/members/me` - 내 정보
- `PUT /api/members/me` - 정보 수정
- `DELETE /api/members/me` - 회원 탈퇴
- `GET /api/members/me/stats` - 통계

### 식당 ✅
- `GET /api/restaurants` - 목록
- `GET /api/restaurants/{id}` - 상세
- `POST /api/restaurants` - 등록
- `PUT /api/restaurants/{id}` - 수정
- `DELETE /api/restaurants/{id}` - 삭제
- `GET /api/restaurants/my` - 내 식당

### 메뉴 ✅
- `GET /api/menus/restaurant/{id}` - 식당 메뉴
- `POST /api/menus` - 등록
- `PUT /api/menus/{id}` - 수정
- `DELETE /api/menus/{id}` - 삭제
- `PATCH /api/menus/{id}/visibility` - 숨김 토글

### 리뷰 ✅
- `GET /api/reviews` - 전체 목록
- `GET /api/reviews/{id}` - 상세
- `GET /api/reviews/restaurant/{id}` - 식당별
- `GET /api/reviews/my` - 내 리뷰
- `POST /api/reviews` - 작성
- `PUT /api/reviews/{id}` - 수정
- `DELETE /api/reviews/{id}` - 삭제

### 예약 ✅
- `GET /api/reservations/my` - 내 예약
- `GET /api/reservations/restaurant/{id}` - 식당별
- `POST /api/reservations` - 생성
- `PATCH /api/reservations/{id}/confirm` - 확정
- `PATCH /api/reservations/{id}/cancel` - 취소
- `PATCH /api/reservations/{id}/complete` - 완료

### 대기 ✅
- `GET /api/waitings/my` - 내 대기
- `GET /api/waitings/restaurant/{id}` - 식당별
- `POST /api/waitings` - 등록
- `PATCH /api/waitings/{id}/call` - 호출
- `PATCH /api/waitings/{id}/seat` - 착석
- `DELETE /api/waitings/{id}` - 취소
- `PATCH /api/waitings/{id}/no-show` - No-Show

### 팔로우 ✅
- `POST /api/follows/restaurants/{id}` - 식당 팔로우
- `DELETE /api/follows/restaurants/{id}` - 식당 언팔로우
- `GET /api/follows/my/restaurants` - 내 찜 목록
- `GET /api/follows/my/restaurant-ids` - 찜 ID 목록
- `GET /api/follows/restaurants/{id}/check` - 팔로우 확인
- `GET /api/follows/restaurants/{id}/count` - 팔로워 수
- `GET /api/follows/my/followers` - 팔로워 목록
- `GET /api/follows/my/following` - 팔로잉 목록

### 지도 ✅
- `POST /api/mappings` - 위치 추가
- `GET /api/mappings/my` - 내 위치
- `GET /api/mappings/nearby` - 반경 검색
- `DELETE /api/mappings/{id}` - 삭제

### 파일 ✅
- `POST /api/files/upload` - 업로드
- `DELETE /api/files` - 삭제

---

## 📅 개발 일정

| Phase | 기간 | 주요 작업 | 상태 |
|-------|------|----------|------|
| 1 | 1주 | 인프라 설정 (EC2, Neon, S3) | ✅ 완료 |
| 2 | 2주 | 백엔드 핵심 (Entity, Auth, API) | ✅ 완료 |
| 3 | 2주 | 프론트엔드 핵심 (24 Pages) | ✅ 완료 |
| 4 | 3주 | 통합, 관리자, 배포 | ⬜ 대기 |
| 5 | 1주 | 최적화 (반응형, SEO, 성능) | ⬜ 대기 |
| 6 | 1주 | QA 및 런칭 | ⬜ 대기 |

**총 예상 기간: 10주**
**현재 진행률: 60%**

---

## 🔗 참조 문서

- [[00_마스터플랜]] - 전체 계획
- [[작업규칙]] - 작업 규칙 및 MCP 사용 가이드
- [[01_Phase1_인프라설정]] - Phase 1 상세
- [[02_Phase2_백엔드핵심개발]] - Phase 2 상세
- [[03_Phase3_프론트핵심]] - Phase 3 상세
- [[04_Phase4_기능완성]] - Phase 4 계획
- [[07_DB스키마설계]] - 데이터베이스 설계
- [[08_API명세서]] - API 문서

---

## 📝 현재 상태

**마지막 업데이트**: 2025-11-26

### 완료된 작업
- [x] 기술 스택 결정
- [x] 아키텍처 설계
- [x] 마스터 플랜 문서 작성
- [x] Phase 1 인프라 설정
- [x] Phase 2 백엔드 개발 (13 Entity, 60+ API)
- [x] Phase 3 프론트엔드 개발 (24 Pages, 14 Components)

### 진행중인 작업
- [ ] Phase 4 기능 완성 준비

### 다음 작업
- Phase 4 시작 (통합 테스트, 관리자 페이지, 배포)

---

## ⚙️ 환경 변수

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_key
NEXT_PUBLIC_APP_NAME=EzenRoad
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://...neon.tech/...
    username: ...
    password: ...
  
jwt:
  secret: ...
  access-token-expiration: 86400000
  refresh-token-expiration: 604800000

aws:
  s3:
    bucket: ezenroad-bucket
    access-key: ...
    secret-key: ...
  region: ap-northeast-2

cloud:
  aws:
    cloudfront:
      domain: ...cloudfront.net
```

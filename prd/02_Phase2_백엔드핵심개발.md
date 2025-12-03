# Phase 2: 백엔드 핵심 개발

**상태**: ✅ 완료 (100%)
**기간**: 2025-11-20 ~ 2025-11-22
**담당**: 재권

---

## 📋 목표

기존 Spring MVC 프로젝트를 Spring Boot + JPA로 마이그레이션하고 핵심 API 개발 ✅

---

## ✅ 완료된 작업 (100%)

### 1. 기존 프로젝트 분석 ✅
- ✅ 기존 DTO 14개 분석 완료
- ✅ Service/DAO/Controller 구조 파악
- ✅ 예약(Reservation), 대기(Waiting) 기능 확인
- ✅ 마이페이지 통계 기능 확인

### 2. JPA Entity 생성 (13개) ✅
1. ✅ **Member** - 회원 (updateInfo, delete 메서드)
2. ✅ **Restaurant** - 식당
3. ✅ **Menu** - 메뉴
4. ✅ **Review** - 리뷰
5. ✅ **Reservation** - 예약
6. ✅ **Follow** - 팔로우/찜 통합
7. ✅ **Waiting** - 대기
8. ✅ **Mapping** - 지도 매핑
9. ✅ **ReviewImage** - 리뷰 이미지
10. ✅ **RestaurantImage** - 식당 이미지
11. ✅ **MenuImage** - 메뉴 이미지
12. ✅ **MenupanImage** - 메뉴판 이미지
13. ✅ **Image** - 범용 이미지

### 3. Enum 클래스 (4개) ✅
1. ✅ **MemberRole** - USER, BUSINESS, ADMIN
2. ✅ **RestaurantStatus** - ACTIVE, INACTIVE, DELETED
3. ✅ **ReservationStatus** - PENDING, CONFIRMED, CANCELLED, COMPLETED
4. ✅ **WaitingStatus** - WAITING, CALLED, SEATED, CANCELLED, NO_SHOW

### 4. JPA Repository 생성 (13개) ✅
1. ✅ MemberRepository (통계 메서드)
2. ✅ RestaurantRepository
3. ✅ MenuRepository
4. ✅ ReviewRepository (회원별 리뷰 수)
5. ✅ ReservationRepository
6. ✅ FollowRepository (페이징, 팔로워/팔로잉 수)
7. ✅ WaitingRepository (페이징)
8. ✅ MappingRepository (페이징)
9. ✅ ReviewImageRepository
10. ✅ RestaurantImageRepository
11. ✅ MenuImageRepository
12. ✅ MenupanImageRepository
13. ✅ ImageRepository

### 5. Spring Security & JWT (100%) ✅
- ✅ **SecurityConfig** - CORS, CSRF, 인증 설정
- ✅ **JwtTokenProvider**
  - Access Token 생성 (24시간)
  - Refresh Token 생성 (7일)
  - 토큰 검증 및 정보 추출
- ✅ **JwtAuthenticationFilter** - JWT 필터
- ✅ **CustomUserDetailsService** - 사용자 인증

### 6. 회원/인증 시스템 (100%) ✅
- ✅ **MemberService**
  - 회원가입 (일반/사업자 자동 구분)
  - 로그인
  - 정보 조회/수정
  - 회원 탈퇴 (Soft Delete)
  - Refresh Token 재발급
  - 통계 메서드 (팔로워/팔로잉/리뷰 수)
- ✅ **AuthController**
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/refresh
  - POST /api/auth/logout
- ✅ **MemberController**
  - GET /api/members/me
  - PUT /api/members/me
  - DELETE /api/members/me
  - GET /api/members/me/stats
- ✅ **DTO**
  - MemberRegisterRequest
  - MemberLoginRequest
  - MemberResponse
  - AuthResponse (Access + Refresh)
  - RefreshTokenRequest

### 7. 식당 관리 (100%) ✅
- ✅ **RestaurantService** - CRUD, 검색, 조회수
- ✅ **RestaurantController** - REST API
- ✅ **DTO**
  - RestaurantCreateRequest
  - RestaurantResponse

### 8. 메뉴 관리 (100%) ✅
- ✅ **MenuService** - CRUD, 가시성 토글
- ✅ **MenuController** - REST API
- ✅ **DTO**
  - MenuCreateRequest
  - MenuResponse

### 9. 팔로우 시스템 (100%) ✅
- ✅ **FollowService**
  - 팔로우/언팔로우
  - 팔로우 목록 조회 (상세)
  - 팔로우 ID 목록 (간단)
  - 팔로우 여부 확인
  - 팔로워 수 조회
- ✅ **FollowController** - REST API
- ✅ **DTO**
  - FollowResponse (NEW!)

### 10. 리뷰 시스템 (100%) ✅
- ✅ **ReviewService**
  - 리뷰 CRUD
  - 식당별/회원별 조회
  - 평균 평점 계산
  - 페이지네이션
- ✅ **ReviewController** - REST API
- ✅ **DTO**
  - ReviewCreateRequest
  - ReviewUpdateRequest
  - ReviewResponse

### 11. 예약 시스템 (100%) ✅
- ✅ **ReservationService**
  - 예약 생성/조회
  - 예약 확정/취소/완료
  - 회원/식당별 조회
  - 페이지네이션
- ✅ **ReservationController** - REST API
- ✅ **DTO**
  - ReservationCreateRequest
  - ReservationResponse

### 12. 대기(Waiting) 시스템 (100%) ✅
- ✅ **WaitingService**
  - 대기 등록 (자동 대기번호)
  - 예상 대기시간 계산
  - 대기 호출/착석/취소/No-Show
  - 회원/식당별 대기 목록
- ✅ **WaitingController**
  - POST /api/waitings
  - GET /api/waitings/my
  - GET /api/waitings/restaurant/{id}
  - PATCH /api/waitings/{id}/call
  - PATCH /api/waitings/{id}/seat
  - DELETE /api/waitings/{id}
  - PATCH /api/waitings/{id}/no-show
- ✅ **DTO**
  - WaitingCreateRequest
  - WaitingResponse

### 13. **파일 업로드 (S3) (100%)** ✅ NEW!
- ✅ **S3Config** - AWS S3 클라이언트 설정
- ✅ **FileUploadService**
  - 파일 업로드 (restaurant, menu, review, profile, menupan)
  - 파일 삭제
  - UUID 기반 파일명 생성
  - CloudFront URL 반환
- ✅ **FileUploadController**
  - POST /api/files/upload
  - DELETE /api/files
- ✅ **application.yml** - AWS 리전 설정 추가

### 14. **지도(Mapping) 시스템 (100%)** ✅ NEW!
- ✅ **MappingService**
  - 지도 위치 추가
  - 내 지도 위치 목록
  - 반경 내 위치 검색 (Haversine formula)
  - 지도 위치 삭제
- ✅ **MappingController**
  - POST /api/mappings
  - GET /api/mappings/my
  - GET /api/mappings/nearby
  - DELETE /api/mappings/{id}
- ✅ **DTO**
  - MappingCreateRequest
  - MappingResponse

### 15. Exception 처리 (100%) ✅
- ✅ **GlobalExceptionHandler** - 전역 예외 처리
- ✅ **DuplicateResourceException** - 중복 리소스
- ✅ **ResourceNotFoundException** - 리소스 없음
- ✅ **UnauthorizedException** - 인증 실패
- ✅ **ErrorResponse** - 에러 응답 DTO

### 16. 설정 완료 ✅
- ✅ **build.gradle** - Dependencies 완벽 설정
- ✅ **application.yml** - DB, JWT, S3, AWS 리전, Logging
- ✅ **JPA Auditing** - 생성/수정 시간 자동 관리
- ✅ **S3Config** - AWS S3 클라이언트 설정

---

## 📊 구현 완성도 (100%)

| 기능 | Entity | Repository | Service | Controller | DTO | 상태 |
|------|--------|------------|---------|------------|-----|------|
| 회원/인증 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 100% |
| 식당 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 100% |
| 메뉴 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 100% |
| 리뷰 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 100% |
| 예약 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 100% |
| 팔로우 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 100% |
| 대기 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 100% |
| **파일 업로드** | - | - | ✅ | ✅ | - | ✅ **100%** |
| **지도(Mapping)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **100%** |

---

## 🎯 Phase 2 최종 요약

### 📦 구현된 전체 컴포넌트
- **Entity**: 13개
- **Enum**: 4개
- **Repository**: 13개
- **Service**: 9개 (Member, Restaurant, Menu, Review, Reservation, Follow, Waiting, FileUpload, Mapping)
- **Controller**: 9개 (Auth, Member, Restaurant, Menu, Review, Reservation, Follow, Waiting, FileUpload, Mapping)
- **Request DTO**: 9개
- **Response DTO**: 9개
- **Exception**: 4개
- **Config**: 2개 (Security, S3)
- **Security**: 3개 (JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService)

### 🌐 구현된 API 엔드포인트 (총 60+개)

**인증/회원**
- POST /api/auth/register - 회원가입
- POST /api/auth/login - 로그인
- POST /api/auth/refresh - 토큰 재발급
- POST /api/auth/logout - 로그아웃
- GET /api/members/me - 내 정보
- PUT /api/members/me - 정보 수정
- DELETE /api/members/me - 회원 탈퇴
- GET /api/members/me/stats - 통계

**식당**
- GET /api/restaurants - 목록
- GET /api/restaurants/{id} - 상세
- POST /api/restaurants - 등록
- PUT /api/restaurants/{id} - 수정
- DELETE /api/restaurants/{id} - 삭제

**메뉴**
- GET /api/menus/restaurant/{id} - 목록
- POST /api/menus - 등록
- PUT /api/menus/{id} - 수정
- DELETE /api/menus/{id} - 삭제

**리뷰**
- GET /api/reviews - 전체 목록
- GET /api/reviews/restaurant/{id} - 식당별
- GET /api/reviews/my - 내 리뷰
- POST /api/reviews - 작성
- PUT /api/reviews/{id} - 수정
- DELETE /api/reviews/{id} - 삭제

**예약**
- GET /api/reservations/my - 내 예약
- GET /api/reservations/restaurant/{id} - 식당별
- POST /api/reservations - 생성
- PATCH /api/reservations/{id}/confirm - 확정
- PATCH /api/reservations/{id}/cancel - 취소
- PATCH /api/reservations/{id}/complete - 완료

**팔로우**
- POST /api/follows/restaurants/{id} - 팔로우
- DELETE /api/follows/restaurants/{id} - 언팔로우
- GET /api/follows/my/restaurants - 팔로우 목록
- GET /api/follows/my/restaurant-ids - 팔로우 ID
- GET /api/follows/restaurants/{id}/check - 확인
- GET /api/follows/restaurants/{id}/count - 수

**대기**
- POST /api/waitings - 등록
- GET /api/waitings/my - 내 대기
- GET /api/waitings/restaurant/{id} - 식당별
- PATCH /api/waitings/{id}/call - 호출
- PATCH /api/waitings/{id}/seat - 착석
- DELETE /api/waitings/{id} - 취소
- PATCH /api/waitings/{id}/no-show - No-Show

**파일 업로드**
- POST /api/files/upload - 업로드
- DELETE /api/files - 삭제

**지도**
- POST /api/mappings - 위치 추가
- GET /api/mappings/my - 내 위치
- GET /api/mappings/nearby - 반경 검색
- DELETE /api/mappings/{id} - 삭제

---

## 🎯 다음 단계: Phase 3

### Phase 3: 프론트엔드 핵심 개발
- Next.js 프로젝트 초기화
- 공통 레이아웃
- 인증 시스템 (로그인/회원가입)
- 식당 목록/상세 페이지
- API 클라이언트 설정

**문서**: [[03_Phase3_프론트핵심]]

---

## 📝 관련 문서

- [[project_context]] - 프로젝트 전체 컨텍스트
- [[07_DB스키마설계]] - 데이터베이스 설계
- [[08_API명세서]] - API 문서
- [[00_마스터플랜]] - 전체 계획

---

**마지막 업데이트**: 2025-11-22
**Phase 2 완료**: 100% ✅

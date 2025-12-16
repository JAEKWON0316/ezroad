# API 명세서

## 🎯 개요
Linkisy REST API 명세서

---

## 📋 기본 정보

| 항목 | 내용 |
|------|------|
| Base URL | `https://api.ezenroad.com/api` |
| 인증 방식 | JWT Bearer Token |
| Content-Type | `application/json` |

---

## 🔐 인증 (Auth)

### POST /auth/register
회원가입

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "nickname": "길동이",
  "phone": "010-1234-5678",
  "role": "USER"
}
```

**Response** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "nickname": "길동이",
  "role": "USER",
  "createdAt": "2025-01-01T00:00:00"
}
```

---

### POST /auth/login
로그인

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** `200 OK`
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

---

### POST /auth/refresh
토큰 갱신

**Request Body**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response** `200 OK`
```json
{
  "accessToken": "eyJhbGc...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

---

### POST /auth/logout
로그아웃

**Headers**
```
Authorization: Bearer {accessToken}
```

**Response** `200 OK`
```json
{
  "message": "로그아웃 되었습니다."
}
```

---

## 👤 회원 (Members)

### GET /members/me
내 정보 조회

**Headers**
```
Authorization: Bearer {accessToken}
```

**Response** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "nickname": "길동이",
  "phone": "010-1234-5678",
  "address": "서울시 강남구",
  "profileImage": "https://cdn.ezenroad.com/...",
  "role": "USER",
  "createdAt": "2025-01-01T00:00:00"
}
```

---

### PUT /members/me
내 정보 수정

**Request Body**
```json
{
  "name": "홍길동",
  "nickname": "새닉네임",
  "phone": "010-9999-8888",
  "zipcode": "12345",
  "address": "서울시 강남구",
  "addressDetail": "101동 101호"
}
```

---

### DELETE /members/me
회원 탈퇴

**Response** `200 OK`
```json
{
  "message": "회원 탈퇴가 완료되었습니다."
}
```

---

## 🍽️ 식당 (Restaurants)

### GET /restaurants
식당 목록 조회

**Query Parameters**
| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| page | int | 페이지 번호 | 0 |
| size | int | 페이지 크기 | 10 |
| sort | string | 정렬 (rating, reviewCount, createdAt) | createdAt |
| category | string | 카테고리 필터 | - |
| keyword | string | 검색어 | - |
| lat | double | 위도 | - |
| lng | double | 경도 | - |
| radius | int | 반경 (m) | 3000 |

**Response** `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "name": "맛있는 식당",
      "category": "한식",
      "address": "서울시 강남구...",
      "thumbnail": "https://cdn...",
      "avgRating": 4.5,
      "reviewCount": 120,
      "distance": 500
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10
}
```

---

### GET /restaurants/{id}
식당 상세 조회

**Response** `200 OK`
```json
{
  "id": 1,
  "name": "맛있는 식당",
  "category": "한식",
  "description": "정통 한식을 제공합니다...",
  "phone": "02-1234-5678",
  "address": "서울시 강남구...",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "website": "https://...",
  "businessHours": "09:00-22:00",
  "notice": "연말 이벤트 진행중!",
  "thumbnail": "https://cdn...",
  "menuBoardImage": "https://cdn...",
  "avgRating": 4.5,
  "reviewCount": 120,
  "viewCount": 5000,
  "owner": {
    "id": 10,
    "nickname": "사장님"
  },
  "menus": [...],
  "createdAt": "2025-01-01T00:00:00"
}
```

---

### POST /restaurants
식당 등록 (사업자)

**Request Body**
```json
{
  "name": "새로운 식당",
  "category": "한식",
  "description": "맛있는 음식을 제공합니다.",
  "phone": "02-1234-5678",
  "zipcode": "12345",
  "address": "서울시 강남구",
  "addressDetail": "1층",
  "website": "https://...",
  "businessHours": "09:00-22:00"
}
```

---

### PUT /restaurants/{id}
식당 수정

---

### DELETE /restaurants/{id}
식당 삭제

---

### PUT /restaurants/{id}/notice
공지사항 수정

**Request Body**
```json
{
  "notice": "새로운 공지사항 내용..."
}
```

---

## 🍕 메뉴 (Menus)

### GET /restaurants/{restaurantId}/menus
메뉴 목록 조회

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "name": "김치찌개",
    "price": 9000,
    "description": "돼지고기 김치찌개",
    "thumbnail": "https://cdn...",
    "isVisible": true
  }
]
```

---

### POST /restaurants/{restaurantId}/menus
메뉴 등록

**Request Body**
```json
{
  "name": "된장찌개",
  "price": 8000,
  "description": "구수한 된장찌개"
}
```

---

### PUT /menus/{id}
메뉴 수정

---

### DELETE /menus/{id}
메뉴 삭제

---

## ⭐ 리뷰 (Reviews)

### GET /restaurants/{restaurantId}/reviews
식당 리뷰 목록

**Query Parameters**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | int | 페이지 번호 |
| size | int | 페이지 크기 |
| sort | string | 정렬 (latest, rating) |

**Response** `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "title": "맛있어요!",
      "content": "음식이 정말 맛있습니다...",
      "rating": 5,
      "images": ["https://cdn..."],
      "viewCount": 100,
      "member": {
        "id": 1,
        "nickname": "맛집러버",
        "profileImage": "https://cdn..."
      },
      "createdAt": "2025-01-01T00:00:00"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 50
}
```

---

### POST /reviews
리뷰 작성

**Request Body (multipart/form-data)**
```
title: "맛있어요!"
content: "음식이 정말 맛있습니다..."
rating: 5
restaurantId: 1
images: [File, File, ...]
```

---

### PUT /reviews/{id}
리뷰 수정

---

### DELETE /reviews/{id}
리뷰 삭제

---

### GET /members/me/reviews
내 리뷰 목록

---

## 📅 예약 (Reservations)

### POST /reservations
예약 생성

**Request Body**
```json
{
  "restaurantId": 1,
  "guestCount": 4,
  "reservationDate": "2025-01-15",
  "reservationTime": "18:00",
  "request": "창가 자리 부탁드립니다."
}
```

**Response** `201 Created`
```json
{
  "id": 1,
  "restaurant": {
    "id": 1,
    "name": "맛있는 식당"
  },
  "guestCount": 4,
  "reservationDate": "2025-01-15",
  "reservationTime": "18:00",
  "status": "PENDING",
  "createdAt": "2025-01-01T00:00:00"
}
```

---

### GET /members/me/reservations
내 예약 목록

**Query Parameters**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| status | string | 상태 필터 |

---

### GET /restaurants/{restaurantId}/reservations
식당 예약 목록 (사업자)

---

### PUT /reservations/{id}/status
예약 상태 변경

**Request Body**
```json
{
  "status": "CONFIRMED"
}
```

---

### DELETE /reservations/{id}
예약 취소

---

## 💝 팔로우 (Follows)

### POST /follows/members/{memberId}
회원 팔로우

---

### DELETE /follows/members/{memberId}
회원 언팔로우

---

### POST /follows/restaurants/{restaurantId}
식당 찜하기

---

### DELETE /follows/restaurants/{restaurantId}
식당 찜 취소

---

### GET /members/me/following
팔로잉 목록

---

### GET /members/me/followers
팔로워 목록

---

### GET /members/me/favorites
찜한 식당 목록

---

## 📁 파일 업로드 (Files)

### POST /files/upload
파일 업로드

**Request (multipart/form-data)**
```
file: File
type: "restaurant" | "menu" | "review" | "profile"
```

**Response** `200 OK`
```json
{
  "url": "https://cdn.ezenroad.com/...",
  "originalName": "image.jpg",
  "size": 102400
}
```

---

## 📊 응답 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 찾을 수 없음 |
| 500 | 서버 오류 |

---

## ❌ 에러 응답 형식

```json
{
  "timestamp": "2025-01-01T00:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "이메일 형식이 올바르지 않습니다.",
  "path": "/api/auth/register"
}
```

---

## 🔗 관련 문서

- [[07_DB스키마설계]]
- [[02_Phase2_백엔드핵심]]
- [[project_context]]


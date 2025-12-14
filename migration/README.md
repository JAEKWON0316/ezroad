# EzRoad Supabase 마이그레이션 가이드

## 📋 마이그레이션 순서

### Step 1: Supabase SQL Editor에서 실행

Supabase Dashboard → SQL Editor에서 아래 순서로 실행:

1. **01_schema_part1.sql** - 기본 테이블 생성 (members, restaurants, menus, reviews, reservations, follows, waiting)
2. **02_schema_part2.sql** - 이미지/테마/기타 테이블 생성
3. **03_data_members.sql** - 회원 데이터 (9개)
4. **04_data_restaurants.sql** - 식당 데이터 (6개)
5. **05_data_menus.sql** - 메뉴 데이터 (28개)
6. **06_data_reviews.sql** - 리뷰 데이터 (12개)
7. **07_data_relations.sql** - 예약/팔로우/대기 데이터
8. **08_data_others.sql** - 테마/검색어/OAuth 데이터

### Step 2: 백엔드 .env 파일 수정

`C:\linkisy\ezenroad\backend\.env` 파일을 아래와 같이 수정:

```env
# Supabase Seoul 연결
DATABASE_URL=jdbc:postgresql://db.eionkvxlvqogsbqaggpi.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=diwo0206^
```

### Step 3: 로컬 테스트

```bash
cd C:\linkisy\ezenroad\backend
.\gradlew.bat build -x test
java -jar build/libs/ezroad-0.0.1-SNAPSHOT.jar
```

### Step 4: EC2 재배포

GitHub에 push하면 자동 배포됨

---

## 📊 마이그레이션 데이터 요약

| 테이블 | 레코드 수 |
|--------|----------|
| members | 9 |
| restaurants | 6 |
| menus | 28 |
| reviews | 12 |
| reservations | 10 |
| follows | 25 |
| waiting | 14 |
| themes | 1 |
| theme_restaurants | 2 |
| search_keywords | 2 |
| member_oauth | 2 |
| **총합** | **111** |

---

## ✅ 예상 결과

- **기존**: Neon Singapore → 700ms
- **신규**: Supabase Seoul → 50-100ms
- **개선율**: ~85% 속도 향상

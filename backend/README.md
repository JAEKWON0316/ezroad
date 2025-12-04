# EzenRoad Backend

Spring Boot 3.2.0 기반 백엔드 서버

**배포 버전**: v1.0.0 (2024-12-04)

## 📋 요구사항

- **Java**: JDK 17 이상
- **Gradle**: 8.5 이상 (프로젝트에 포함된 Gradle Wrapper 사용 가능)
- **PostgreSQL**: 12 이상
- **AWS S3**: 파일 업로드용 (선택사항)

## 🚀 시작하기

### 1. Java 설치 확인

```powershell
java -version
```

Java가 설치되어 있지 않다면:
- [Eclipse Temurin JDK 17](https://adoptium.net/temurin/releases/?version=17) 다운로드 및 설치
- 또는 [Microsoft Build of OpenJDK 17](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17) 다운로드 및 설치

### 2. 환경 변수 설정

#### Windows 환경 변수 설정

1. **JAVA_HOME 설정**
   - 시스템 속성 > 고급 시스템 설정 > 환경 변수
   - 새로 만들기 > 변수 이름: `JAVA_HOME`
   - 변수 값: JDK 설치 경로 (예: `C:\Program Files\Eclipse Adoptium\jdk-17.0.9+9-hotspot`)

2. **PATH에 추가**
   - 시스템 변수 `Path` 편집
   - 새로 만들기 > `%JAVA_HOME%\bin` 추가

3. **PowerShell 재시작 후 확인**
   ```powershell
   java -version
   javac -version
   echo $env:JAVA_HOME
   ```

### 3. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 `application.yml`에 연결 정보를 설정합니다.

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ezroad
    username: your_username
    password: your_password
```

또는 환경 변수로 설정:
```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/ezroad?user=your_username&password=your_password"
```

### 4. 환경 변수 설정 (.env 파일 생성)

프로젝트 루트에 `.env` 파일을 생성하거나 환경 변수를 설정합니다:

```powershell
# JWT
$env:JWT_SECRET="your-secret-key-change-this-in-production"

# Database
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/ezroad?user=postgres&password=password"

# AWS S3 (선택사항)
$env:AWS_REGION="ap-northeast-2"
$env:AWS_S3_BUCKET="ezroad-uploads"
$env:AWS_ACCESS_KEY="your-access-key"
$env:AWS_SECRET_KEY="your-secret-key"
$env:AWS_CLOUDFRONT_DOMAIN="https://your-cloudfront-domain.cloudfront.net"
```

### 5. 데이터베이스 스키마 생성

```sql
-- schema.sql 파일을 실행하여 데이터베이스 스키마 생성
psql -U postgres -d ezroad -f schema.sql
```

### 6. 애플리케이션 실행

#### Gradle Wrapper 사용 (권장)

```powershell
# Windows
.\gradlew.bat bootRun

# 또는
.\gradlew.bat build
java -jar build\libs\ezroad-0.0.1-SNAPSHOT.jar
```

#### VS Code에서 실행

1. `EzRoadApplication.java` 파일 열기
2. `main` 메서드 위의 실행 버튼 클릭
3. 또는 F5 키를 눌러 디버그 모드로 실행

## 🛠️ 개발 도구

### VS Code 확장 프로그램

- **Extension Pack for Java** (Microsoft)
- **Spring Boot Extension Pack** (VMware)

### 유용한 명령어

```powershell
# 빌드
.\gradlew.bat build

# 테스트 실행
.\gradlew.bat test

# 의존성 확인
.\gradlew.bat dependencies

# 클린 빌드
.\gradlew.bat clean build
```

## 📝 주요 API 엔드포인트

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api//files/upload` - 파일 업로드
- `GET //members/me` - 내 정보 조회
- `GET /api/restaurants` - 식당 목록
- `GET /api/menus?restaurantId={id}` - 메뉴 목록
- `GET /api/restaurants/{restaurantId}/reviews` - 리뷰 목록

## 🔧 문제 해결

### Java를 찾을 수 없는 경우

1. Java 설치 확인: `java -version`
2. JAVA_HOME 환경 변수 확인: `echo $env:JAVA_HOME`
3. VS Code 재시작
4. Java Extension Pack 재설치

### 포트 8080이 이미 사용 중인 경우

`application.yml`에서 포트 변경:
```yaml
server:
  port: 8081
```

### 데이터베이스 연결 오류

1. PostgreSQL 서비스 실행 확인
2. 데이터베이스 및 사용자 생성 확인
3. username, password 확인
4. `application.yml`의 연결 정보 확인

# Build stage - 의존성 캐싱 최적화
FROM gradle:8.5-jdk17-alpine AS build
WORKDIR /app

# 의존성 파일만 먼저 복사 (캐시 활용)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon || true

# 소스코드 복사 및 빌드
COPY . .
RUN gradle clean build -x test --no-daemon

# Run stage - 프로덕션 최적화
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 타임존 설정 + curl (healthcheck용)
RUN apk add --no-cache tzdata curl
ENV TZ=Asia/Seoul

# 보안: non-root 사용자 생성
RUN addgroup -S spring && adduser -S spring -G spring

# JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 소유권 변경
RUN chown spring:spring app.jar

# non-root 사용자로 전환
USER spring:spring

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 포트 노출
EXPOSE 8080

# 실행 - 컨테이너 최적화 JVM 옵션
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:InitialRAMPercentage=50.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]

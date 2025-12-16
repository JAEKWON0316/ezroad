# Phase 1: 인프라 설정

## 🎯 목표
Linkisy프로젝트의 기반 인프라를 구축하여 개발 환경을 완성한다.

---

## 📋 개요

| 항목 | 내용 |
|------|------|
| 예상 기간 | 1주 |
| 상태 | ⬜ 대기 |
| 선행 조건 | 없음 |
| 후속 Phase | [[02_Phase2_백엔드핵심]] |

---

## 🏗️ 인프라 구성도

```
[GitHub Repository]
      ↓
[Vercel] ←→ [Next.js Frontend]
      ↓
[AWS EC2] ←→ [Spring Boot Backend]
      ↓
[Neon PostgreSQL]
      ↓
[AWS S3 + CloudFront]
```

---

## 📝 상세 작업

### 1. GitHub Repository 설정

#### 1.1 저장소 생성
- Repository 이름: `ezenroad`
- Public/Private 선택
- README, .gitignore 설정

#### 1.2 브랜치 전략
```
main (production)
  └── develop (개발)
       ├── feature/auth
       ├── feature/restaurant
       └── ...
```

#### 1.3 디렉토리 구조
```
ezenroad/
├── frontend/    # Next.js
├── backend/     # Spring Boot
└── README.md
```

---

### 2. Neon PostgreSQL 설정

#### 2.1 프로젝트 생성
- Region: Asia Pacific (Seoul) 또는 가까운 리전
- Compute: Serverless

#### 2.2 데이터베이스 설정
- Database 이름: `ezenroad`
- 기본 스키마: `public`

#### 2.3 연결 정보 확보
```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

### 3. AWS EC2 설정

#### 3.1 인스턴스 생성
- AMI: Amazon Linux 2023 또는 Ubuntu 22.04
- Instance Type: t2.micro (프리티어) 또는 t3.small
- Storage: 20GB gp3
- Security Group:
  - SSH (22): 내 IP만
  - HTTP (80): 전체
  - HTTPS (443): 전체
  - Custom (8080): 전체 (Spring Boot)

#### 3.2 환경 설정
```bash
# Java 17 설치
sudo yum install java-17-amazon-corretto -y

# 또는 Ubuntu
sudo apt update
sudo apt install openjdk-17-jdk -y
```

#### 3.3 배포 스크립트 준비
- `/home/ec2-user/app/` 디렉토리 생성
- systemd 서비스 파일 설정

---

### 4. AWS S3 + CloudFront 설정

#### 4.1 S3 버킷 생성
- Bucket 이름: `Linkisy-uploads`
- Region: ap-northeast-2 (서울)
- Public Access: 차단 (CloudFront 통해서만)
- CORS 설정 필요

#### 4.2 IAM 사용자 생성
- 사용자 이름: `Linkisy-s3-user`
- 정책: S3 특정 버킷만 접근
- Access Key 발급

#### 4.3 CloudFront 배포
- Origin: S3 버킷
- OAC (Origin Access Control) 설정
- 캐시 정책 설정

---

### 5. Vercel 프로젝트 설정

#### 5.1 프로젝트 연결
- GitHub 저장소 연결
- Root Directory: `frontend`
- Framework: Next.js

#### 5.2 환경 변수 설정
```
NEXT_PUBLIC_API_URL=https://api.Linkisy.com
NEXT_PUBLIC_KAKAO_MAP_KEY=xxx
```

#### 5.3 도메인 설정 (선택)
- 커스텀 도메인 연결

---

### 6. CI/CD 파이프라인

#### 6.1 Frontend (Vercel)
- GitHub push → 자동 배포
- Preview 배포 (PR)

#### 6.2 Backend (GitHub Actions)
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  deploy:
    # EC2로 배포
```

---

## ✅ 체크리스트

### GitHub
- [ ] Repository 생성
- [ ] 브랜치 전략 설정
- [ ] .gitignore 설정
- [ ] 초기 커밋

### Neon PostgreSQL
- [ ] Neon 계정 생성/로그인
- [ ] 프로젝트 생성
- [ ] 데이터베이스 생성
- [ ] 연결 문자열 확보
- [ ] 연결 테스트

### AWS EC2
- [ ] EC2 인스턴스 생성
- [ ] Security Group 설정
- [ ] SSH 접속 확인
- [ ] Java 17 설치
- [ ] 배포 디렉토리 생성

### AWS S3 + CloudFront
- [ ] S3 버킷 생성
- [ ] CORS 설정
- [ ] IAM 사용자 생성
- [ ] Access Key 발급
- [ ] CloudFront 배포 생성
- [ ] 업로드 테스트

### Vercel
- [ ] Vercel 계정 생성/로그인
- [ ] GitHub 연결
- [ ] 프로젝트 import
- [ ] 환경 변수 설정
- [ ] 배포 테스트

### CI/CD
- [ ] GitHub Actions 워크플로우 작성
- [ ] EC2 배포 자동화
- [ ] 배포 테스트

---

## 🔐 환경 변수 목록

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_KAKAO_MAP_KEY=
NEXT_PUBLIC_S3_URL=
```

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

aws:
  s3:
    bucket: ${S3_BUCKET}
    access-key: ${AWS_ACCESS_KEY}
    secret-key: ${AWS_SECRET_KEY}
  cloudfront:
    domain: ${CLOUDFRONT_DOMAIN}

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000
```

---

## ⚠️ 주의사항

1. **보안**
   - 모든 시크릿은 환경 변수로 관리
   - .env 파일은 절대 Git에 커밋하지 않음
   - AWS 키는 최소 권한 원칙 적용

2. **비용**
   - Neon: Free tier 확인
   - EC2: 프리티어 한도 확인
   - S3/CloudFront: 요금 모니터링

3. **백업**
   - Neon 자동 백업 확인
   - 주요 설정 문서화

---

## 🔗 관련 문서

- [[00_마스터플랜]]
- [[작업규칙]]
- [[project_context]]
- [[07_DB스키마설계]]
- [[02_Phase2_백엔드핵심]]

---

## 📝 작업 로그

| 날짜 | 작업 내용 | 상태 |
|------|----------|------|
| 2025-11-18 | 문서 작성 | ✅ |
| - | Phase 1 시작 | ⬜ |


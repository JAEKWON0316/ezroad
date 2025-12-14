-- EzRoad Supabase Migration - Data INSERT (Part 1: Members)
-- Generated: 2025-12-13

-- =====================================================
-- MEMBERS 데이터 (9개)
-- =====================================================
INSERT INTO members (id, email, password, name, nickname, phone, zipcode, address, address_detail, birth_date, profile_image, role, business_number, created_at, updated_at, deleted_at) VALUES
(1, 'test@example.com', '$2a$10$DqIBVwZ1eS7S283Gx.aJV.JOV8LBBGHlAb9lvs3bI13tvnB0erLq6', '홍길동', '테스터', '010-1234-5678', NULL, NULL, NULL, NULL, NULL, 'USER', NULL, '2025-11-24 14:25:41.791', '2025-11-24 14:25:41.791', NULL),
(2, 'diwo02@naver.com', '$2a$10$OrpYodt0PGmWuvqwO/yAOOwV8L90OhjY.KQBaUxt4KUH76vRLeO0.', '이재권', 'jack1', '01012341234', NULL, NULL, NULL, NULL, NULL, 'USER', NULL, '2025-11-25 23:52:17.555', '2025-12-11 04:51:58.267', NULL),
(3, 'jack1@naver.com', '$2a$10$i4KW4PLQb9vB/DKP4s3MTu69QgDTA2.oZNgGbxa4zdWgQ3.yoDUZy', '이재권', 'Jack', '01011111111', NULL, '', NULL, NULL, NULL, 'USER', '', '2025-11-26 19:27:17.795', '2025-11-26 19:27:17.795', NULL),
(4, 'pretty2002kr@gmail.com', '$2a$10$WytCjGTj/LDUq8qmQoDoqu0A3dkj6ZxIWZWYm3WV.jvXtW18J794.', '수기마을', '수기마을', '01012321232', NULL, '경기 김포시 고촌읍 수기로 67-54', NULL, NULL, NULL, 'USER', '', '2025-11-26 19:28:50.506', '2025-11-26 19:28:50.506', NULL),
(5, 'jack2@naver.com', '$2a$10$GogNaTvyy0ZsayPKAsK66.6UsbeCyrqSekv2tw1hZ7nVHnz45QU7O', '사업자1', '사업자1', '01014141414', NULL, '경기 김포시 고촌읍 수기로 67-54', NULL, NULL, NULL, 'BUSINESS', '1234567891', '2025-11-30 18:51:03.181', '2025-11-30 18:51:03.181', NULL),
(6, 'owner2@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H9dJhXQl9.yWVA7jQxz8N8VqJXi', '김철수', '맛집사장', '010-1111-2222', NULL, '서울시 강남구 역삼동', NULL, NULL, NULL, 'BUSINESS', '123-45-67890', '2025-11-30 10:23:53.069', '2025-11-30 10:23:53.069', NULL),
(7, 'owner3@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H9dJhXQl9.yWVA7jQxz8N8VqJXi', '박영희', '요리왕', '010-3333-4444', NULL, '서울시 마포구 홍대입구', NULL, NULL, NULL, 'BUSINESS', '234-56-78901', '2025-11-30 10:24:00.990', '2025-11-30 10:24:00.990', NULL),
(8, 'admin@ezroad.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.W8rSCPxmXpMjOVvKcS', '관리자', 'Admin', '010-0000-0000', NULL, NULL, NULL, NULL, NULL, 'ADMIN', NULL, '2025-11-30 10:47:22.788', '2025-11-30 10:47:22.788', NULL),
(13, 'dwornjs0316@naver.com', '1c26b42d-e871-4fc8-a276-b7b43668b723', '이재권', '이재권', NULL, NULL, NULL, NULL, NULL, NULL, 'USER', NULL, '2025-12-11 04:48:10.593', '2025-12-11 04:48:10.593', NULL);

-- 시퀀스 리셋
SELECT setval('members_id_seq', (SELECT MAX(id) FROM members));

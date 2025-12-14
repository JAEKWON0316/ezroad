-- EzRoad Supabase Migration - Data INSERT (Part 6: Themes, Search, OAuth)

-- =====================================================
-- THEMES 데이터 (1개)
-- =====================================================
INSERT INTO themes (id, member_id, title, description, thumbnail, is_public, view_count, like_count, created_at, updated_at) VALUES
(1, 5, '강남 데이트코스 추천', '강남에 있는 한식 김치찌개로 외국인과 오기좋음', 'https://d36oknyr1agcyh.cloudfront.net/restaurant/76848bcc-1328-41cb-b1a7-9a84756e7690.jpg', true, 15, 0, '2025-12-07 03:02:39.704', '2025-12-10 00:51:01.772');

SELECT setval('themes_id_seq', (SELECT MAX(id) FROM themes));

-- =====================================================
-- THEME_RESTAURANTS 데이터 (2개)
-- =====================================================
INSERT INTO theme_restaurants (id, theme_id, restaurant_id, sort_order, memo, created_at) VALUES
(1, 1, 1, 0, NULL, '2025-12-07 03:02:41.015'),
(2, 1, 4, 1, NULL, '2025-12-08 05:21:53.503');

SELECT setval('theme_restaurants_id_seq', (SELECT MAX(id) FROM theme_restaurants));

-- =====================================================
-- SEARCH_KEYWORDS 데이터 (2개)
-- =====================================================
INSERT INTO search_keywords (id, keyword, search_count, last_searched_at, created_at) VALUES
(1, '안녕', 10, '2025-12-12 17:21:23.778', '2025-12-09 22:15:21.344'),
(2, '한식', 1, '2025-12-09 23:04:37.627', '2025-12-09 23:04:37.627');

SELECT setval('search_keywords_id_seq', (SELECT MAX(id) FROM search_keywords));

-- =====================================================
-- MEMBER_OAUTH 데이터 (2개)
-- =====================================================
INSERT INTO member_oauth (id, member_id, provider, provider_id, created_at) VALUES
(1, 13, 'NAVER', 'T10A6qNKXtPIYOWt4RZEgE8djVdvI40pQUKMcyhkJnc', '2025-12-11 08:18:58.134'),
(2, 2, 'KAKAO', '4634400821', '2025-12-12 03:56:31.390');

SELECT setval('member_oauth_id_seq', (SELECT MAX(id) FROM member_oauth));

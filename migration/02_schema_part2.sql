-- EzRoad Supabase Migration - Schema (Part 2)
-- 이미지 테이블 + 테마 + 기타

-- =====================================================
-- 8. IMAGES 테이블 (범용)
-- =====================================================
CREATE TABLE IF NOT EXISTS images (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    original_name VARCHAR(255),
    file_size BIGINT,
    content_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_images_entity ON images(entity_type, entity_id);

-- =====================================================
-- 9. RESTAURANT_IMAGES 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS restaurant_images (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    original_name VARCHAR(255),
    file_size BIGINT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_restaurant_images_restaurant ON restaurant_images(restaurant_id);

-- =====================================================
-- 10. MENU_IMAGES 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_images (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    original_name VARCHAR(255),
    file_size BIGINT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_images_menu ON menu_images(menu_id);

-- =====================================================
-- 11. MENUPAN_IMAGES 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS menupan_images (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    original_name VARCHAR(255),
    file_size BIGINT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menupan_images_restaurant ON menupan_images(restaurant_id);

-- =====================================================
-- 12. REVIEW_IMAGES 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    original_name VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_review_images_review ON review_images(review_id);

-- =====================================================
-- 13. THEMES 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS themes (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(500),
    is_public BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_themes_member ON themes(member_id);

-- =====================================================
-- 14. THEME_RESTAURANTS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS theme_restaurants (
    id BIGSERIAL PRIMARY KEY,
    theme_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    memo VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_theme_restaurants_theme ON theme_restaurants(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_restaurants_restaurant ON theme_restaurants(restaurant_id);

-- =====================================================
-- 15. THEME_LIKES 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS theme_likes (
    id BIGSERIAL PRIMARY KEY,
    theme_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_theme_likes UNIQUE (theme_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_theme_likes_theme ON theme_likes(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_likes_member ON theme_likes(member_id);

-- =====================================================
-- 16. SEARCH_KEYWORDS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS search_keywords (
    id BIGSERIAL PRIMARY KEY,
    keyword VARCHAR(100) NOT NULL UNIQUE,
    search_count BIGINT NOT NULL DEFAULT 1,
    last_searched_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_keywords_keyword ON search_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_search_keywords_count ON search_keywords(search_count DESC);

-- =====================================================
-- 17. MEMBER_OAUTH 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS member_oauth (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_member_oauth UNIQUE (provider, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_member_oauth_member ON member_oauth(member_id);

-- =====================================================
-- 18. MAPPING 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS mapping (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    restaurant_name VARCHAR(200),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    address VARCHAR(255),
    address_detail VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mapping_member ON mapping(member_id);

-- =====================================================
-- 19. REPORTS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id BIGINT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resolved_at TIMESTAMP,
    resolved_by BIGINT,
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_report_status CHECK (status IN ('PENDING', 'RESOLVED', 'REJECTED'))
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

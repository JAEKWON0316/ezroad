-- EzRoad 백엔드 최적화 - DB 인덱스 추가
-- 실행 방법: Neon Dashboard > SQL Editor에서 실행
-- 작성일: 2025-12-12

-- ==================== members 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_nickname ON members(nickname);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at DESC);

-- ==================== member_oauth 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_member_oauth_provider_id ON member_oauth(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_member_oauth_member_id ON member_oauth(member_id);

-- ==================== restaurants 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_status_category ON restaurants(status, category);
CREATE INDEX IF NOT EXISTS idx_restaurants_created_at ON restaurants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants(name);

-- ==================== reviews 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_member_id ON reviews(member_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_deleted ON reviews(restaurant_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_reviews_member_deleted ON reviews(member_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ==================== reservations 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_reservations_member_id ON reservations(member_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_date ON reservations(restaurant_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);

-- ==================== follows 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_restaurant_id ON follows(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_restaurant ON follows(follower_id, restaurant_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_following ON follows(follower_id, following_id);

-- ==================== waitings 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_waitings_member_id ON waitings(member_id);
CREATE INDEX IF NOT EXISTS idx_waitings_restaurant_id ON waitings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waitings_restaurant_status ON waitings(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_waitings_created_at ON waitings(created_at DESC);

-- ==================== themes 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_themes_member_id ON themes(member_id);
CREATE INDEX IF NOT EXISTS idx_themes_is_public ON themes(is_public);
CREATE INDEX IF NOT EXISTS idx_themes_public_created ON themes(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_themes_public_likes ON themes(is_public, like_count DESC);
CREATE INDEX IF NOT EXISTS idx_themes_public_views ON themes(is_public, view_count DESC);

-- ==================== theme_restaurants 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_theme_restaurants_theme_id ON theme_restaurants(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_restaurants_restaurant_id ON theme_restaurants(restaurant_id);

-- ==================== theme_likes 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_theme_likes_theme_id ON theme_likes(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_likes_member_id ON theme_likes(member_id);
CREATE INDEX IF NOT EXISTS idx_theme_likes_theme_member ON theme_likes(theme_id, member_id);

-- ==================== menus 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_visible ON menus(is_visible);

-- ==================== search_keywords 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_search_keywords_count ON search_keywords(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_search_keywords_last_searched ON search_keywords(last_searched_at DESC);

-- ==================== reports 테이블 ====================
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

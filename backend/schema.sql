-- EzenRoad PostgreSQL Schema
-- Version: 1.1
-- Created: 2025-11-19
-- Tables: 12

-- =============================================
-- 1. MEMBERS (회원)
-- =============================================
CREATE TABLE members (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    nickname        VARCHAR(50) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    zipcode         VARCHAR(10),
    address         VARCHAR(255),
    address_detail  VARCHAR(255),
    birth_date      DATE,
    profile_image   VARCHAR(500),
    role            VARCHAR(20) NOT NULL DEFAULT 'USER',
    business_number VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,
    
    CONSTRAINT chk_member_role CHECK (role IN ('USER', 'BUSINESS', 'ADMIN'))
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_nickname ON members(nickname);
CREATE INDEX idx_members_role ON members(role);

-- =============================================
-- 2. RESTAURANTS (식당)
-- =============================================
CREATE TABLE restaurants (
    id              BIGSERIAL PRIMARY KEY,
    owner_id        BIGINT NOT NULL REFERENCES members(id),
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(50),
    description     TEXT,
    phone           VARCHAR(20),
    zipcode         VARCHAR(10),
    address         VARCHAR(255),
    address_detail  VARCHAR(255),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    website         VARCHAR(500),
    business_hours  VARCHAR(500),
    notice          TEXT,
    thumbnail       VARCHAR(500),
    avg_rating      DECIMAL(3, 2) DEFAULT 0,
    review_count    INTEGER DEFAULT 0,
    view_count      INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_restaurant_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
);

CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_category ON restaurants(category);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);

-- =============================================
-- 3. MENUS (메뉴)
-- =============================================
CREATE TABLE menus (
    id              BIGSERIAL PRIMARY KEY,
    restaurant_id   BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    price           INTEGER NOT NULL,
    description     TEXT,
    thumbnail       VARCHAR(500),
    is_visible      BOOLEAN DEFAULT true,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);
CREATE INDEX idx_menus_visible ON menus(is_visible);

-- =============================================
-- 4. REVIEWS (리뷰)
-- =============================================
CREATE TABLE reviews (
    id              BIGSERIAL PRIMARY KEY,
    restaurant_id   BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    member_id       BIGINT NOT NULL REFERENCES members(id),
    title           VARCHAR(200),
    content         TEXT NOT NULL,
    rating          INTEGER NOT NULL,
    view_count      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_member ON reviews(member_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- =============================================
-- 5. RESERVATIONS (예약)
-- =============================================
CREATE TABLE reservations (
    id              BIGSERIAL PRIMARY KEY,
    restaurant_id   BIGINT NOT NULL REFERENCES restaurants(id),
    member_id       BIGINT NOT NULL REFERENCES members(id),
    guest_count     INTEGER NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    request         TEXT,
    status          VARCHAR(20) DEFAULT 'PENDING',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_reservation_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))
);

CREATE INDEX idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX idx_reservations_member ON reservations(member_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);

-- =============================================
-- 6. FOLLOWS (팔로우/찜 통합)
-- =============================================
CREATE TABLE follows (
    id              BIGSERIAL PRIMARY KEY,
    follower_id     BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    following_id    BIGINT REFERENCES members(id) ON DELETE CASCADE,
    restaurant_id   BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_follow_target CHECK (
        (following_id IS NOT NULL AND restaurant_id IS NULL) OR
        (following_id IS NULL AND restaurant_id IS NOT NULL)
    )
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_restaurant ON follows(restaurant_id);
CREATE UNIQUE INDEX idx_follows_unique_member ON follows(follower_id, following_id) WHERE following_id IS NOT NULL;
CREATE UNIQUE INDEX idx_follows_unique_restaurant ON follows(follower_id, restaurant_id) WHERE restaurant_id IS NOT NULL;

-- =============================================
-- 7. WAITING (대기)
-- =============================================
CREATE TABLE waiting (
    id              BIGSERIAL PRIMARY KEY,
    restaurant_id   BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    member_id       BIGINT NOT NULL REFERENCES members(id),
    wait_number     INTEGER NOT NULL,
    guest_count     INTEGER DEFAULT 1,
    status          VARCHAR(20) DEFAULT 'WAITING',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_at       TIMESTAMP,
    
    CONSTRAINT chk_waiting_status CHECK (status IN ('WAITING', 'CALLED', 'SEATED', 'CANCELLED', 'NO_SHOW'))
);

CREATE INDEX idx_waiting_restaurant ON waiting(restaurant_id);
CREATE INDEX idx_waiting_member ON waiting(member_id);
CREATE INDEX idx_waiting_status ON waiting(status);

-- =============================================
-- 8. REVIEW_IMAGES (리뷰 이미지)
-- =============================================
CREATE TABLE review_images (
    id              BIGSERIAL PRIMARY KEY,
    review_id       BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    original_name   VARCHAR(255),
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_images_review ON review_images(review_id);

-- =============================================
-- 9. RESTAURANT_IMAGES (식당 이미지)
-- =============================================
CREATE TABLE restaurant_images (
    id              BIGSERIAL PRIMARY KEY,
    restaurant_id   BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    original_name   VARCHAR(255),
    file_size       BIGINT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurant_images_restaurant ON restaurant_images(restaurant_id);

-- =============================================
-- 10. MENU_IMAGES (메뉴 이미지)
-- =============================================
CREATE TABLE menu_images (
    id              BIGSERIAL PRIMARY KEY,
    menu_id         BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    original_name   VARCHAR(255),
    file_size       BIGINT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_images_menu ON menu_images(menu_id);

-- =============================================
-- 11. MENUPAN_IMAGES (메뉴판 이미지)
-- =============================================
CREATE TABLE menupan_images (
    id              BIGSERIAL PRIMARY KEY,
    restaurant_id   BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    original_name   VARCHAR(255),
    file_size       BIGINT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menupan_images_restaurant ON menupan_images(restaurant_id);

-- =============================================
-- 12. IMAGES (범용 이미지)
-- =============================================
CREATE TABLE images (
    id              BIGSERIAL PRIMARY KEY,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       BIGINT NOT NULL,
    image_url       VARCHAR(500) NOT NULL,
    original_name   VARCHAR(255),
    file_size       BIGINT,
    content_type    VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_entity ON images(entity_type, entity_id);

-- =============================================
-- 13. MAPPING (지도 매핑/저장 위치)
-- =============================================
CREATE TABLE mapping (
    id              BIGSERIAL PRIMARY KEY,
    member_id       BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    restaurant_name VARCHAR(200),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    address         VARCHAR(255),
    address_detail  VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mapping_member ON mapping(member_id);
CREATE INDEX idx_mapping_location ON mapping(latitude, longitude);

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE members IS '회원 정보';
COMMENT ON TABLE restaurants IS '식당 정보';
COMMENT ON TABLE menus IS '메뉴 정보';
COMMENT ON TABLE reviews IS '리뷰';
COMMENT ON TABLE reservations IS '예약';
COMMENT ON TABLE follows IS '팔로우 및 찜하기 (통합)';
COMMENT ON TABLE waiting IS '대기';
COMMENT ON TABLE review_images IS '리뷰 이미지';
COMMENT ON TABLE restaurant_images IS '식당 이미지';
COMMENT ON TABLE menu_images IS '메뉴 이미지';
COMMENT ON TABLE menupan_images IS '메뉴판 이미지';
COMMENT ON TABLE images IS '범용 이미지 저장소';
COMMENT ON TABLE mapping IS '지도 매핑/저장 위치'

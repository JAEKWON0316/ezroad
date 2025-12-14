-- EzRoad Supabase Migration - Schema (Part 1)
-- Generated: 2025-12-13
-- Source: Neon DB (Singapore) -> Supabase (Seoul)

-- =====================================================
-- 1. MEMBERS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS members (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(20),
    zipcode VARCHAR(10),
    address VARCHAR(255),
    address_detail VARCHAR(255),
    birth_date DATE,
    profile_image VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    business_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT chk_member_role CHECK (role IN ('USER', 'BUSINESS', 'ADMIN'))
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_nickname ON members(nickname);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- =====================================================
-- 2. RESTAURANTS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS restaurants (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    phone VARCHAR(20),
    zipcode VARCHAR(10),
    address VARCHAR(255),
    address_detail VARCHAR(255),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    website VARCHAR(500),
    business_hours VARCHAR(500),
    notice TEXT,
    thumbnail VARCHAR(500),
    menu_board_image VARCHAR(500),
    avg_rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_restaurant_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
);

CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);

-- =====================================================
-- 3. MENUS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS menus (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    thumbnail VARCHAR(500),
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menus_restaurant ON menus(restaurant_id);

-- =====================================================
-- 4. REVIEWS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    title VARCHAR(200),
    content TEXT NOT NULL,
    rating INTEGER NOT NULL,
    view_count INTEGER DEFAULT 0,
    hit INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_member ON reviews(member_id);

-- =====================================================
-- 5. RESERVATIONS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    guest_count INTEGER NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    request TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reservation_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))
);

CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_member ON reservations(member_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- =====================================================
-- 6. FOLLOWS 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    following_id BIGINT,
    restaurant_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_restaurant ON follows(restaurant_id);

-- =====================================================
-- 7. WAITING 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS waiting (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    guest_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'WAITING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP,
    estimated_wait_time INTEGER,
    waiting_number INTEGER NOT NULL,
    CONSTRAINT chk_waiting_status CHECK (status IN ('WAITING', 'CALLED', 'SEATED', 'CANCELLED', 'NO_SHOW'))
);

CREATE INDEX IF NOT EXISTS idx_waiting_restaurant ON waiting(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waiting_member ON waiting(member_id);

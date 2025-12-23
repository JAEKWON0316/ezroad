package com.ezroad.repository;

import com.ezroad.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

       // ==================== N+1 최적화 쿼리 ====================

       // 리뷰 전체 조회 (member, restaurant 함께 로딩)
       @EntityGraph(attributePaths = { "member", "restaurant" })
       Page<Review> findAllByDeletedAtIsNull(Pageable pageable);

       // 사진이 있는 리뷰만 조회
       @Query("SELECT DISTINCT r FROM Review r LEFT JOIN FETCH r.member LEFT JOIN FETCH r.restaurant " +
                     "WHERE r.deletedAt IS NULL AND EXISTS (SELECT 1 FROM ReviewImage ri WHERE ri.review = r)")
       Page<Review> findAllWithImagesByDeletedAtIsNull(Pageable pageable);

       // 사진이 있는 리뷰 개수
       @Query("SELECT COUNT(DISTINCT r) FROM Review r " +
                     "WHERE r.deletedAt IS NULL AND EXISTS (SELECT 1 FROM ReviewImage ri WHERE ri.review = r)")
       Long countWithImages();

       // 식당별 리뷰 조회 (member 함께 로딩)
       @EntityGraph(attributePaths = { "member" })
       Page<Review> findByRestaurantIdAndDeletedAtIsNull(Long restaurantId, Pageable pageable);

       // 식당별 사진리뷰 조회
       @Query("SELECT DISTINCT r FROM Review r LEFT JOIN FETCH r.member " +
                     "WHERE r.restaurant.id = :restaurantId AND r.deletedAt IS NULL " +
                     "AND EXISTS (SELECT 1 FROM ReviewImage ri WHERE ri.review = r)")
       Page<Review> findByRestaurantIdWithImagesByDeletedAtIsNull(@Param("restaurantId") Long restaurantId,
                     Pageable pageable);

       // 회원별 리뷰 조회 (restaurant 함께 로딩)
       @EntityGraph(attributePaths = { "restaurant" })
       Page<Review> findByMemberIdAndDeletedAtIsNull(Long memberId, Pageable pageable);

       // 리뷰 상세 조회 (모든 관계 로딩)
       @EntityGraph(attributePaths = { "member", "restaurant", "images" })
       Optional<Review> findWithDetailsById(Long id);

       // ==================== 통계 쿼리 ====================

       // 식당별 평균 평점 계산
       @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant.id = :restaurantId AND r.deletedAt IS NULL")
       Optional<Double> findAverageRatingByRestaurantId(@Param("restaurantId") Long restaurantId);

       // 식당별 리뷰 개수
       Long countByRestaurantIdAndDeletedAtIsNull(Long restaurantId);

       // 전체 리뷰 개수
       Long countByDeletedAtIsNull();

       // 회원별 리뷰 개수
       Long countByMemberIdAndDeletedAtIsNull(Long memberId);

       // ==================== 관리자용 ====================

       @EntityGraph(attributePaths = { "member", "restaurant" })
       @Query("SELECT r FROM Review r LEFT JOIN r.member m LEFT JOIN r.restaurant res " +
                     "WHERE (:keyword IS NULL OR r.content LIKE %:keyword% OR res.name LIKE %:keyword% OR m.nickname LIKE %:keyword%) "
                     +
                     "AND (:restaurantId IS NULL OR res.id = :restaurantId) " +
                     "AND r.deletedAt IS NULL")
       Page<Review> findBySearchKeyword(
                     @Param("keyword") String keyword,
                     @Param("restaurantId") Long restaurantId,
                     Pageable pageable);

       Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

       // ==================== 파트너(사업자)용 ====================

       Long countByRestaurantIdAndDeletedAtIsNullAndCreatedAtBetween(Long restaurantId, LocalDateTime start,
                     LocalDateTime end);

       // 최근 리뷰 목록 (파트너 대시보드용)
       @EntityGraph(attributePaths = { "member" })
       List<Review> findTop5ByRestaurantIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long restaurantId);

       // ==================== 예약 기반 리뷰 ====================

       // 예약 ID로 리뷰 조회 (1:1 매핑)
       Optional<Review> findByReservationId(Long reservationId);

       // 해당 예약에 리뷰가 있는지 확인
       boolean existsByReservationIdAndDeletedAtIsNull(Long reservationId);
}

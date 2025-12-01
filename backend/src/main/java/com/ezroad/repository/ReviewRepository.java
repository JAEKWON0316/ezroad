package com.ezroad.repository;

import com.ezroad.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // deletedAt이 null인 리뷰 전체 조회
    Page<Review> findAllByDeletedAtIsNull(Pageable pageable);
    
    // 식당별 리뷰 조회 (삭제되지 않은 것만)
    Page<Review> findByRestaurantIdAndDeletedAtIsNull(Long restaurantId, Pageable pageable);
    
    // 회원별 리뷰 조회 (삭제되지 않은 것만)
    Page<Review> findByMemberIdAndDeletedAtIsNull(Long memberId, Pageable pageable);
    
    // 식당별 평균 평점 계산 (삭제되지 않은 것만)
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant.id = :restaurantId AND r.deletedAt IS NULL")
    Optional<Double> findAverageRatingByRestaurantId(@Param("restaurantId") Long restaurantId);
    
    // 식당별 리뷰 개수 (삭제되지 않은 것만)
    Long countByRestaurantIdAndDeletedAtIsNull(Long restaurantId);
    
    // 회원별 리뷰 개수 (삭제되지 않은 것만)
    Long countByMemberIdAndDeletedAtIsNull(Long memberId);
    
    // ==================== 관리자용 ====================
    
    Page<Review> findByContentContaining(String keyword, Pageable pageable);
    
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // ==================== 파트너(사업자)용 ====================
    
    Long countByRestaurantIdAndDeletedAtIsNullAndCreatedAtBetween(Long restaurantId, LocalDateTime start, LocalDateTime end);
}

package com.ezroad.repository;

import com.ezroad.entity.Waiting;
import com.ezroad.entity.WaitingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WaitingRepository extends JpaRepository<Waiting, Long> {
    
    // ==================== N+1 최적화 쿼리 ====================
    
    // 식당별 대기 목록 (member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    List<Waiting> findByRestaurantIdAndStatusOrderByWaitingNumberAsc(Long restaurantId, WaitingStatus status);
    
    // 회원별 대기 목록 (restaurant 함께 로딩)
    @EntityGraph(attributePaths = {"restaurant"})
    List<Waiting> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    
    // 회원별 대기 (페이지네이션, restaurant 함께 로딩)
    @EntityGraph(attributePaths = {"restaurant"})
    Page<Waiting> findByMemberId(Long memberId, Pageable pageable);
    
    // 식당별 대기 (페이지네이션, member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    Page<Waiting> findByRestaurantId(Long restaurantId, Pageable pageable);
    
    // ==================== 통계 쿼리 ====================
    
    Integer countByRestaurantIdAndStatus(Long restaurantId, WaitingStatus status);
    
    // 당일 해당 식당의 대기 수 카운트
    @Query("SELECT COUNT(w) FROM Waiting w WHERE w.restaurant.id = :restaurantId AND w.createdAt >= :startOfDay")
    Integer countTodayWaitingsByRestaurant(@Param("restaurantId") Long restaurantId, @Param("startOfDay") LocalDateTime startOfDay);
    
    // 당일 WAITING 상태인 대기 수 (예상 대기 시간 계산용)
    @Query("SELECT COUNT(w) FROM Waiting w WHERE w.restaurant.id = :restaurantId AND w.status = :status AND w.createdAt >= :startOfDay")
    Integer countTodayWaitingsByRestaurantAndStatus(@Param("restaurantId") Long restaurantId, @Param("status") WaitingStatus status, @Param("startOfDay") LocalDateTime startOfDay);
    
    // 당일 특정 상태의 대기 목록 (순번 순 정렬)
    @EntityGraph(attributePaths = {"member"})
    @Query("SELECT w FROM Waiting w WHERE w.restaurant.id = :restaurantId AND w.status = :status AND w.createdAt >= :startOfDay ORDER BY w.waitingNumber ASC")
    List<Waiting> findActiveWaitingsByRestaurant(@Param("restaurantId") Long restaurantId, @Param("status") WaitingStatus status, @Param("startOfDay") LocalDateTime startOfDay);
}

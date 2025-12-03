package com.ezroad.repository;

import com.ezroad.entity.Waiting;
import com.ezroad.entity.WaitingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WaitingRepository extends JpaRepository<Waiting, Long> {
    
    List<Waiting> findByRestaurantIdAndStatusOrderByWaitingNumberAsc(Long restaurantId, WaitingStatus status);
    
    List<Waiting> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    
    Page<Waiting> findByMemberId(Long memberId, Pageable pageable);
    
    Page<Waiting> findByRestaurantId(Long restaurantId, Pageable pageable);
    
    Integer countByRestaurantIdAndStatus(Long restaurantId, WaitingStatus status);
    
    // 당일 해당 식당의 대기 수 카운트 (한국 시간 기준)
    @Query("SELECT COUNT(w) FROM Waiting w WHERE w.restaurant.id = :restaurantId AND w.createdAt >= :startOfDay")
    Integer countTodayWaitingsByRestaurant(@Param("restaurantId") Long restaurantId, @Param("startOfDay") LocalDateTime startOfDay);
    
    // 당일 WAITING 상태인 대기 수 (예상 대기 시간 계산용)
    @Query("SELECT COUNT(w) FROM Waiting w WHERE w.restaurant.id = :restaurantId AND w.status = :status AND w.createdAt >= :startOfDay")
    Integer countTodayWaitingsByRestaurantAndStatus(@Param("restaurantId") Long restaurantId, @Param("status") WaitingStatus status, @Param("startOfDay") LocalDateTime startOfDay);
}

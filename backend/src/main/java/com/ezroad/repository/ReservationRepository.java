package com.ezroad.repository;

import com.ezroad.entity.Reservation;
import com.ezroad.entity.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    // ==================== N+1 최적화 쿼리 ====================
    
    // 회원별 예약 목록 (restaurant 함께 로딩)
    @EntityGraph(attributePaths = {"restaurant"})
    Page<Reservation> findByMemberIdOrderByReservationDateDescReservationTimeDesc(Long memberId, Pageable pageable);
    
    // 식당별 예약 목록 (member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    Page<Reservation> findByRestaurantIdOrderByReservationDateDescReservationTimeDesc(Long restaurantId, Pageable pageable);
    
    // 회원별 예약 목록 (리스트, restaurant 함께 로딩)
    @EntityGraph(attributePaths = {"restaurant"})
    List<Reservation> findByMemberIdOrderByReservationDateDesc(Long memberId);
    
    // 식당별 예약 목록 (리스트, member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    List<Reservation> findByRestaurantIdOrderByReservationDateDesc(Long restaurantId);
    
    // 식당 + 날짜별 예약 (member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    List<Reservation> findByRestaurantIdAndReservationDate(Long restaurantId, LocalDate date);
    
    // 회원별 + 상태별 예약 (restaurant 함께 로딩)
    @EntityGraph(attributePaths = {"restaurant"})
    List<Reservation> findByMemberIdAndStatus(Long memberId, ReservationStatus status);
    
    // 식당별 + 상태별 예약 (member 함께 로딩)
    @EntityGraph(attributePaths = {"member"})
    List<Reservation> findByRestaurantIdAndStatus(Long restaurantId, ReservationStatus status);
    
    // ==================== 통계 ====================
    
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    Long countByStatus(ReservationStatus status);
    
    Long countByRestaurantIdAndCreatedAtBetween(Long restaurantId, LocalDateTime start, LocalDateTime end);
}

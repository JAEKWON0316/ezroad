package com.ezroad.repository;

import com.ezroad.entity.Reservation;
import com.ezroad.entity.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    // 회원별 예약 목록 (페이지네이션)
    Page<Reservation> findByMemberIdOrderByReservationDateDescReservationTimeDesc(Long memberId, Pageable pageable);
    
    // 식당별 예약 목록 (페이지네이션)
    Page<Reservation> findByRestaurantIdOrderByReservationDateDescReservationTimeDesc(Long restaurantId, Pageable pageable);
    
    // 회원별 예약 목록 (리스트)
    List<Reservation> findByMemberIdOrderByReservationDateDesc(Long memberId);
    
    // 식당별 예약 목록 (리스트)
    List<Reservation> findByRestaurantIdOrderByReservationDateDesc(Long restaurantId);
    
    // 식당 + 날짜별 예약
    List<Reservation> findByRestaurantIdAndReservationDate(Long restaurantId, LocalDate date);
    
    // 회원별 + 상태별 예약
    List<Reservation> findByMemberIdAndStatus(Long memberId, ReservationStatus status);
    
    // 식당별 + 상태별 예약
    List<Reservation> findByRestaurantIdAndStatus(Long restaurantId, ReservationStatus status);
    
    // ==================== 통계 ====================
    
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    Long countByStatus(ReservationStatus status);
    
    Long countByRestaurantIdAndCreatedAtBetween(Long restaurantId, LocalDateTime start, LocalDateTime end);
}

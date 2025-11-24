package com.ezroad.repository;

import com.ezroad.entity.Waiting;
import com.ezroad.entity.WaitingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaitingRepository extends JpaRepository<Waiting, Long> {
    
    List<Waiting> findByRestaurantIdAndStatusOrderByWaitingNumberAsc(Long restaurantId, WaitingStatus status);
    
    List<Waiting> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    
    Page<Waiting> findByMemberId(Long memberId, Pageable pageable);
    
    Page<Waiting> findByRestaurantId(Long restaurantId, Pageable pageable);
    
    Integer countByRestaurantIdAndStatus(Long restaurantId, WaitingStatus status);
}

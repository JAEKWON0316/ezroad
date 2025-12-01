package com.ezroad.repository;

import com.ezroad.entity.Restaurant;
import com.ezroad.entity.RestaurantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    
    Page<Restaurant> findByStatus(RestaurantStatus status, Pageable pageable);
    
    Page<Restaurant> findByStatusAndCategory(RestaurantStatus status, String category, Pageable pageable);
    
    Page<Restaurant> findByStatusAndNameContaining(RestaurantStatus status, String name, Pageable pageable);
    
    Page<Restaurant> findByStatusAndNameContainingAndCategory(RestaurantStatus status, String name, String category, Pageable pageable);
    
    List<Restaurant> findByOwnerId(Long ownerId);
    
    @Query("SELECT r FROM Restaurant r WHERE r.status = :status " +
           "AND (:category IS NULL OR r.category = :category) " +
           "AND (:keyword IS NULL OR r.name LIKE %:keyword% OR r.address LIKE %:keyword% OR r.description LIKE %:keyword%)")
    Page<Restaurant> searchRestaurants(@Param("status") RestaurantStatus status,
                                       @Param("category") String category,
                                       @Param("keyword") String keyword,
                                       Pageable pageable);
    
    // ==================== 관리자용 ====================
    
    Page<Restaurant> findByNameContaining(String name, Pageable pageable);
    
    Page<Restaurant> findByNameContainingAndStatus(String name, RestaurantStatus status, Pageable pageable);
    
    Long countByStatus(RestaurantStatus status);
}

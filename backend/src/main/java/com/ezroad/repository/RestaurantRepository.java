package com.ezroad.repository;

import com.ezroad.entity.Restaurant;
import com.ezroad.entity.RestaurantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    
    // ==================== N+1 최적화 쿼리 ====================
    
    // 식당 상세 조회 (owner 함께 로딩)
    @EntityGraph(attributePaths = {"owner"})
    Optional<Restaurant> findWithOwnerById(Long id);
    
    // 식당 목록 (owner 함께 로딩)
    @EntityGraph(attributePaths = {"owner"})
    Page<Restaurant> findByStatus(RestaurantStatus status, Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Restaurant> findByStatusAndCategory(RestaurantStatus status, String category, Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Restaurant> findByStatusAndNameContaining(RestaurantStatus status, String name, Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Restaurant> findByStatusAndNameContainingAndCategory(RestaurantStatus status, String name, String category, Pageable pageable);
    
    // 내 식당 목록 (owner 불필요 - 본인 것)
    List<Restaurant> findByOwnerId(Long ownerId);
    
    // 검색 쿼리 (owner 함께 로딩)
    @Query("SELECT r FROM Restaurant r JOIN FETCH r.owner WHERE r.status = :status " +
           "AND (:category IS NULL OR r.category = :category) " +
           "AND (:keyword IS NULL OR r.name LIKE %:keyword% OR r.address LIKE %:keyword% OR r.description LIKE %:keyword%)")
    Page<Restaurant> searchRestaurants(@Param("status") RestaurantStatus status,
                                       @Param("category") String category,
                                       @Param("keyword") String keyword,
                                       Pageable pageable);
    
    // ==================== 관리자용 ====================
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Restaurant> findByNameContaining(String name, Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Restaurant> findByNameContainingAndStatus(String name, RestaurantStatus status, Pageable pageable);
    
    Long countByStatus(RestaurantStatus status);
}

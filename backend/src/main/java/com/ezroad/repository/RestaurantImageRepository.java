package com.ezroad.repository;

import com.ezroad.entity.RestaurantImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantImageRepository extends JpaRepository<RestaurantImage, Long> {
    
    List<RestaurantImage> findByRestaurantIdOrderBySortOrderAsc(Long restaurantId);
    
    void deleteByRestaurantId(Long restaurantId);
}

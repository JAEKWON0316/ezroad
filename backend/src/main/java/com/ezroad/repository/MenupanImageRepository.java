package com.ezroad.repository;

import com.ezroad.entity.MenupanImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenupanImageRepository extends JpaRepository<MenupanImage, Long> {
    
    List<MenupanImage> findByRestaurantIdOrderBySortOrderAsc(Long restaurantId);
    
    void deleteByRestaurantId(Long restaurantId);
}

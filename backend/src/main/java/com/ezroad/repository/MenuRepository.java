package com.ezroad.repository;

import com.ezroad.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    List<Menu> findByRestaurantIdAndIsVisibleTrue(Long restaurantId);
    
    List<Menu> findByRestaurantIdOrderBySortOrderAsc(Long restaurantId);
    
    List<Menu> findByRestaurantId(Long restaurantId);
}

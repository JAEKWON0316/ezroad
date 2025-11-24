package com.ezroad.repository;

import com.ezroad.entity.MenuImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuImageRepository extends JpaRepository<MenuImage, Long> {
    
    List<MenuImage> findByMenuIdOrderBySortOrderAsc(Long menuId);
    
    void deleteByMenuId(Long menuId);
}

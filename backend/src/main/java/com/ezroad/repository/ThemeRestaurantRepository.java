package com.ezroad.repository;

import com.ezroad.entity.ThemeRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ThemeRestaurantRepository extends JpaRepository<ThemeRestaurant, Long> {

    // 테마의 식당 목록 (순서대로)
    List<ThemeRestaurant> findByThemeIdOrderBySortOrderAsc(Long themeId);

    // 테마에 특정 식당이 있는지 확인
    boolean existsByThemeIdAndRestaurantId(Long themeId, Long restaurantId);

    // 테마에서 특정 식당 찾기
    Optional<ThemeRestaurant> findByThemeIdAndRestaurantId(Long themeId, Long restaurantId);

    // 테마의 마지막 순서 조회
    @Query("SELECT COALESCE(MAX(tr.sortOrder), 0) FROM ThemeRestaurant tr WHERE tr.theme.id = :themeId")
    Integer findMaxSortOrderByThemeId(@Param("themeId") Long themeId);

    // 테마의 모든 식당 삭제
    @Modifying
    @Query("DELETE FROM ThemeRestaurant tr WHERE tr.theme.id = :themeId")
    void deleteByThemeId(@Param("themeId") Long themeId);

    // 테마의 식당 수
    long countByThemeId(Long themeId);
}

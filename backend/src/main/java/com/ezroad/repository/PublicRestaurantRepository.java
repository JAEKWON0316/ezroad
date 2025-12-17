package com.ezroad.repository;

import com.ezroad.entity.PublicRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface PublicRestaurantRepository extends JpaRepository<PublicRestaurant, Long> {

    // bbox 기반 조회 (지도 영역 내 데이터)
    @Query("SELECT p FROM PublicRestaurant p WHERE " +
           "p.latitude BETWEEN :minLat AND :maxLat AND " +
           "p.longitude BETWEEN :minLng AND :maxLng")
    List<PublicRestaurant> findByBbox(
        @Param("minLat") BigDecimal minLat,
        @Param("maxLat") BigDecimal maxLat,
        @Param("minLng") BigDecimal minLng,
        @Param("maxLng") BigDecimal maxLng
    );

    // bbox + limit (줌 레벨 낮을 때 성능용)
    @Query(value = "SELECT * FROM public_restaurants WHERE " +
           "latitude BETWEEN :minLat AND :maxLat AND " +
           "longitude BETWEEN :minLng AND :maxLng " +
           "LIMIT :limit", nativeQuery = true)
    List<PublicRestaurant> findByBboxWithLimit(
        @Param("minLat") BigDecimal minLat,
        @Param("maxLat") BigDecimal maxLat,
        @Param("minLng") BigDecimal minLng,
        @Param("maxLng") BigDecimal maxLng,
        @Param("limit") int limit
    );

    // bbox + 카테고리 필터
    @Query(value = "SELECT * FROM public_restaurants WHERE " +
           "latitude BETWEEN :minLat AND :maxLat AND " +
           "longitude BETWEEN :minLng AND :maxLng AND " +
           "category = :category " +
           "LIMIT :limit", nativeQuery = true)
    List<PublicRestaurant> findByBboxAndCategory(
        @Param("minLat") BigDecimal minLat,
        @Param("maxLat") BigDecimal maxLat,
        @Param("minLng") BigDecimal minLng,
        @Param("maxLng") BigDecimal maxLng,
        @Param("category") String category,
        @Param("limit") int limit
    );

    // 카테고리 목록 조회
    @Query("SELECT DISTINCT p.category FROM PublicRestaurant p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<String> findAllCategories();
}

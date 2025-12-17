package com.ezroad.controller;

import com.ezroad.dto.PublicRestaurantDetailDto;
import com.ezroad.dto.PublicRestaurantMapDto;
import com.ezroad.service.PublicRestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/public-restaurants")
@RequiredArgsConstructor
public class PublicRestaurantController {

    private final PublicRestaurantService publicRestaurantService;

    /**
     * bbox 영역 내 공공데이터 식당 조회 (지도용)
     * 
     * GET /api/public-restaurants/bbox?minLat=37.4&maxLat=37.6&minLng=126.8&maxLng=127.1&limit=500
     */
    @GetMapping("/bbox")
    public ResponseEntity<List<PublicRestaurantMapDto>> getByBbox(
            @RequestParam BigDecimal minLat,
            @RequestParam BigDecimal maxLat,
            @RequestParam BigDecimal minLng,
            @RequestParam BigDecimal maxLng,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "500") Integer limit) {

        List<PublicRestaurantMapDto> restaurants;
        
        if (category != null && !category.isEmpty()) {
            restaurants = publicRestaurantService.findByBboxAndCategory(
                    minLat, maxLat, minLng, maxLng, category, limit);
        } else {
            restaurants = publicRestaurantService.findByBbox(
                    minLat, maxLat, minLng, maxLng, limit);
        }

        return ResponseEntity.ok(restaurants);
    }

    /**
     * 공공데이터 식당 상세 정보
     * 
     * GET /api/public-restaurants/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PublicRestaurantDetailDto> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(publicRestaurantService.findById(id));
    }

    /**
     * 카테고리 목록 조회
     * 
     * GET /api/public-restaurants/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(publicRestaurantService.getAllCategories());
    }
}

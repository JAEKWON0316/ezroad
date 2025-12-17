package com.ezroad.service;

import com.ezroad.dto.PublicRestaurantDetailDto;
import com.ezroad.dto.PublicRestaurantMapDto;
import com.ezroad.entity.PublicRestaurant;
import com.ezroad.repository.PublicRestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicRestaurantService {

    private final PublicRestaurantRepository publicRestaurantRepository;

    // 기본 limit 값
    private static final int DEFAULT_LIMIT = 500;
    private static final int MAX_LIMIT = 2000;

    /**
     * bbox 영역 내 공공데이터 식당 조회 (지도용)
     */
    public List<PublicRestaurantMapDto> findByBbox(
            BigDecimal minLat, BigDecimal maxLat,
            BigDecimal minLng, BigDecimal maxLng,
            Integer limit) {
        
        int actualLimit = (limit != null && limit > 0) 
                ? Math.min(limit, MAX_LIMIT) 
                : DEFAULT_LIMIT;

        List<PublicRestaurant> restaurants = publicRestaurantRepository
                .findByBboxWithLimit(minLat, maxLat, minLng, maxLng, actualLimit);

        return restaurants.stream()
                .map(PublicRestaurantMapDto::from)
                .collect(Collectors.toList());
    }

    /**
     * bbox + 카테고리 필터
     */
    public List<PublicRestaurantMapDto> findByBboxAndCategory(
            BigDecimal minLat, BigDecimal maxLat,
            BigDecimal minLng, BigDecimal maxLng,
            String category, Integer limit) {
        
        int actualLimit = (limit != null && limit > 0) 
                ? Math.min(limit, MAX_LIMIT) 
                : DEFAULT_LIMIT;

        List<PublicRestaurant> restaurants = publicRestaurantRepository
                .findByBboxAndCategory(minLat, maxLat, minLng, maxLng, category, actualLimit);

        return restaurants.stream()
                .map(PublicRestaurantMapDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 상세 정보 조회
     */
    public PublicRestaurantDetailDto findById(Long id) {
        PublicRestaurant restaurant = publicRestaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공공데이터 식당을 찾을 수 없습니다: " + id));
        return PublicRestaurantDetailDto.from(restaurant);
    }

    /**
     * 카테고리 목록 조회
     */
    public List<String> getAllCategories() {
        return publicRestaurantRepository.findAllCategories();
    }
}

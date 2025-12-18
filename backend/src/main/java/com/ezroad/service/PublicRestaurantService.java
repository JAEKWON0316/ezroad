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

    private static final int DEFAULT_LIMIT = 500;
    private static final int MAX_LIMIT = 2000;

    /**
     * bbox 영역 내 공공데이터 식당 조회 (지도용)
     * ⭐ 중심점 기준 거리순 정렬로 클러스터 쏠림 방지
     */
    public List<PublicRestaurantMapDto> findByBbox(
            BigDecimal minLat, BigDecimal maxLat,
            BigDecimal minLng, BigDecimal maxLng,
            BigDecimal centerLat, BigDecimal centerLng,
            Integer limit) {
        
        int actualLimit = (limit != null && limit > 0) 
                ? Math.min(limit, MAX_LIMIT) 
                : DEFAULT_LIMIT;

        // centerLat/Lng가 없으면 bbox 중심점 계산
        BigDecimal cLat = centerLat != null ? centerLat 
                : minLat.add(maxLat).divide(BigDecimal.valueOf(2));
        BigDecimal cLng = centerLng != null ? centerLng 
                : minLng.add(maxLng).divide(BigDecimal.valueOf(2));

        List<PublicRestaurant> restaurants = publicRestaurantRepository
                .findByBboxWithLimit(minLat, maxLat, minLng, maxLng, cLat, cLng, actualLimit);

        return restaurants.stream()
                .map(PublicRestaurantMapDto::from)
                .collect(Collectors.toList());
    }

    /**
     * bbox + 카테고리 필터 (중심점 정렬 포함)
     */
    public List<PublicRestaurantMapDto> findByBboxAndCategory(
            BigDecimal minLat, BigDecimal maxLat,
            BigDecimal minLng, BigDecimal maxLng,
            BigDecimal centerLat, BigDecimal centerLng,
            String category, Integer limit) {
        
        int actualLimit = (limit != null && limit > 0) 
                ? Math.min(limit, MAX_LIMIT) 
                : DEFAULT_LIMIT;

        BigDecimal cLat = centerLat != null ? centerLat 
                : minLat.add(maxLat).divide(BigDecimal.valueOf(2));
        BigDecimal cLng = centerLng != null ? centerLng 
                : minLng.add(maxLng).divide(BigDecimal.valueOf(2));

        List<PublicRestaurant> restaurants = publicRestaurantRepository
                .findByBboxAndCategory(minLat, maxLat, minLng, maxLng, cLat, cLng, category, actualLimit);

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

package com.ezroad.service;

import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.entity.Restaurant;
import com.ezroad.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnerService {

    private final RestaurantRepository restaurantRepository;
    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final FollowRepository followRepository;

    /**
     * 내 식당 목록 조회
     */
    public List<RestaurantResponse> getMyRestaurants(Long ownerId) {
        List<Restaurant> restaurants = restaurantRepository.findByOwnerId(ownerId);
        return restaurants.stream()
                .map(RestaurantResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 파트너 대시보드 통계
     */
    public Map<String, Object> getDashboardStats(Long ownerId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Restaurant> myRestaurants = restaurantRepository.findByOwnerId(ownerId);
        
        if (myRestaurants.isEmpty()) {
            stats.put("totalRestaurants", 0);
            stats.put("totalReviews", 0L);
            stats.put("totalReservations", 0L);
            stats.put("totalFollowers", 0L);
            stats.put("avgRating", 0.0);
            stats.put("todayReservations", 0L);
            stats.put("todayReviews", 0L);
            stats.put("weekReservations", 0L);
            stats.put("weekReviews", 0L);
            return stats;
        }
        
        // 기본 통계
        stats.put("totalRestaurants", myRestaurants.size());
        
        long totalReviews = 0L;
        long totalFollowers = 0L;
        double totalRating = 0.0;
        int ratingCount = 0;
        
        for (Restaurant restaurant : myRestaurants) {
            Long reviewCount = reviewRepository.countByRestaurantIdAndDeletedAtIsNull(restaurant.getId());
            Long followerCount = followRepository.countByRestaurantId(restaurant.getId());
            Double avgRating = reviewRepository.findAverageRatingByRestaurantId(restaurant.getId()).orElse(0.0);
            
            totalReviews += reviewCount;
            totalFollowers += followerCount;
            if (avgRating > 0) {
                totalRating += avgRating;
                ratingCount++;
            }
        }
        
        stats.put("totalReviews", totalReviews);
        stats.put("totalFollowers", totalFollowers);
        stats.put("avgRating", ratingCount > 0 ? totalRating / ratingCount : 0.0);
        
        // 기간별 통계
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();
        
        long todayReservations = 0L;
        long todayReviews = 0L;
        long weekReservations = 0L;
        long weekReviews = 0L;
        long totalReservations = 0L;
        
        for (Restaurant restaurant : myRestaurants) {
            Long restaurantId = restaurant.getId();
            
            // 예약 통계
            totalReservations += reservationRepository.findByRestaurantIdOrderByReservationDateDesc(restaurantId).size();
            todayReservations += reservationRepository.countByRestaurantIdAndCreatedAtBetween(restaurantId, todayStart, todayEnd);
            weekReservations += reservationRepository.countByRestaurantIdAndCreatedAtBetween(restaurantId, weekStart, todayEnd);
            
            // 리뷰 통계
            todayReviews += reviewRepository.countByRestaurantIdAndDeletedAtIsNullAndCreatedAtBetween(restaurantId, todayStart, todayEnd);
            weekReviews += reviewRepository.countByRestaurantIdAndDeletedAtIsNullAndCreatedAtBetween(restaurantId, weekStart, todayEnd);
        }
        
        stats.put("totalReservations", totalReservations);
        stats.put("todayReservations", todayReservations);
        stats.put("todayReviews", todayReviews);
        stats.put("weekReservations", weekReservations);
        stats.put("weekReviews", weekReviews);
        
        return stats;
    }

    /**
     * 특정 식당 상세 통계
     */
    public Map<String, Object> getRestaurantStats(Long ownerId, Long restaurantId) {
        Map<String, Object> stats = new HashMap<>();
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("식당을 찾을 수 없습니다"));
        
        // 권한 확인
        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("권한이 없습니다");
        }
        
        stats.put("restaurant", RestaurantResponse.from(restaurant));
        stats.put("reviewCount", reviewRepository.countByRestaurantIdAndDeletedAtIsNull(restaurantId));
        stats.put("followerCount", followRepository.countByRestaurantId(restaurantId));
        stats.put("avgRating", reviewRepository.findAverageRatingByRestaurantId(restaurantId).orElse(0.0));
        stats.put("reservationCount", reservationRepository.findByRestaurantIdOrderByReservationDateDesc(restaurantId).size());
        
        return stats;
    }
}

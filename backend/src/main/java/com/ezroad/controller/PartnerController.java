package com.ezroad.controller;

import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('BUSINESS', 'ADMIN')")
public class PartnerController {

    private final PartnerService partnerService;

    /**
     * 내 식당 목록 조회
     */
    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants(
            @AuthenticationPrincipal Long ownerId) {
        return ResponseEntity.ok(partnerService.getMyRestaurants(ownerId));
    }

    /**
     * 파트너 대시보드 통계
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @AuthenticationPrincipal Long ownerId) {
        return ResponseEntity.ok(partnerService.getDashboardStats(ownerId));
    }

    /**
     * 특정 식당 상세 통계
     */
    @GetMapping("/restaurants/{restaurantId}/stats")
    public ResponseEntity<Map<String, Object>> getRestaurantStats(
            @AuthenticationPrincipal Long ownerId,
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(partnerService.getRestaurantStats(ownerId, restaurantId));
    }
}

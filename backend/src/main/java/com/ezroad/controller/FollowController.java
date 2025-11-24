package com.ezroad.controller;

import com.ezroad.dto.response.FollowResponse;
import com.ezroad.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    // 식당 팔로우
    @PostMapping("/restaurants/{restaurantId}")
    public ResponseEntity<Void> followRestaurant(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal Long memberId) {
        followService.followRestaurant(memberId, restaurantId);
        return ResponseEntity.ok().build();
    }

    // 식당 언팔로우
    @DeleteMapping("/restaurants/{restaurantId}")
    public ResponseEntity<Void> unfollowRestaurant(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal Long memberId) {
        followService.unfollowRestaurant(memberId, restaurantId);
        return ResponseEntity.noContent().build();
    }

    // 내가 팔로우한 식당 목록 (상세 정보)
    @GetMapping("/my/restaurants")
    public ResponseEntity<Page<FollowResponse>> getMyFollowedRestaurants(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(followService.getMyFollowedRestaurants(memberId, pageable));
    }

    // 내가 팔로우한 식당 ID 목록 (간단)
    @GetMapping("/my/restaurant-ids")
    public ResponseEntity<List<Long>> getMyFollowedRestaurantIds(
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(followService.getMyFollowedRestaurantIds(memberId));
    }

    // 팔로우 여부 확인
    @GetMapping("/restaurants/{restaurantId}/check")
    public ResponseEntity<Boolean> checkFollowing(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(followService.isFollowing(memberId, restaurantId));
    }

    // 식당 팔로워 수
    @GetMapping("/restaurants/{restaurantId}/count")
    public ResponseEntity<Long> getFollowerCount(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(followService.getFollowerCount(restaurantId));
    }
}

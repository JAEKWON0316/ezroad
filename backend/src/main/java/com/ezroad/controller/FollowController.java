package com.ezroad.controller;

import com.ezroad.dto.response.FollowResponse;
import com.ezroad.dto.response.MemberResponse;
import com.ezroad.dto.response.RestaurantResponse;
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

    // ==================== 식당 팔로우 ====================

    @PostMapping("/restaurants/{restaurantId}")
    public ResponseEntity<Void> followRestaurant(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal Long memberId) {
        followService.followRestaurant(memberId, restaurantId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/restaurants/{restaurantId}")
    public ResponseEntity<Void> unfollowRestaurant(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal Long memberId) {
        followService.unfollowRestaurant(memberId, restaurantId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my/restaurants")
    public ResponseEntity<Page<RestaurantResponse>> getMyFollowedRestaurants(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(followService.getMyFollowedRestaurants(memberId, pageable));
    }

    @GetMapping("/my/restaurant-ids")
    public ResponseEntity<List<Long>> getMyFollowedRestaurantIds(
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(followService.getMyFollowedRestaurantIds(memberId));
    }

    @GetMapping("/restaurants/{restaurantId}/check")
    public ResponseEntity<Boolean> checkFollowingRestaurant(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(followService.isFollowing(memberId, restaurantId));
    }

    @GetMapping("/restaurants/{restaurantId}/count")
    public ResponseEntity<Long> getRestaurantFollowerCount(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(followService.getFollowerCount(restaurantId));
    }

    // ==================== 회원 팔로우 ====================

    @PostMapping("/members/{followingId}")
    public ResponseEntity<Void> followMember(
            @PathVariable Long followingId,
            @AuthenticationPrincipal Long memberId) {
        followService.followMember(memberId, followingId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/members/{followingId}")
    public ResponseEntity<Void> unfollowMember(
            @PathVariable Long followingId,
            @AuthenticationPrincipal Long memberId) {
        followService.unfollowMember(memberId, followingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my/followers")
    public ResponseEntity<Page<MemberResponse>> getMyFollowers(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(followService.getMyFollowers(memberId, pageable));
    }

    @GetMapping("/my/following")
    public ResponseEntity<Page<MemberResponse>> getMyFollowing(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(followService.getMyFollowing(memberId, pageable));
    }

    @DeleteMapping("/followers/{followerId}")
    public ResponseEntity<Void> removeFollower(
            @PathVariable Long followerId,
            @AuthenticationPrincipal Long memberId) {
        followService.removeFollower(memberId, followerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/members/{targetId}/check")
    public ResponseEntity<Boolean> checkFollowingMember(
            @PathVariable Long targetId,
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(followService.isFollowingMember(memberId, targetId));
    }

    // ==================== 통계 ====================

    @GetMapping("/my/stats")
    public ResponseEntity<FollowStats> getMyFollowStats(@AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(new FollowStats(
                followService.getFollowersCount(memberId),
                followService.getFollowingCount(memberId),
                followService.getFavoriteRestaurantCount(memberId)
        ));
    }

    // 내부 DTO
    public record FollowStats(Long followerCount, Long followingCount, Long favoriteCount) {}
}

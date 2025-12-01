package com.ezroad.controller;

import com.ezroad.dto.response.MemberResponse;
import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.dto.response.ReviewResponse;
import com.ezroad.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ==================== 대시보드 ====================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==================== 회원 관리 ====================

    @GetMapping("/members")
    public ResponseEntity<Page<MemberResponse>> getMembers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getMembers(keyword, role, pageable));
    }

    @GetMapping("/members/{id}")
    public ResponseEntity<MemberResponse> getMember(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getMember(id));
    }

    @PatchMapping("/members/{id}/role")
    public ResponseEntity<MemberResponse> updateMemberRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateMemberRole(id, request.role()));
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        adminService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== 식당 관리 ====================

    @GetMapping("/restaurants")
    public ResponseEntity<Page<RestaurantResponse>> getRestaurants(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getRestaurants(keyword, status, pageable));
    }

    @GetMapping("/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurant(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getRestaurant(id));
    }

    @PatchMapping("/restaurants/{id}/status")
    public ResponseEntity<RestaurantResponse> updateRestaurantStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateRestaurantStatus(id, request.status()));
    }

    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        adminService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== 리뷰 관리 ====================

    @GetMapping("/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getReviews(keyword, pageable));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Request DTOs ====================

    public record RoleUpdateRequest(String role) {}
    public record StatusUpdateRequest(String status) {}
}

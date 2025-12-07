package com.ezroad.controller;

import com.ezroad.dto.response.MemberResponse;
import com.ezroad.dto.response.ReportResponse;
import com.ezroad.dto.response.RestaurantResponse;
import com.ezroad.dto.response.ReviewResponse;
import com.ezroad.dto.response.SearchKeywordResponse;
import com.ezroad.entity.Report.ReportStatus;
import com.ezroad.service.AdminService;
import com.ezroad.service.ReportService;
import com.ezroad.service.SearchKeywordService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;
    private final SearchKeywordService searchKeywordService;

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
    public record AdminNoteRequest(String adminNote) {}

    // ==================== 신고 관리 ====================

    @GetMapping("/reports")
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(required = false) ReportStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reportService.getReports(status, pageable));
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<ReportResponse> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReport(id));
    }

    @GetMapping("/reports/stats")
    public ResponseEntity<Map<String, Long>> getReportStats() {
        return ResponseEntity.ok(reportService.getReportStats());
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(
            @PathVariable Long id,
            @AuthenticationPrincipal Long adminId,
            @RequestBody AdminNoteRequest request) {
        return ResponseEntity.ok(reportService.resolveReport(id, adminId, request.adminNote()));
    }

    @PatchMapping("/reports/{id}/dismiss")
    public ResponseEntity<ReportResponse> dismissReport(
            @PathVariable Long id,
            @AuthenticationPrincipal Long adminId,
            @RequestBody AdminNoteRequest request) {
        return ResponseEntity.ok(reportService.dismissReport(id, adminId, request.adminNote()));
    }

    // ==================== 키워드 관리 ====================

    @GetMapping("/keywords")
    public ResponseEntity<List<SearchKeywordResponse>> getAllKeywords() {
        return ResponseEntity.ok(searchKeywordService.getAllKeywords());
    }

    @DeleteMapping("/keywords/{id}")
    public ResponseEntity<Void> deleteKeyword(@PathVariable Long id) {
        searchKeywordService.deleteKeyword(id);
        return ResponseEntity.noContent().build();
    }
}

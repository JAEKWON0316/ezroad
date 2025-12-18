package com.ezroad.controller;

import com.ezroad.dto.request.ThemeAddRestaurantRequest;
import com.ezroad.dto.request.ThemeCreateRequest;
import com.ezroad.dto.request.ThemeReorderRequest;
import com.ezroad.dto.request.ThemeUpdateRequest;
import com.ezroad.dto.response.ThemeDetailResponse;
import com.ezroad.dto.response.ThemeResponse;
import com.ezroad.service.ThemeLikeService;
import com.ezroad.service.ThemeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/themes")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;
    private final ThemeLikeService themeLikeService;

    @PostMapping
    public ResponseEntity<ThemeResponse> createTheme(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody ThemeCreateRequest request) {
        ThemeResponse response = themeService.createTheme(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ThemeResponse>> getPublicThemes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "createdAt") String sort,
            @PageableDefault(size = 12) Pageable pageable) {
        Page<ThemeResponse> response = themeService.getPublicThemes(keyword, sort, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<Page<ThemeResponse>> getMyThemes(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ThemeResponse> response = themeService.getMyThemes(memberId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my/all")
    public ResponseEntity<List<ThemeResponse>> getMyThemesList(
            @AuthenticationPrincipal Long memberId) {
        List<ThemeResponse> response = themeService.getMyThemesList(memberId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/top")
    public ResponseEntity<List<ThemeResponse>> getTopThemes() {
        List<ThemeResponse> response = themeService.getTopThemes();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThemeDetailResponse> getThemeDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId,
            HttpServletRequest request) {
        String viewerIdentifier = createViewerIdentifier(memberId, request);
        ThemeDetailResponse response = themeService.getThemeDetail(id, memberId, viewerIdentifier);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ThemeResponse> updateTheme(
            @AuthenticationPrincipal Long memberId,
            @PathVariable Long id,
            @Valid @RequestBody ThemeUpdateRequest request) {
        ThemeResponse response = themeService.updateTheme(memberId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTheme(
            @AuthenticationPrincipal Long memberId,
            @PathVariable Long id) {
        themeService.deleteTheme(memberId, id);
        return ResponseEntity.ok(Map.of("message", "테마가 삭제되었습니다"));
    }

    @PostMapping("/{id}/restaurants")
    public ResponseEntity<ThemeDetailResponse> addRestaurantToTheme(
            @AuthenticationPrincipal Long memberId,
            @PathVariable Long id,
            @Valid @RequestBody ThemeAddRestaurantRequest request) {
        ThemeDetailResponse response = themeService.addRestaurantToTheme(memberId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/restaurants/{restaurantId}")
    public ResponseEntity<ThemeDetailResponse> removeRestaurantFromTheme(
            @AuthenticationPrincipal Long memberId,
            @PathVariable Long id,
            @PathVariable Long restaurantId) {
        ThemeDetailResponse response = themeService.removeRestaurantFromTheme(memberId, id, restaurantId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/restaurants/order")
    public ResponseEntity<ThemeDetailResponse> reorderRestaurants(
            @AuthenticationPrincipal Long memberId,
            @PathVariable Long id,
            @Valid @RequestBody ThemeReorderRequest request) {
        ThemeDetailResponse response = themeService.reorderRestaurants(memberId, id, request);
        return ResponseEntity.ok(response);
    }

    // ========== 좋아요 API ==========

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> likeTheme(
            @AuthenticationPrincipal Long memberId,
            @PathVariable Long id) {
        themeLikeService.likeTheme(id, memberId);
        long likeCount = themeLikeService.getLikeCount(id);
        return ResponseEntity.ok(Map.of(
                "message", "좋아요가 등록되었습니다",
                "likeCount", likeCount,
                "isLiked", true
        ));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> unlikeTheme(
            @AuthenticationPrincipal Long memberId,
            @PathVariable Long id) {
        themeLikeService.unlikeTheme(id, memberId);
        long likeCount = themeLikeService.getLikeCount(id);
        return ResponseEntity.ok(Map.of(
                "message", "좋아요가 취소되었습니다",
                "likeCount", likeCount,
                "isLiked", false
        ));
    }

    @GetMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> checkLike(
            @AuthenticationPrincipal Long memberId,
            @PathVariable Long id) {
        boolean isLiked = memberId != null && themeLikeService.isLiked(id, memberId);
        long likeCount = themeLikeService.getLikeCount(id);
        return ResponseEntity.ok(Map.of(
                "isLiked", isLiked,
                "likeCount", likeCount
        ));
    }

    @GetMapping("/my/liked")
    public ResponseEntity<List<Long>> getMyLikedThemeIds(
            @AuthenticationPrincipal Long memberId) {
        List<Long> likedThemeIds = themeLikeService.getMyLikedThemeIds(memberId);
        return ResponseEntity.ok(likedThemeIds);
    }
    
    // ========== Helper Methods ==========
    
    /**
     * 조회자 식별자 생성
     * - 로그인 사용자: member:{memberId}
     * - 비로그인 사용자: ip:{SHA256(IP+UserAgent)}
     */
    private String createViewerIdentifier(Long memberId, HttpServletRequest request) {
        if (memberId != null) {
            return "member:" + memberId;
        }
        
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String raw = ip + ":" + (userAgent != null ? userAgent : "unknown");
        
        return "ip:" + hashString(raw);
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // X-Forwarded-For may contain multiple IPs, take the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip;
    }
    
    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().substring(0, 32); // 32자로 제한
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not found", e);
            return input.hashCode() + "";
        }
    }
}

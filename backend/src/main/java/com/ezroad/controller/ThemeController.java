package com.ezroad.controller;

import com.ezroad.dto.request.ThemeAddRestaurantRequest;
import com.ezroad.dto.request.ThemeCreateRequest;
import com.ezroad.dto.request.ThemeReorderRequest;
import com.ezroad.dto.request.ThemeUpdateRequest;
import com.ezroad.dto.response.ThemeDetailResponse;
import com.ezroad.dto.response.ThemeResponse;
import com.ezroad.service.ThemeService;
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

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/themes")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;

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
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ThemeResponse> response = themeService.getPublicThemes(keyword, pageable);
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
            @AuthenticationPrincipal Long memberId) {
        ThemeDetailResponse response = themeService.getThemeDetail(id, memberId);
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
}